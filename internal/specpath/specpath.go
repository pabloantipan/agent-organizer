// Package specpath reads the file a card's spec: field names. The scan
// (a spec that names no file is a problem) and the service (the spec reader
// reads only the files cards name) both read it here, so the two cannot
// drift (leftovers-41 FR-12).
package specpath

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Card is the file a card's spec: field names: its first word (the rest is
// prose, "docs/specs/x.md (FR-1 to FR-3)") without trailing punctuation, as
// Clean reads it.
func Card(ref string) (string, bool) {
	f := strings.Fields(ref)
	if len(f) == 0 {
		return "", false
	}
	return Clean(strings.TrimRight(f[0], ",;:"))
}

// Clean is a path relative to the initiative root with forward slashes,
// without its #section. A path that is absolute or climbs out of the root
// names nothing.
func Clean(path string) (string, bool) {
	p, _, _ := strings.Cut(path, "#")
	if strings.TrimSpace(p) == "" || filepath.IsAbs(p) || strings.HasPrefix(p, "/") {
		return "", false
	}
	rel := filepath.Clean(filepath.FromSlash(p))
	if rel == "." || rel == ".." || strings.HasPrefix(rel, ".."+string(filepath.Separator)) {
		return "", false
	}
	return filepath.ToSlash(rel), true
}

// ErrOutside is a path whose symlinks, evaluated, leave every folder it was
// admitted under (leftovers-66 FR-3).
var ErrOutside = errors.New("its symlinks lead outside the folder it was admitted under")

// Within is root/rel with its symlinks evaluated, when that file is inside
// one of dirs (relative to root, "." for root itself) with their own
// symlinks evaluated; otherwise an error wrapping ErrOutside. Inside is
// decided by file identity (os.SameFile against each ancestor), not by
// text, so a target spelled in another case on a case-insensitive volume
// still counts. A file that does not exist, or a symlink to nothing,
// returns the error of evaluating it (os.ErrNotExist), never ErrOutside.
func Within(root, rel string, dirs ...string) (string, error) {
	real, err := filepath.EvalSymlinks(filepath.Join(root, filepath.FromSlash(rel)))
	if err != nil {
		return "", err
	}
	for _, d := range dirs {
		di, err := os.Stat(filepath.Join(root, filepath.FromSlash(d)))
		if err != nil || !di.IsDir() {
			continue
		}
		for cur := filepath.Dir(real); ; cur = filepath.Dir(cur) {
			if ci, err := os.Stat(cur); err == nil && os.SameFile(di, ci) {
				return real, nil
			}
			if filepath.Dir(cur) == cur {
				break
			}
		}
	}
	return "", fmt.Errorf("%s: %w", rel, ErrOutside)
}
