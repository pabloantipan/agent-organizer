// Package lock is the local app lock: an argon2id passcode hash in the
// keychain, verified at launch, with a cooldown after repeated failures.
package lock

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/argon2"

	"organizer/internal/keychain"
)

const (
	item         = "passcode"
	minLength    = 6
	maxFailures  = 5
	cooldown     = 30 * time.Second
	argonTime    = 2
	argonMemory  = 64 * 1024
	argonThreads = 2
	argonKeyLen  = 32
)

var ErrTooShort = fmt.Errorf("passcode must be at least %d characters", minLength)

// Lock is safe for concurrent use.
type Lock struct {
	mu       sync.Mutex
	kc       keychain.Store
	failures int
	until    time.Time
	now      func() time.Time
}

func New(kc keychain.Store) *Lock { return &Lock{kc: kc, now: time.Now} }

// Enabled reports whether a passcode is set.
func (l *Lock) Enabled() bool {
	_, err := l.kc.Get(item)
	return err == nil
}

// Set stores a new passcode hash.
func (l *Lock) Set(passcode string) error {
	if len(passcode) < minLength {
		return ErrTooShort
	}
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return err
	}
	key := argon2.IDKey([]byte(passcode), salt, argonTime, argonMemory, argonThreads, argonKeyLen)
	enc := fmt.Sprintf("argon2id$%d$%d$%d$%s$%s", argonTime, argonMemory, argonThreads,
		base64.RawStdEncoding.EncodeToString(salt), base64.RawStdEncoding.EncodeToString(key))
	return l.kc.Set(item, enc)
}

// Clear removes the passcode.
func (l *Lock) Clear() error { return l.kc.Delete(item) }

// Status for the UI.
type Status struct {
	Enabled      bool `json:"enabled"`
	CooldownSecs int  `json:"cooldown_secs"`
	FailuresLeft int  `json:"failures_left"`
}

func (l *Lock) Status() Status {
	l.mu.Lock()
	defer l.mu.Unlock()
	st := Status{Enabled: l.Enabled(), FailuresLeft: maxFailures - l.failures}
	if rem := l.until.Sub(l.now()); rem > 0 {
		st.CooldownSecs = int(rem.Seconds()) + 1
	}
	return st
}

// Verify checks a passcode. After five failures in a row it refuses for 30 s.
func (l *Lock) Verify(passcode string) (bool, error) {
	l.mu.Lock()
	defer l.mu.Unlock()
	if rem := l.until.Sub(l.now()); rem > 0 {
		return false, fmt.Errorf("too many attempts, wait %ds", int(rem.Seconds())+1)
	}
	enc, err := l.kc.Get(item)
	if err != nil {
		return false, errors.New("no passcode set")
	}
	ok := verify(passcode, enc)
	if ok {
		l.failures = 0
		return true, nil
	}
	l.failures++
	if l.failures >= maxFailures {
		l.failures = 0
		l.until = l.now().Add(cooldown)
	}
	return false, nil
}

func verify(passcode, enc string) bool {
	parts := strings.Split(enc, "$")
	if len(parts) != 6 || parts[0] != "argon2id" {
		return false
	}
	var t, m uint32
	var p uint8
	if _, err := fmt.Sscanf(parts[1]+" "+parts[2]+" "+parts[3], "%d %d %d", &t, &m, &p); err != nil {
		return false
	}
	salt, err1 := base64.RawStdEncoding.DecodeString(parts[4])
	want, err2 := base64.RawStdEncoding.DecodeString(parts[5])
	if err1 != nil || err2 != nil {
		return false
	}
	got := argon2.IDKey([]byte(passcode), salt, t, m, p, uint32(len(want)))
	return subtle.ConstantTimeCompare(got, want) == 1
}
