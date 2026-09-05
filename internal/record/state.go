package record

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// The files the pusher reads, all in the discuss state dir (default
// ~/.local/state/discuss). Names are the pusher's defaults from
// factory-push-spec.md §10; the organizer writes, discuss-api reads.
const (
	KeyFile      = "push.key"      // the factory key, 0600, re-read by the pusher on 401
	FactoryFile  = "factory"       // the factory id; equals working-on's machine
	ProjectsFile = "projects.json" // per-cell {"push": bool}, re-read on mtime
)

// WriteKey stores the factory key at 0600 in a 0700 dir. It is the only place
// the key is ever written.
func WriteKey(dir, key string) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	p := filepath.Join(dir, KeyFile)
	if err := os.WriteFile(p, []byte(key+"\n"), 0o600); err != nil {
		return err
	}
	// WriteFile keeps the mode of an existing file; enforce it either way.
	return os.Chmod(p, 0o600)
}

// ReadKey returns the stored factory key, or os.ErrNotExist.
func ReadKey(dir string) (string, error) {
	b, err := os.ReadFile(filepath.Join(dir, KeyFile))
	if err != nil {
		return "", err
	}
	k := strings.TrimSpace(string(b))
	if k == "" {
		return "", fmt.Errorf("%s is empty", filepath.Join(dir, KeyFile))
	}
	return k, nil
}

// Factory returns the factory id from the state dir, or os.ErrNotExist.
func Factory(dir string) (string, error) {
	b, err := os.ReadFile(filepath.Join(dir, FactoryFile))
	if err != nil {
		return "", err
	}
	id := strings.TrimSpace(string(b))
	if id == "" {
		return "", fmt.Errorf("%s is empty", filepath.Join(dir, FactoryFile))
	}
	return id, nil
}

// WriteFactory records the factory id. Written once; callers only do this
// when Factory reports the file missing.
func WriteFactory(dir, id string) error {
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(dir, FactoryFile), []byte(id+"\n"), 0o644)
}

// SetPush merges one cell's push flag into projects.json. Other cells and any
// fields this code does not know keep their values; a missing or empty file
// starts as {}.
func SetPush(dir, project string, push bool) error {
	if project == "" {
		return errors.New("projects.json: empty project name")
	}
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	p := filepath.Join(dir, ProjectsFile)
	all := map[string]map[string]any{}
	if b, err := os.ReadFile(p); err == nil && len(strings.TrimSpace(string(b))) > 0 {
		if err := json.Unmarshal(b, &all); err != nil {
			return fmt.Errorf("%s: %w", p, err)
		}
	} else if err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	entry := all[project]
	if entry == nil {
		entry = map[string]any{}
	}
	entry["push"] = push
	all[project] = entry
	b, err := json.MarshalIndent(all, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(p, append(b, '\n'), 0o644)
}

// CellPush reads the optional "push" field of an initiative's agents/cell.json.
// Absent means false: a cell pushes nothing until it opts in.
func CellPush(root string) (bool, error) {
	b, err := os.ReadFile(filepath.Join(root, "agents", "cell.json"))
	if err != nil {
		return false, err
	}
	var c struct {
		Push bool `json:"push"`
	}
	if err := json.Unmarshal(b, &c); err != nil {
		return false, fmt.Errorf("cell.json: %w", err)
	}
	return c.Push, nil
}
