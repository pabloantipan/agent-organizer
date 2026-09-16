package service

import (
	"context"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
)

func at(t *testing.T) func() time.Time {
	t.Helper()
	now := time.Date(2026, 9, 16, 10, 0, 0, 0, time.UTC)
	return func() time.Time { return now }
}

// With auth off sync is a skip that says so and is not an error: the app is
// meant to run this way, so nothing about it is a warning.
func TestSyncSkipsWhenAuthOff(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	cfg := config.Config{Machine: "lodestar", Auth: config.AuthOff, GCPProject: "p", FirebaseAPIKey: "k"}
	res, err := NewWith(cfg, cache.State{}, at(t)).Sync(context.Background(), true, true)
	if err != nil {
		t.Fatalf("auth off must not be an error: %v", err)
	}
	if res.Skipped != "auth off" {
		t.Errorf("skipped = %q, want %q", res.Skipped, "auth off")
	}
	if res.Pushed != 0 || res.Machines != nil {
		t.Errorf("nothing may be pushed or pulled: %+v", res)
	}
}

// With firebase the old order of checks stands: the auth-off short circuit
// does not fire, so an unconfigured project is still what sync reports.
func TestSyncWithFirebaseReachesTheOldChecks(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	cfg := config.Config{Machine: "lodestar", Auth: config.AuthFirebase}
	res, err := NewWith(cfg, cache.State{}, at(t)).Sync(context.Background(), true, true)
	if err != nil {
		t.Fatalf("unconfigured project is a skip, not an error: %v", err)
	}
	if res.Skipped != "gcp_project is not set in the config" {
		t.Errorf("skipped = %q, want the gcp_project reason", res.Skipped)
	}
}

// The account view is empty with auth off whatever the keychain holds, and
// is the auth manager's own answer with firebase.
func TestAccountViewFollowsTheMode(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	off := NewWith(config.Config{Machine: "lodestar"}, cache.State{}, at(t))
	if off.AuthMode() != config.AuthOff {
		t.Fatalf("empty auth must read as off, got %q", off.AuthMode())
	}
	if acc := off.Account(); acc.SignedIn || acc.Email != "" || acc.UID != "" {
		t.Errorf("auth off must have no account, got %+v", acc)
	}
	if _, err := off.SignIn(context.Background(), "p@x.cl", "pw"); err != ErrAuthOff {
		t.Errorf("SignIn with auth off = %v, want ErrAuthOff", err)
	}
	if _, err := off.SignUp(context.Background(), "p@x.cl", "pw"); err != ErrAuthOff {
		t.Errorf("SignUp with auth off = %v, want ErrAuthOff", err)
	}

	on := NewWith(config.Config{Machine: "lodestar", Auth: config.AuthFirebase}, cache.State{}, at(t))
	if on.Account() != on.Auth.Account() {
		t.Errorf("firebase must pass the manager's account through: %+v", on.Account())
	}
}
