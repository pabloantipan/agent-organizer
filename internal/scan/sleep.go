package scan

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"

	"organizer/internal/model"
)

// sleepingSince is the comment `factory sleep` writes beside the status
// (sleep.sh set_status): `# sleeping since 2026-10-09 (factory sleep; …)`.
var sleepingSince = regexp.MustCompile(`^#\s*sleeping since (\d{4}-\d{2}-\d{2})\b`)

// asleepSince reads the date from the line comment on a paused status.
// Anything else — another status, no comment, another comment, a date that
// is not one — is empty and never a problem (initiatives-view FR-2, O1):
// the comment is the factory's note, not part of the charter.
func asleepSince(b []byte) string {
	var doc yaml.Node
	if yaml.Unmarshal(b, &doc) != nil || len(doc.Content) == 0 {
		return ""
	}
	m := doc.Content[0]
	if m.Kind != yaml.MappingNode {
		return ""
	}
	for i := 0; i+1 < len(m.Content); i += 2 {
		k, v := m.Content[i], m.Content[i+1]
		if k.Value != "status" {
			continue
		}
		if v.Kind != yaml.ScalarNode || strings.TrimSpace(v.Value) != model.InitiativePaused {
			return ""
		}
		sub := sleepingSince.FindStringSubmatch(strings.TrimSpace(v.LineComment))
		if sub == nil || !validDate(sub[1]) {
			return ""
		}
		return sub[1]
	}
	return ""
}

// assignFrozen stamps each initiative's Frozen: the session dirs under
// frozenDir (seat-freeze's ~/.local/state/probe/frozen/<session>/) whose
// `cwd` file falls in the initiative's root and in no deeper scanned root,
// the longest-prefix rule AssignAgents and sleep.sh's seats_of use. A dir
// without a readable cwd is skipped. An empty frozenDir does nothing.
func assignFrozen(inits []model.ScannedInitiative, frozenDir string) {
	if frozenDir == "" {
		return
	}
	entries, err := os.ReadDir(frozenDir)
	if err != nil {
		return
	}
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		b, err := os.ReadFile(filepath.Join(frozenDir, e.Name(), "cwd"))
		if err != nil {
			continue
		}
		cwd := filepath.Clean(strings.TrimSpace(string(b)))
		best := -1
		for i := range inits {
			root := filepath.Clean(inits[i].Path)
			if root == "" || (cwd != root && !strings.HasPrefix(cwd, root+string(filepath.Separator))) {
				continue
			}
			if best < 0 || len(root) > len(filepath.Clean(inits[best].Path)) {
				best = i
			}
		}
		if best >= 0 {
			inits[best].Frozen = append(inits[best].Frozen, e.Name())
		}
	}
	for i := range inits {
		sort.Strings(inits[i].Frozen)
	}
}
