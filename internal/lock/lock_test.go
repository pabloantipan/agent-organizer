package lock

import (
	"testing"
	"time"

	"organizer/internal/keychain"
)

func TestSetVerifyCooldown(t *testing.T) {
	kc := keychain.NewMemory()
	l := New(kc)
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	l.now = func() time.Time { return now }

	if l.Enabled() {
		t.Fatal("should start disabled")
	}
	if err := l.Set("short"); err != ErrTooShort {
		t.Fatalf("short passcode: %v", err)
	}
	if err := l.Set("correct-horse"); err != nil {
		t.Fatal(err)
	}
	if !l.Enabled() {
		t.Fatal("should be enabled")
	}
	if ok, _ := l.Verify("correct-horse"); !ok {
		t.Fatal("right passcode rejected")
	}
	for i := 0; i < 5; i++ {
		if ok, err := l.Verify("wrong"); ok || err != nil {
			t.Fatalf("attempt %d: ok=%v err=%v", i, ok, err)
		}
	}
	if _, err := l.Verify("correct-horse"); err == nil {
		t.Fatal("expected cooldown after five failures")
	}
	if st := l.Status(); st.CooldownSecs <= 0 {
		t.Errorf("status should show cooldown: %+v", st)
	}
	now = now.Add(31 * time.Second)
	if ok, err := l.Verify("correct-horse"); !ok || err != nil {
		t.Fatalf("after cooldown: ok=%v err=%v", ok, err)
	}
	if err := l.Clear(); err != nil || l.Enabled() {
		t.Fatal("clear failed")
	}
}
