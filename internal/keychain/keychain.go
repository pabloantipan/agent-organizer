// Package keychain stores small secrets: the Firebase refresh token and the
// passcode hash. macOS uses the login Keychain through the security CLI; other
// systems fall back to 0600 files under the data dir.
package keychain

import (
	"bytes"
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const service = "cl.antipan.organizer"

// ErrNotFound is returned when the item does not exist.
var ErrNotFound = errors.New("keychain: item not found")

// Store abstracts the backend so tests can swap it.
type Store interface {
	Get(item string) (string, error)
	Set(item, value string) error
	Delete(item string) error
}

// Default returns the platform store.
func Default() Store {
	if runtime.GOOS == "darwin" {
		if _, err := exec.LookPath("security"); err == nil {
			return macStore{}
		}
	}
	return fileStore{dir: secretsDir()}
}

type macStore struct{}

func (macStore) Get(item string) (string, error) {
	cmd := exec.Command("security", "find-generic-password", "-s", service, "-a", item, "-w")
	var out, errb bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		if strings.Contains(errb.String(), "could not be found") {
			return "", ErrNotFound
		}
		return "", errors.New("keychain: " + strings.TrimSpace(errb.String()))
	}
	return strings.TrimRight(out.String(), "\n"), nil
}

func (macStore) Set(item, value string) error {
	// -U updates in place; the value goes through stdin-less argv, which is
	// fine for tokens (not visible longer than the call).
	cmd := exec.Command("security", "add-generic-password", "-U", "-s", service, "-a", item, "-l", "organizer "+item, "-w", value)
	var errb bytes.Buffer
	cmd.Stderr = &errb
	if err := cmd.Run(); err != nil {
		return errors.New("keychain: " + strings.TrimSpace(errb.String()))
	}
	return nil
}

func (macStore) Delete(item string) error {
	cmd := exec.Command("security", "delete-generic-password", "-s", service, "-a", item)
	var errb bytes.Buffer
	cmd.Stderr = &errb
	if err := cmd.Run(); err != nil {
		if strings.Contains(errb.String(), "could not be found") {
			return nil
		}
		return errors.New("keychain: " + strings.TrimSpace(errb.String()))
	}
	return nil
}

type fileStore struct{ dir string }

func secretsDir() string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer", "secrets")
}

func (f fileStore) path(item string) string { return filepath.Join(f.dir, item) }

func (f fileStore) Get(item string) (string, error) {
	b, err := os.ReadFile(f.path(item))
	if errors.Is(err, os.ErrNotExist) {
		return "", ErrNotFound
	}
	if err != nil {
		return "", err
	}
	return strings.TrimRight(string(b), "\n"), nil
}

func (f fileStore) Set(item, value string) error {
	if err := os.MkdirAll(f.dir, 0o700); err != nil {
		return err
	}
	return os.WriteFile(f.path(item), []byte(value), 0o600)
}

func (f fileStore) Delete(item string) error {
	err := os.Remove(f.path(item))
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	return err
}

// Memory is an in-memory store for tests.
type Memory struct{ m map[string]string }

func NewMemory() *Memory { return &Memory{m: map[string]string{}} }
func (s *Memory) Get(item string) (string, error) {
	v, ok := s.m[item]
	if !ok {
		return "", ErrNotFound
	}
	return v, nil
}
func (s *Memory) Set(item, value string) error { s.m[item] = value; return nil }
func (s *Memory) Delete(item string) error     { delete(s.m, item); return nil }
