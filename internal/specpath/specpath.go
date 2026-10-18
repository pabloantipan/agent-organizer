// Package specpath reads the file a card's spec: field names. The scan
// (a spec that names no file is a problem) and the service (the spec reader
// reads only the files cards name) both read it here, so the two cannot
// drift (leftovers-41 FR-12).
package specpath

import (
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
