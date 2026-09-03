// Package auth signs in against Firebase Authentication (Identity Toolkit REST)
// and keeps the session alive with the refresh token.
package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
	"time"
)

// Endpoints are variables so tests can point them at an httptest server.
var (
	IdentityURL = "https://identitytoolkit.googleapis.com/v1"
	TokenURL    = "https://securetoken.googleapis.com/v1"
	HTTPClient  = &http.Client{Timeout: 20 * time.Second}
)

// Session is what a signed-in user holds in memory.
type Session struct {
	UID          string
	Email        string
	IDToken      string
	RefreshToken string
	ExpiresAt    time.Time
}

// Error is a Firebase error mapped to a short message for people.
type Error struct {
	Code    string // Firebase code, e.g. INVALID_PASSWORD
	Message string // what the UI shows
}

func (e *Error) Error() string { return e.Message }

var messages = map[string]string{
	"EMAIL_NOT_FOUND":             "no account with that email",
	"INVALID_PASSWORD":            "wrong password",
	"INVALID_LOGIN_CREDENTIALS":   "wrong email or password",
	"USER_DISABLED":               "this account is disabled",
	"EMAIL_EXISTS":                "an account with that email already exists",
	"WEAK_PASSWORD":               "password must be at least 6 characters",
	"INVALID_EMAIL":               "that is not a valid email",
	"TOO_MANY_ATTEMPTS_TRY_LATER": "too many attempts, try again later",
	"TOKEN_EXPIRED":               "session expired, sign in again",
	"USER_NOT_FOUND":              "session expired, sign in again",
	"INVALID_REFRESH_TOKEN":       "session expired, sign in again",
	"OPERATION_NOT_ALLOWED":       "email sign-in is not enabled on the project",
}

func mapError(code string) error {
	c := strings.SplitN(code, " ", 2)[0] // Firebase appends " : detail" sometimes
	if m, ok := messages[c]; ok {
		return &Error{Code: c, Message: m}
	}
	return &Error{Code: c, Message: "sign-in failed (" + c + ")"}
}

type signInResp struct {
	IDToken      string `json:"idToken"`
	RefreshToken string `json:"refreshToken"`
	ExpiresIn    string `json:"expiresIn"`
	LocalID      string `json:"localId"`
	Email        string `json:"email"`
}

func post(ctx context.Context, url string, body any, out any) error {
	b, _ := json.Marshal(body)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := HTTPClient.Do(req)
	if err != nil {
		return &Error{Code: "NETWORK", Message: "cannot reach Firebase: " + err.Error()}
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	if res.StatusCode >= 400 {
		var e struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		_ = json.Unmarshal(data, &e)
		if e.Error.Message == "" {
			return &Error{Code: strconv.Itoa(res.StatusCode), Message: "Firebase returned " + res.Status}
		}
		return mapError(e.Error.Message)
	}
	return json.Unmarshal(data, out)
}

func toSession(r signInResp) Session {
	secs, _ := strconv.Atoi(r.ExpiresIn)
	if secs == 0 {
		secs = 3600
	}
	return Session{UID: r.LocalID, Email: r.Email, IDToken: r.IDToken, RefreshToken: r.RefreshToken, ExpiresAt: time.Now().Add(time.Duration(secs) * time.Second)}
}

// SignIn with email and password.
func SignIn(ctx context.Context, apiKey, email, password string) (Session, error) {
	var r signInResp
	err := post(ctx, IdentityURL+"/accounts:signInWithPassword?key="+apiKey,
		map[string]any{"email": email, "password": password, "returnSecureToken": true}, &r)
	if err != nil {
		return Session{}, err
	}
	return toSession(r), nil
}

// SignUp creates an email and password account and signs it in.
func SignUp(ctx context.Context, apiKey, email, password string) (Session, error) {
	var r signInResp
	err := post(ctx, IdentityURL+"/accounts:signUp?key="+apiKey,
		map[string]any{"email": email, "password": password, "returnSecureToken": true}, &r)
	if err != nil {
		return Session{}, err
	}
	return toSession(r), nil
}

// SendPasswordReset emails a reset link.
func SendPasswordReset(ctx context.Context, apiKey, email string) error {
	var r map[string]any
	return post(ctx, IdentityURL+"/accounts:sendOobCode?key="+apiKey,
		map[string]any{"requestType": "PASSWORD_RESET", "email": email}, &r)
}

// Refresh exchanges a refresh token for a fresh ID token.
func Refresh(ctx context.Context, apiKey, refreshToken string) (Session, error) {
	var r struct {
		IDToken      string `json:"id_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    string `json:"expires_in"`
		UserID       string `json:"user_id"`
	}
	err := post(ctx, TokenURL+"/token?key="+apiKey,
		map[string]any{"grant_type": "refresh_token", "refresh_token": refreshToken}, &r)
	if err != nil {
		return Session{}, err
	}
	s := toSession(signInResp{IDToken: r.IDToken, RefreshToken: r.RefreshToken, ExpiresIn: r.ExpiresIn, LocalID: r.UserID})
	return s, nil
}

// Lookup fills the email for a session that came from a refresh.
func Lookup(ctx context.Context, apiKey, idToken string) (email string, err error) {
	var r struct {
		Users []struct {
			Email string `json:"email"`
		} `json:"users"`
	}
	if err := post(ctx, IdentityURL+"/accounts:lookup?key="+apiKey, map[string]any{"idToken": idToken}, &r); err != nil {
		return "", err
	}
	if len(r.Users) == 0 {
		return "", errors.New("no user for token")
	}
	return r.Users[0].Email, nil
}

// ErrSignedOut is returned by Manager.Token when there is no session.
var ErrSignedOut = fmt.Errorf("signed out")
