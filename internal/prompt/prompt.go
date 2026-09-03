// Package prompt renders the review prompt handed to an agent so it can bring
// an initiative's working-on/ cards up to date. It is text, not policy: the
// rules it restates come from the working-on skill.
package prompt

import (
	"fmt"
	"strings"
	"time"

	"organizer/internal/model"
)

// Review builds the prompt for one initiative from the latest scan.
func Review(si model.ScannedInitiative, now time.Time) string {
	var b strings.Builder
	w := func(format string, a ...any) { fmt.Fprintf(&b, format, a...) }

	w("Review the work-in-progress state of the initiative %q at %s and bring its working-on/ cards up to date. Follow the working-on skill. Work in this directory; the repos listed below are subdirectories of it.\n\n", si.ID, si.Path)
	if si.Title != "" {
		w("Initiative: %s\n", si.Title)
	}
	w("Snapshot taken by organizer at %s.\n", now.Format("2006-01-02 15:04"))
	if si.Target != "" {
		w("Target date: %s.\n", si.Target)
	}
	if len(si.Milestones) > 0 {
		w("Milestones:")
		for _, m := range si.Milestones {
			w(" %s %s;", m.Date, m.Title)
		}
		w("\n")
	}
	w("\n")

	if len(si.RepoStates) > 0 {
		w("Repos as of the snapshot (branch, uncommitted files, last commit):\n")
		for _, r := range si.RepoStates {
			switch {
			case r.Missing:
				w("- %s: missing or not a git repo\n", r.Name)
			case r.Err != "":
				w("- %s: git error: %s\n", r.Name, r.Err)
			default:
				w("- %s: %s, dirty=%d, last commit %s\n", r.Name, r.Branch, r.Dirty, r.LastCommit)
			}
		}
		w("\n")
	}

	if live, _ := si.LiveAgents(); live > 0 {
		w("Other agent processes alive in this initiative right now:")
		for _, x := range si.Agents {
			if x.Live() {
				w(" %s (%s, up %s);", x.Name, x.State, x.Uptime)
			}
		}
		w(" do not duplicate their work, and mention them if a card looks touched by them.\n\n")
	}

	open, archived := 0, 0
	w("Open cards (status, slug, updated, branch), then the recorded next action:\n")
	for _, c := range si.Cards {
		if c.Archived || c.Status == model.StatusDone {
			archived++
			continue
		}
		open++
		due := ""
		if c.Due != "" {
			due = ", due " + c.Due
		}
		w("- [%s] %s, updated %s (%s), branch %s%s\n", c.Status, c.Slug, orDash(c.Updated), age(c.UpdatedTime(), now), orDash(c.Branch), due)
		w("  next: %s\n", orDash(strings.TrimSpace(c.Next)))
	}
	if open == 0 {
		w("- none\n")
	}
	if archived > 0 {
		w("(%d cards already in done/, leave them alone)\n", archived)
	}
	if len(si.Problems) > 0 {
		w("\nProblems the scanner found:\n")
		for _, p := range si.Problems {
			w("- %s: %s\n", p.Path, p.Msg)
		}
	}

	w(`
Do this, in order:
1. For each open card, look at the repos and branches it names: commits since the card's updated date (git log --since), whether the branch was merged or deleted, and uncommitted work. Read the card body only when the evidence suggests its next action changed.
2. Update only the cards whose next action changed. Rewrite the frontmatter next line first, set updated to today, add outcomes to Done (outcomes, not narration; collapse to five bullets), move blockers in or out. Leave the others untouched.
3. If a card's work is finished, set status: done, add one final Done line saying where it landed, and move the file to working-on/done/.
4. If you find work on a branch that no card covers, create a card from the working-on skill template with a real next action. Never invent state you did not see.
5. Fix any scanner problems listed above if they are card formatting issues.
6. Dates: set or move a card's due, or an initiative milestone or target, only when a real date exists in a note, a card, or a commitment you can cite. Say where it came from. Never add a date to fill the roadmap.
7. Do not modify the repos, do not commit, do not edit CLAUDE.md, do not add statuses beyond now, blocked, next, done.

Finish with one table, under 20 lines: card, old next, new next, why. If nothing changed, say so in one line and stop.
`)
	return b.String()
}

func orDash(s string) string {
	if s == "" {
		return "-"
	}
	return s
}

func age(t, now time.Time) string {
	if t.IsZero() {
		return "no date"
	}
	days := int(now.Sub(t).Hours() / 24)
	switch {
	case days <= 0:
		return "today"
	case days == 1:
		return "1 day ago"
	case days >= 7:
		return fmt.Sprintf("%d days ago, stale", days)
	default:
		return fmt.Sprintf("%d days ago", days)
	}
}
