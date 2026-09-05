package record

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// fakeRecord is the record as the organizer sees it: three write endpoints,
// bearer-authenticated, remembering every call in order.
type fakeRecord struct {
	devToken   string
	factoryKey string
	calls      []string          // "METHOD path" in order
	bodies     map[string]string // path -> last body
	cellStatus int               // what POST .../cells answers; 0 means 204
}

func (f *fakeRecord) handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := json.Marshal(json.RawMessage(mustRead(r)))
		f.calls = append(f.calls, r.Method+" "+r.URL.Path)
		if f.bodies == nil {
			f.bodies = map[string]string{}
		}
		f.bodies[r.URL.Path] = string(raw)
		auth := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		w.Header().Set("Content-Type", "application/json")
		switch {
		case r.URL.Path == "/v1/factories/keys":
			if auth != f.devToken {
				w.WriteHeader(401)
				w.Write([]byte(`{"error":"bad developer token"}`))
				return
			}
			var in struct{ Factory string }
			json.Unmarshal(raw, &in)
			w.WriteHeader(201)
			json.NewEncoder(w).Encode(map[string]string{"key": "fk_" + in.Factory + "_" + string(rune('a'+len(f.calls))), "factory": in.Factory})
		case strings.HasSuffix(r.URL.Path, "/keys/revoke"):
			if auth != f.devToken {
				w.WriteHeader(401)
				return
			}
			w.WriteHeader(204)
		case strings.HasSuffix(r.URL.Path, "/cells"):
			if auth != f.factoryKey {
				w.WriteHeader(403)
				w.Write([]byte(`{"error":"key is for another factory"}`))
				return
			}
			if f.cellStatus != 0 {
				w.WriteHeader(f.cellStatus)
				return
			}
			w.WriteHeader(204)
		default:
			w.WriteHeader(404)
		}
	})
}

func mustRead(r *http.Request) []byte {
	var b strings.Builder
	buf := make([]byte, 4096)
	for {
		n, err := r.Body.Read(buf)
		b.Write(buf[:n])
		if err != nil {
			break
		}
	}
	if b.Len() == 0 {
		return []byte("null")
	}
	return []byte(b.String())
}

func TestIssueRevokeAndRegister(t *testing.T) {
	f := &fakeRecord{devToken: "id-token", factoryKey: "fk_lodestar_b"}
	srv := httptest.NewServer(f.handler())
	defer srv.Close()
	c := New(srv.URL + "/")
	ctx := context.Background()

	key, err := c.IssueKey(ctx, "id-token", "lodestar")
	if err != nil || key != "fk_lodestar_b" {
		t.Fatalf("issue: %q %v", key, err)
	}
	if f.bodies["/v1/factories/keys"] != `{"factory":"lodestar"}` {
		t.Errorf("issue body %s", f.bodies["/v1/factories/keys"])
	}
	if _, err := c.IssueKey(ctx, "wrong", "lodestar"); err == nil || !strings.Contains(err.Error(), "401") || !strings.Contains(err.Error(), "bad developer token") {
		t.Errorf("a 401 should carry the record's message: %v", err)
	}

	if err := c.RevokeKey(ctx, "id-token", "lodestar", KeyHash("old")); err != nil {
		t.Fatal(err)
	}
	if got := f.bodies["/v1/factories/lodestar/keys/revoke"]; got != `{"key_hash":"`+KeyHash("old")+`"}` {
		t.Errorf("revoke body %s", got)
	}
	if len(KeyHash("x")) != 64 || KeyHash("x") == KeyHash("y") {
		t.Error("KeyHash should be sha256 hex")
	}

	cell := Cell{Cell: "camp", Initiative: "ccint-camp", Title: "Camp", Client: "acme"}
	if err := c.RegisterCell(ctx, "fk_lodestar_b", "lodestar", cell); err != nil {
		t.Fatal(err)
	}
	if got := f.bodies["/v1/factories/lodestar/cells"]; got != `{"cell":"camp","initiative":"ccint-camp","title":"Camp","client":"acme"}` {
		t.Errorf("cell body %s", got)
	}
	// Another factory's key: the record refuses and so do we.
	err = c.RegisterCell(ctx, "someone-else", "lodestar", cell)
	var re *Error
	if !errors.As(err, &re) || re.Status != 403 {
		t.Errorf("403 should surface: %v", err)
	}
	// A conflict is "already registered", not a failure.
	f.cellStatus = 409
	if err := c.RegisterCell(ctx, "fk_lodestar_b", "lodestar", cell); err != nil {
		t.Errorf("409 should count as registered: %v", err)
	}
	f.cellStatus = 500
	if err := c.RegisterCell(ctx, "fk_lodestar_b", "lodestar", cell); err == nil {
		t.Error("500 is a failure")
	}
}

func TestKeyFileIsPrivate(t *testing.T) {
	dir := filepath.Join(t.TempDir(), "discuss")
	if _, err := ReadKey(dir); !errors.Is(err, os.ErrNotExist) {
		t.Errorf("missing key should be ErrNotExist: %v", err)
	}
	if err := WriteKey(dir, "fk_1"); err != nil {
		t.Fatal(err)
	}
	// Loosen it, write again: the mode must come back.
	os.Chmod(filepath.Join(dir, KeyFile), 0o644)
	if err := WriteKey(dir, "fk_2"); err != nil {
		t.Fatal(err)
	}
	st, _ := os.Stat(filepath.Join(dir, KeyFile))
	if st.Mode().Perm() != 0o600 {
		t.Errorf("key mode %o, want 600", st.Mode().Perm())
	}
	if dst, _ := os.Stat(dir); dst.Mode().Perm() != 0o700 {
		t.Errorf("dir mode %o, want 700", dst.Mode().Perm())
	}
	if k, err := ReadKey(dir); err != nil || k != "fk_2" {
		t.Errorf("read %q %v", k, err)
	}
	if _, err := Factory(dir); !errors.Is(err, os.ErrNotExist) {
		t.Error("missing factory should be ErrNotExist")
	}
	if err := WriteFactory(dir, "lodestar"); err != nil {
		t.Fatal(err)
	}
	if id, _ := Factory(dir); id != "lodestar" {
		t.Errorf("factory %q", id)
	}
}

func TestSetPushMergesProjects(t *testing.T) {
	dir := t.TempDir()
	// bootstrap.sh wrote another cell, with a field this code does not know.
	os.WriteFile(filepath.Join(dir, ProjectsFile), []byte(`{"plv-auth": {"push": true, "since": "2026-09-01"}}`), 0o644)
	if err := SetPush(dir, "camp", false); err != nil {
		t.Fatal(err)
	}
	if err := SetPush(dir, "plv-auth", false); err != nil {
		t.Fatal(err)
	}
	var got map[string]map[string]any
	b, _ := os.ReadFile(filepath.Join(dir, ProjectsFile))
	if err := json.Unmarshal(b, &got); err != nil {
		t.Fatal(err)
	}
	if got["camp"]["push"] != false || got["plv-auth"]["push"] != false || got["plv-auth"]["since"] != "2026-09-01" {
		t.Errorf("merge lost something: %s", b)
	}
	if err := SetPush(dir, "", true); err == nil {
		t.Error("empty project should fail")
	}
	// No file yet: starts from {}.
	fresh := filepath.Join(t.TempDir(), "state")
	if err := SetPush(fresh, "camp", true); err != nil {
		t.Fatal(err)
	}
	b, _ = os.ReadFile(filepath.Join(fresh, ProjectsFile))
	if !strings.Contains(string(b), `"push": true`) {
		t.Errorf("fresh file %s", b)
	}
	// A corrupt file is refused, never overwritten.
	os.WriteFile(filepath.Join(dir, ProjectsFile), []byte(`{nope`), 0o644)
	if err := SetPush(dir, "camp", true); err == nil {
		t.Error("corrupt projects.json should be an error")
	}
}

func TestCellPush(t *testing.T) {
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "agents"), 0o755)
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"camp","agents":["a"]}`), 0o644)
	if p, err := CellPush(root); err != nil || p {
		t.Errorf("absent push means false: %v %v", p, err)
	}
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"camp","agents":["a"],"push":true}`), 0o644)
	if p, err := CellPush(root); err != nil || !p {
		t.Errorf("push true: %v %v", p, err)
	}
	if _, err := CellPush(t.TempDir()); err == nil {
		t.Error("no cell.json is an error for the caller to read")
	}
}
