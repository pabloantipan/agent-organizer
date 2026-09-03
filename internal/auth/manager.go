package auth

import (
	"context"
	"errors"
	"sync"
	"time"

	"organizer/internal/keychain"
)

const refreshItem = "refresh_token"
const emailItem = "account_email"

// Manager keeps the session in memory and the refresh token in the keychain.
type Manager struct {
	mu      sync.Mutex
	apiKey  string
	kc      keychain.Store
	session *Session
}

// NewManager loads a remembered refresh token, if any. It does not call the
// network; the first Token() does.
func NewManager(apiKey string, kc keychain.Store) *Manager {
	m := &Manager{apiKey: apiKey, kc: kc}
	if rt, err := kc.Get(refreshItem); err == nil && rt != "" {
		email, _ := kc.Get(emailItem)
		m.session = &Session{RefreshToken: rt, Email: email}
	}
	return m
}

// SetAPIKey updates the key when settings change.
func (m *Manager) SetAPIKey(k string) { m.mu.Lock(); m.apiKey = k; m.mu.Unlock() }

// Account is what the UI shows: empty when signed out.
type Account struct {
	SignedIn bool   `json:"signed_in"`
	Email    string `json:"email"`
	UID      string `json:"uid"`
}

func (m *Manager) Account() Account {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.session == nil {
		return Account{}
	}
	return Account{SignedIn: true, Email: m.session.Email, UID: m.session.UID}
}

func (m *Manager) remember(s Session) error {
	if err := m.kc.Set(refreshItem, s.RefreshToken); err != nil {
		return err
	}
	_ = m.kc.Set(emailItem, s.Email)
	m.session = &s
	return nil
}

// SignIn and remember the session on this machine.
func (m *Manager) SignIn(ctx context.Context, email, password string) (Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.apiKey == "" {
		return Account{}, errors.New("firebase_api_key is not set in the config")
	}
	s, err := SignIn(ctx, m.apiKey, email, password)
	if err != nil {
		return Account{}, err
	}
	if err := m.remember(s); err != nil {
		return Account{}, err
	}
	return Account{SignedIn: true, Email: s.Email, UID: s.UID}, nil
}

// SignUp creates the account and signs in.
func (m *Manager) SignUp(ctx context.Context, email, password string) (Account, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.apiKey == "" {
		return Account{}, errors.New("firebase_api_key is not set in the config")
	}
	s, err := SignUp(ctx, m.apiKey, email, password)
	if err != nil {
		return Account{}, err
	}
	if err := m.remember(s); err != nil {
		return Account{}, err
	}
	return Account{SignedIn: true, Email: s.Email, UID: s.UID}, nil
}

// SignOut forgets the session here. The account still exists.
func (m *Manager) SignOut() error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.session = nil
	_ = m.kc.Delete(emailItem)
	return m.kc.Delete(refreshItem)
}

// ResetPassword sends the email.
func (m *Manager) ResetPassword(ctx context.Context, email string) error {
	m.mu.Lock()
	key := m.apiKey
	m.mu.Unlock()
	if key == "" {
		return errors.New("firebase_api_key is not set in the config")
	}
	return SendPasswordReset(ctx, key, email)
}

// Token returns a valid ID token, refreshing when less than five minutes
// remain. ErrSignedOut when there is no session; a network error leaves the
// session in place so the next call can retry.
func (m *Manager) Token(ctx context.Context) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.session == nil {
		return "", ErrSignedOut
	}
	if m.session.IDToken != "" && time.Until(m.session.ExpiresAt) > 5*time.Minute {
		return m.session.IDToken, nil
	}
	s, err := Refresh(ctx, m.apiKey, m.session.RefreshToken)
	if err != nil {
		var fe *Error
		if errors.As(err, &fe) && fe.Code != "NETWORK" {
			// The refresh token is dead: forget it so the UI asks to sign in.
			m.session = nil
			_ = m.kc.Delete(refreshItem)
			return "", ErrSignedOut
		}
		return "", err
	}
	if m.session.Email == "" {
		if email, err := Lookup(ctx, m.apiKey, s.IDToken); err == nil {
			s.Email = email
			_ = m.kc.Set(emailItem, email)
		}
	} else {
		s.Email = m.session.Email
	}
	if err := m.remember(s); err != nil {
		return "", err
	}
	return s.IDToken, nil
}

// UID returns the signed-in user id, refreshing if needed.
func (m *Manager) UID(ctx context.Context) (string, error) {
	if _, err := m.Token(ctx); err != nil {
		return "", err
	}
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.session == nil {
		return "", ErrSignedOut
	}
	return m.session.UID, nil
}
