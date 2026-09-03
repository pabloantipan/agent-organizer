// Package cache persists the last local scan and the last remote pull so the
// app opens instantly and works offline.
package cache

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"time"

	"organizer/internal/model"
)

type State struct {
	Local    model.Snapshot   `json:"local"`
	Remote   []model.Snapshot `json:"remote"`
	PulledAt time.Time        `json:"pulled_at"`
	PushedAt time.Time        `json:"pushed_at"`
	Order    model.Order      `json:"order"`
}

// Path is ~/.local/share/organizer/state.json, XDG respected.
func Path() string {
	if p := os.Getenv("ORGANIZER_STATE"); p != "" {
		return p
	}
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer", "state.json")
}

// Load returns the saved state, or an empty one when the file is absent.
func Load() (State, error) {
	var st State
	b, err := os.ReadFile(Path())
	if errors.Is(err, os.ErrNotExist) {
		return st, nil
	}
	if err != nil {
		return st, err
	}
	return st, json.Unmarshal(b, &st)
}

// Save writes the state atomically.
func Save(st State) error {
	p := Path()
	if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
		return err
	}
	b, err := json.Marshal(st)
	if err != nil {
		return err
	}
	tmp := p + ".tmp"
	if err := os.WriteFile(tmp, b, 0o644); err != nil {
		return err
	}
	return os.Rename(tmp, p)
}
