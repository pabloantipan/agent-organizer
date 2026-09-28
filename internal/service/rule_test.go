package service

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
)

const proposedRecord = `---
title: Which phase 4 polish earned its place
status: proposed
raised: 2026-09-02
raised_by: claude
owner: pablo
ruled:
ruled_by:
options: [tray, fsnotify, none]
chosen:
cards: [phase-4-polish]
supersedes: []
superseded_by:
---

## Question

Which of tray, fsnotify or nothing is worth building?

## Options

- **tray**: the board at a glance without the window.
- **fsnotify**: rescan on card change.
- **none**: the app is enough as it is.

## Recommendation



## Ruling



## Consequences

Whatever is chosen becomes a card.
`

// ruleFixture is an initiative root in a temp git repo with one proposed
// record, and a service scanned over it.
func ruleFixture(t *testing.T, now time.Time) (*Service, string) {
	return ruleFixtureWith(t, now, proposedRecord, "")
}

// ruleFixtureWith is ruleFixture with the record's text given, and with an
// agents/cell.json when cell is not empty.
func ruleFixtureWith(t *testing.T, now time.Time, recordText, cell string) (*Service, string) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	t.Setenv("HOME", t.TempDir())
	root := t.TempDir()
	wo := filepath.Join(root, "working-on", "decisions")
	if err := os.MkdirAll(wo, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(p, s string) {
		if err := os.WriteFile(p, []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(root, "working-on", "initiative.yaml"), "id: fix\ntitle: Fixture\nstatus: active\nmachine: testbox\nrepos: []\n")
	record := filepath.Join(wo, "0002-phase-4-polish.md")
	write(record, recordText)
	if cell != "" {
		if err := os.MkdirAll(filepath.Join(root, "agents"), 0o755); err != nil {
			t.Fatal(err)
		}
		write(filepath.Join(root, "agents", "cell.json"), cell)
	}
	for _, args := range [][]string{
		{"init", "-q"},
		{"config", "user.email", "seat@example.test"},
		{"config", "user.name", "Seat"},
		{"add", "--", "."},
		{"commit", "-q", "-m", "fixture"},
	} {
		if out, err := exec.Command("git", append([]string{"-C", root}, args...)...).CombinedOutput(); err != nil {
			t.Fatalf("git %s: %s", strings.Join(args, " "), out)
		}
	}
	cfg := config.Config{Machine: "lodestar", Roots: []string{root}, MaxDepth: 2}
	s := NewWith(cfg, cache.State{}, func() time.Time { return now })
	s.Scan(false)
	if _, err := s.initiative("fix"); err != nil {
		t.Fatalf("fixture not scanned: %v", err)
	}
	return s, record
}

func git(t *testing.T, dir string, args ...string) string {
	t.Helper()
	out, err := exec.Command("git", append([]string{"-C", dir}, args...)...).CombinedOutput()
	if err != nil {
		t.Fatalf("git %s: %s", strings.Join(args, " "), out)
	}
	return string(out)
}

// TestRuleDecisionWritesAndCommits is G8: the four fields and the Ruling are
// written, the diff shows only those lines, and one commit touches one file.
func TestRuleDecisionWritesAndCommits(t *testing.T) {
	now := time.Date(2026, 9, 26, 9, 0, 0, 0, time.UTC)
	s, record := ruleFixture(t, now)
	root := filepath.Dir(filepath.Dir(filepath.Dir(record)))
	before := git(t, root, "rev-parse", "HEAD")

	if err := s.RuleDecision("fix", "0002", "fsnotify", "  fsnotify: the board should follow the files.  "); err != nil {
		t.Fatalf("rule: %v", err)
	}

	// Only the four fields and the ruling line changed.
	diff := git(t, root, "diff", strings.TrimSpace(before)+"..HEAD", "--", "working-on/decisions/0002-phase-4-polish.md")
	var added, removed []string
	for _, l := range strings.Split(diff, "\n") {
		switch {
		case strings.HasPrefix(l, "+++") || strings.HasPrefix(l, "---"):
		case strings.HasPrefix(l, "+"):
			added = append(added, strings.TrimPrefix(l, "+"))
		case strings.HasPrefix(l, "-"):
			removed = append(removed, strings.TrimPrefix(l, "-"))
		}
	}
	wantAdded := []string{
		"status: ruled",
		"ruled: 2026-09-26",
		"ruled_by: pablo",
		"chosen: fsnotify",
		"pablo, 2026-09-26, in the organizer on lodestar: fsnotify: the board should follow the files.",
	}
	if len(added) != len(wantAdded) {
		t.Fatalf("added lines:\n%s", diff)
	}
	for i, want := range wantAdded {
		if added[i] != want {
			t.Errorf("added[%d] = %q, want %q", i, added[i], want)
		}
	}
	wantRemoved := []string{"status: proposed", "ruled:", "ruled_by:", "chosen:", ""}
	for i, want := range wantRemoved {
		if i >= len(removed) || removed[i] != want {
			t.Fatalf("removed lines %q, want %q\n%s", removed, wantRemoved, diff)
		}
	}
	if len(removed) != len(wantRemoved) {
		t.Errorf("removed lines %q, want %q", removed, wantRemoved)
	}

	// Every other section survived byte for byte.
	out, err := os.ReadFile(record)
	if err != nil {
		t.Fatal(err)
	}
	for _, keep := range []string{
		"title: Which phase 4 polish earned its place",
		"options: [tray, fsnotify, none]",
		"- **tray**: the board at a glance without the window.",
		"## Consequences\n\nWhatever is chosen becomes a card.\n",
	} {
		if !strings.Contains(string(out), keep) {
			t.Errorf("lost %q", keep)
		}
	}
	if !strings.Contains(string(out), "## Ruling\n\npablo, 2026-09-26, in the organizer on lodestar: fsnotify: the board should follow the files.\n\n## Consequences") {
		t.Errorf("ruling section:\n%s", out)
	}

	// One commit, one file, and nothing left in the working tree.
	if n := strings.Count(git(t, root, "log", "--oneline", strings.TrimSpace(before)+"..HEAD"), "\n"); n != 1 {
		t.Errorf("commits after the ruling = %d, want 1", n)
	}
	if files := strings.Fields(git(t, root, "show", "--name-only", "--format=", "HEAD")); len(files) != 1 || files[0] != "working-on/decisions/0002-phase-4-polish.md" {
		t.Errorf("commit touched %v, want the record only", files)
	}
	if st := git(t, root, "status", "--porcelain"); strings.TrimSpace(st) != "" {
		t.Errorf("working tree not clean:\n%s", st)
	}
	if subject := strings.TrimSpace(git(t, root, "log", "-1", "--format=%s")); subject != "docs(decisions): rule 0002 phase-4-polish (fsnotify)" {
		t.Errorf("commit subject %q", subject)
	}
}

// TestRuleDecisionRefusals is the other half of G8: a record that is not
// proposed, a chosen value that is not an option, and empty words each refuse,
// write nothing and commit nothing. Each case gets its own fixture, so no
// earlier refusal can be the reason for the next.
func TestRuleDecisionRefusals(t *testing.T) {
	now := time.Date(2026, 9, 26, 9, 0, 0, 0, time.UTC)
	for _, tc := range []struct {
		name, number, chosen, words, wantErr string
		ruleFirst                            bool
	}{
		{name: "ruling it again", number: "0002", chosen: "fsnotify", words: "on reflection, fsnotify.", wantErr: "not proposed", ruleFirst: true},
		{name: "a chosen value not in options", number: "0002", chosen: "menu bar", words: "menu bar it is.", wantErr: "is not one of"},
		{name: "no chosen value at all", number: "0002", chosen: "", words: "tray it is.", wantErr: "is not one of"},
		{name: "empty words", number: "0002", chosen: "tray", words: "   \n  ", wantErr: "needs the ruler's words"},
		{name: "a record that is not there", number: "0099", chosen: "tray", words: "tray it is.", wantErr: "no decision 0099"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			s, record := ruleFixture(t, now)
			root := filepath.Dir(filepath.Dir(filepath.Dir(record)))
			if tc.ruleFirst {
				if err := s.RuleDecision("fix", "0002", "tray", "tray it is."); err != nil {
					t.Fatalf("first ruling: %v", err)
				}
			}
			head := strings.TrimSpace(git(t, root, "rev-parse", "HEAD"))
			before, err := os.ReadFile(record)
			if err != nil {
				t.Fatal(err)
			}

			err = s.RuleDecision("fix", tc.number, tc.chosen, tc.words)
			if err == nil {
				t.Fatalf("%s must refuse", tc.name)
			}
			if !strings.Contains(err.Error(), tc.wantErr) {
				t.Errorf("error %q, want it to mention %q", err, tc.wantErr)
			}
			if got, err := os.ReadFile(record); err != nil || string(got) != string(before) {
				t.Errorf("the record changed:\n%s", got)
			}
			if at := strings.TrimSpace(git(t, root, "rev-parse", "HEAD")); at != head {
				t.Errorf("a commit was made: %s", at)
			}
			if st := git(t, root, "status", "--porcelain"); strings.TrimSpace(st) != "" {
				t.Errorf("working tree not clean:\n%s", st)
			}
		})
	}
}

// TestRuleDecisionAnyOwner is G17 (0045, FR-14): a record owned by someone
// else is ruled and signed by the ruler, with the owner named in the Ruling
// line; a record with no owner is ruled; a cell's human is the ruler.
func TestRuleDecisionAnyOwner(t *testing.T) {
	now := time.Date(2026, 9, 28, 9, 0, 0, 0, time.UTC)
	for _, tc := range []struct {
		name, owner, cell, wantBy, wantLine string
	}{
		{
			name: "owned by alejandro, no cell", owner: "owner: alejandro", wantBy: "ruled_by: pablo",
			wantLine: "pablo, 2026-09-28, owner alejandro, in the organizer on lodestar: tray it is.",
		},
		{
			name: "no owner", owner: "owner:", wantBy: "ruled_by: pablo",
			wantLine: "pablo, 2026-09-28, in the organizer on lodestar: tray it is.",
		},
		{
			name: "no owner key at all", owner: "", wantBy: "ruled_by: pablo",
			wantLine: "pablo, 2026-09-28, in the organizer on lodestar: tray it is.",
		},
		{
			name: "the cell's human rules", owner: "owner: alejandro", cell: `{"project": "fix", "agents": ["po_ana"], "human": "maria"}`,
			wantBy: "ruled_by: maria", wantLine: "maria, 2026-09-28, owner alejandro, in the organizer on lodestar: tray it is.",
		},
		{
			name: "the ruler owns it", owner: "owner: Pablo", wantBy: "ruled_by: pablo",
			wantLine: "pablo, 2026-09-28, in the organizer on lodestar: tray it is.",
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			text := strings.Replace(proposedRecord, "owner: pablo\n", tc.owner+"\n", 1)
			if tc.owner == "" {
				text = strings.Replace(proposedRecord, "owner: pablo\n", "", 1)
			}
			s, record := ruleFixtureWith(t, now, text, tc.cell)
			root := filepath.Dir(filepath.Dir(filepath.Dir(record)))
			before := strings.TrimSpace(git(t, root, "rev-parse", "HEAD"))

			if err := s.RuleDecision("fix", "2", "tray", "tray it is."); err != nil {
				t.Fatalf("rule: %v", err)
			}
			out, err := os.ReadFile(record)
			if err != nil {
				t.Fatal(err)
			}
			for _, want := range []string{"status: ruled\n", tc.wantBy + "\n", "chosen: tray\n", "## Ruling\n\n" + tc.wantLine + "\n\n## Consequences"} {
				if !strings.Contains(string(out), want) {
					t.Errorf("want %q in:\n%s", want, out)
				}
			}
			if n := strings.Count(git(t, root, "log", "--oneline", before+"..HEAD"), "\n"); n != 1 {
				t.Errorf("commits after the ruling = %d, want 1", n)
			}
			if files := strings.Fields(git(t, root, "show", "--name-only", "--format=", "HEAD")); len(files) != 1 || files[0] != "working-on/decisions/0002-phase-4-polish.md" {
				t.Errorf("commit touched %v, want the record only", files)
			}
			if st := git(t, root, "status", "--porcelain"); strings.TrimSpace(st) != "" {
				t.Errorf("working tree not clean:\n%s", st)
			}
		})
	}
}

// TestWriteRulingShapes covers the record shapes the fixture does not have: a
// missing key, a missing heading, and a section that already holds text.
func TestWriteRulingShapes(t *testing.T) {
	for _, tc := range []struct {
		name, src string
		want      []string
	}{
		{
			name: "keys the record does not carry are inserted",
			src:  "---\ntitle: t\nstatus: proposed\nowner: pablo\n---\n\n## Ruling\n\n\n## Consequences\n",
			want: []string{"ruled: 2026-09-26\n", "ruled_by: pablo\n", "chosen: a\n", "status: ruled\n"},
		},
		{
			name: "no Ruling heading gets one at the end",
			src:  "---\nstatus: proposed\n---\n\n## Question\n\nwhy?\n",
			want: []string{"## Question\n\nwhy?\n\n## Ruling\n\npablo, 2026-09-26, in the organizer on lodestar: because.\n"},
		},
		{
			name: "a section that already holds text keeps it",
			src:  "---\nstatus: proposed\n---\n\n## Ruling\n\nan earlier note.\n\n## Consequences\n",
			want: []string{"## Ruling\n\npablo, 2026-09-26, in the organizer on lodestar: because.\n\nan earlier note.\n\n## Consequences\n"},
		},
		{
			name: "words over several lines keep their lines",
			src:  "---\nstatus: proposed\n---\n\n## Ruling\n\n\n",
			want: []string{"pablo, 2026-09-26, in the organizer on lodestar: because.\nand also this.\n"},
		},
	} {
		t.Run(tc.name, func(t *testing.T) {
			words := "because."
			if strings.Contains(tc.name, "several lines") {
				words = "because.\nand also this."
			}
			got, err := writeRuling(tc.src, "2026-09-26", "pablo", "pablo", "a", words, "lodestar")
			if err != nil {
				t.Fatal(err)
			}
			for _, want := range tc.want {
				if !strings.Contains(got, want) {
					t.Errorf("want %q in:\n%s", want, got)
				}
			}
		})
	}
	if _, err := writeRuling("no frontmatter here\n", "2026-09-26", "pablo", "pablo", "a", "because.", "lodestar"); err == nil {
		t.Error("a record without frontmatter must refuse")
	}
}
