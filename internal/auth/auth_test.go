package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"organizer/internal/keychain"
)

// fake Identity Toolkit + Secure Token endpoints.
func fakeFirebase(t *testing.T) (*httptest.Server, *int) {
	refreshes := 0
	mux := http.NewServeMux()
	mux.HandleFunc("/v1/accounts:signInWithPassword", func(w http.ResponseWriter, r *http.Request) {
		var in map[string]any
		_ = json.NewDecoder(r.Body).Decode(&in)
		if in["password"] != "secret1" {
			w.WriteHeader(400)
			_, _ = w.Write([]byte(`{"error":{"message":"INVALID_PASSWORD"}}`))
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"idToken": "id-1", "refreshToken": "rt-1", "expiresIn": "3600", "localId": "u1", "email": in["email"]})
	})
	mux.HandleFunc("/v1/token", func(w http.ResponseWriter, r *http.Request) {
		refreshes++
		var in map[string]any
		_ = json.NewDecoder(r.Body).Decode(&in)
		if in["refresh_token"] == "dead" {
			w.WriteHeader(400)
			_, _ = w.Write([]byte(`{"error":{"message":"TOKEN_EXPIRED"}}`))
			return
		}
		_ = json.NewEncoder(w).Encode(map[string]any{"id_token": "id-2", "refresh_token": "rt-2", "expires_in": "3600", "user_id": "u1"})
	})
	mux.HandleFunc("/v1/accounts:lookup", func(w http.ResponseWriter, r *http.Request) {
		_ = json.NewEncoder(w).Encode(map[string]any{"users": []map[string]any{{"email": "p@x.cl"}}})
	})
	srv := httptest.NewServer(mux)
	IdentityURL = srv.URL + "/v1"
	TokenURL = srv.URL + "/v1"
	t.Cleanup(srv.Close)
	return srv, &refreshes
}

func TestSignInRememberAndRefresh(t *testing.T) {
	_, refreshes := fakeFirebase(t)
	kc := keychain.NewMemory()
	m := NewManager("k", kc)
	ctx := context.Background()

	if _, err := m.SignIn(ctx, "p@x.cl", "nope"); err == nil || !strings.Contains(err.Error(), "wrong password") {
		t.Fatalf("expected mapped error, got %v", err)
	}
	acc, err := m.SignIn(ctx, "p@x.cl", "secret1")
	if err != nil || !acc.SignedIn || acc.UID != "u1" {
		t.Fatalf("sign in: %+v %v", acc, err)
	}
	if v, _ := kc.Get(refreshItem); v != "rt-1" {
		t.Errorf("refresh token not remembered: %q", v)
	}
	if tok, _ := m.Token(ctx); tok != "id-1" || *refreshes != 0 {
		t.Errorf("fresh token should not refresh: %s %d", tok, *refreshes)
	}
	// Simulate a restart: only the refresh token survives.
	m2 := NewManager("k", kc)
	if m2.Account().SignedIn != true || m2.Account().Email != "p@x.cl" {
		t.Errorf("restart should remember the account: %+v", m2.Account())
	}
	tok, err := m2.Token(ctx)
	if err != nil || tok != "id-2" || *refreshes != 1 {
		t.Fatalf("refresh after restart: %s %v %d", tok, err, *refreshes)
	}
	if v, _ := kc.Get(refreshItem); v != "rt-2" {
		t.Errorf("rotated refresh token not stored: %q", v)
	}
	// Expiry forces a refresh.
	m2.session.ExpiresAt = time.Now().Add(time.Minute)
	if _, err := m2.Token(ctx); err != nil || *refreshes != 2 {
		t.Errorf("near-expiry should refresh: %v %d", err, *refreshes)
	}
	if err := m2.SignOut(); err != nil {
		t.Fatal(err)
	}
	if _, err := m2.Token(ctx); err != ErrSignedOut {
		t.Errorf("after sign out: %v", err)
	}
}

func TestDeadRefreshTokenSignsOut(t *testing.T) {
	fakeFirebase(t)
	kc := keychain.NewMemory()
	_ = kc.Set(refreshItem, "dead")
	m := NewManager("k", kc)
	if _, err := m.Token(context.Background()); err != ErrSignedOut {
		t.Fatalf("want ErrSignedOut, got %v", err)
	}
	if _, err := kc.Get(refreshItem); err != keychain.ErrNotFound {
		t.Error("dead token should be removed")
	}
}
