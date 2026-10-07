package scan

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestLedgerFilesAreSkippedNotRejected(t *testing.T) {
	const front = "---\ntitle: X\nstatus: now\nupdated: 2026-09-01\nnext: \"Do it\"\n---\n"
	cases := []struct {
		name     string
		content  string
		card     bool // read as a card
		rejected bool // an unread problem names it
	}{
		{"jira-map.md", "# Jira map\n| key | card |\n", false, false},
		{"tickets.md", "# Tickets\n- VIT-1\n", false, false},
		{"jira-estimates.md", "# Estimates\n", false, false},
		{"jira-report-2026-09-30.md", "# Reporte\n", false, false},
		{"jira-report-draft.md", front, false, false},
		{"jira-notes.md", "# notes, no frontmatter\n", false, false},
		{"jira-writes-pending.md", front, true, false},
		{"jira-broken.md", "---\nnext: [a\n---\n", true, true},
		{"lost-frontmatter.md", "# a card that lost its frontmatter\n", true, true},
		{"ok-card.md", front, true, false},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			root := writeInitiative(t, "")
			p := filepath.Join(root, "working-on", c.name)
			if err := os.WriteFile(p, []byte(c.content), 0o644); err != nil {
				t.Fatal(err)
			}
			si := ReadInitiative(root, opts(root))
			slug := strings.TrimSuffix(c.name, ".md")
			read := false
			for _, card := range si.Cards {
				if card.Slug == slug {
					read = true
				}
			}
			if read != c.card {
				t.Errorf("read as a card=%v want %v", read, c.card)
			}
			rejected := false
			for _, pr := range si.Problems {
				if pr.Path == p && pr.Unread {
					rejected = true
				}
			}
			if rejected != c.rejected {
				t.Errorf("rejected=%v want %v, problems %+v", rejected, c.rejected, si.Problems)
			}
		})
	}
}

func TestInitiativeScopeAsStringKeepsTheInitiative(t *testing.T) {
	cases := []struct {
		name    string
		yaml    string
		wantIn  []string
		wantOut []string
	}{
		{"map", "scope:\n  in: [a, b]\n  out: [c]\n", []string{"a", "b"}, []string{"c"}},
		{"plain string", "scope: Everything about certificates\n", []string{"Everything about certificates"}, nil},
		{"folded prose", "scope: >-\n  Designed for all 36,\n  built one at a time.\n", []string{"Designed for all 36, built one at a time."}, nil},
		{"empty", "scope:\n", nil, nil},
		{"absent", "", nil, nil},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			root := writeInitiative(t, "goal: Ship it\nbusiness_cell: plv\n"+c.yaml)
			si := ReadInitiative(root, opts(root))
			for _, p := range si.Problems {
				if strings.HasSuffix(p.Path, "initiative.yaml") {
					t.Errorf("unexpected problem %+v", p)
				}
			}
			if si.Goal != "Ship it" {
				t.Errorf("goal=%q, the rest of initiative.yaml must survive", si.Goal)
			}
			if !equal(si.Scope.In, c.wantIn) || !equal(si.Scope.Out, c.wantOut) {
				t.Errorf("scope=%+v want in=%v out=%v", si.Scope, c.wantIn, c.wantOut)
			}
		})
	}
}

func TestBrokenInitiativeYAMLIsUnread(t *testing.T) {
	root := writeInitiative(t, "scope:\n  in: [a\n")
	si := ReadInitiative(root, opts(root))
	for _, p := range si.Problems {
		if strings.HasSuffix(p.Path, "initiative.yaml") && p.Unread {
			return
		}
	}
	t.Errorf("a YAML syntax error is an unread file: %+v", si.Problems)
}

func equal(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}
