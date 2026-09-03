package prompt

import (
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

func TestReviewMentionsEverythingThatMatters(t *testing.T) {
	now := time.Date(2026, 9, 10, 9, 0, 0, 0, time.UTC)
	si := model.ScannedInitiative{
		Cards: []model.Card{
			{Slug: "alpha", Status: "now", Updated: "2026-09-01", Branch: "feat/a", Next: "Finish alpha", Due: "2026-09-12"},
			{Slug: "old", Status: "done", Archived: true, Updated: "2026-08-01"},
		},
		RepoStates: []model.RepoState{
			{Name: "svc", Branch: "feat/a", Dirty: 2, LastCommit: "2026-09-09"},
			{Name: "gone", Missing: true},
		},
		Problems: []model.Problem{{Path: "x/working-on/bad.md", Msg: "no frontmatter"}},
	}
	si.ID, si.Path, si.Title = "init", "/tmp/init", "Init title"
	si.Target = "2026-10-01"
	si.Milestones = []model.Milestone{{Date: "2026-09-20", Title: "Port"}}
	out := Review(si, now)
	for _, want := range []string{
		`initiative "init" at /tmp/init`,
		"Init title",
		"- svc: feat/a, dirty=2, last commit 2026-09-09",
		"- gone: missing or not a git repo",
		"[now] alpha, updated 2026-09-01 (9 days ago, stale), branch feat/a",
		"next: Finish alpha",
		"branch feat/a, due 2026-09-12",
		"Target date: 2026-10-01.",
		"Milestones: 2026-09-20 Port;",
		"(1 cards already in done/",
		"x/working-on/bad.md: no frontmatter",
		"do not commit",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("prompt missing %q\n---\n%s", want, out)
		}
	}
	if strings.Contains(out, "[done] old") {
		t.Error("archived card should not be listed as open")
	}
}
