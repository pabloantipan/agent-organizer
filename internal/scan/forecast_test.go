package scan

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

// T1 (leftovers-28 FR-1): forecast parses to its top in minutes; a value that
// does not parse is one problem on that record; no field, no forecast.
func TestReadDecisionsForecast(t *testing.T) {
	dir := t.TempDir()
	rec := func(name, forecast string) {
		f := ""
		if forecast != "" {
			f = "forecast: " + forecast + "\n"
		}
		writeDecision(t, dir, name, "---\ntitle: Accept\nstatus: ruled\nraised: 2026-10-14\nruled: 2026-10-14\nruled_by: pablo\n"+f+"---\n\nforecast: prose stays prose\n")
	}
	rec("0001-minutes.md", "40-90m")
	rec("0002-hours.md", "1.5-3h")
	rec("0003-soon.md", "soon")
	rec("0004-none.md", "")

	ds, problems := readDecisions(dir, nil)
	if len(ds) != 4 {
		t.Fatalf("every record is kept: %+v", ds)
	}
	for i, want := range []int{90, 180, 0, 0} {
		if ds[i].ForecastTop != want {
			t.Errorf("%s: top %d, want %d", ds[i].Slug, ds[i].ForecastTop, want)
		}
	}
	if ds[0].Forecast != "40-90m" || ds[3].Forecast != "" {
		t.Errorf("forecast kept as written, none when absent: %q %q", ds[0].Forecast, ds[3].Forecast)
	}
	if len(problems) != 1 || !strings.HasSuffix(problems[0].Path, "0003-soon.md") || !strings.Contains(problems[0].Msg, `"soon"`) || problems[0].Unread {
		t.Errorf("one read problem for soon only: %+v", problems)
	}
}

func TestForecastTopMinutes(t *testing.T) {
	for in, want := range map[string]int{"40-90m": 90, "1.5-3h": 180, "70-110m": 110, "70-110min": 110, "1-2m": 2, "0.5-1.25h": 75, "40–90m": 90} {
		if got, err := model.ForecastTopMinutes(in); err != nil || got != want {
			t.Errorf("%s: %d %v, want %d", in, got, err, want)
		}
	}
	for _, in := range []string{"soon", "90m", "40-90", "90-40m", "0-0m", "40-90 days"} {
		if _, err := model.ForecastTopMinutes(in); err == nil {
			t.Errorf("%q should not parse", in)
		}
	}
}

// T2's scan half (FR-2): RuledAt is the time of the commit where
// `status: ruled` first appears on the record, not a later edit's.
func TestRulingCommitTime(t *testing.T) {
	root := t.TempDir()
	wo := filepath.Join(root, workingOnDir)
	dd := filepath.Join(wo, decisionsDir)
	if err := os.MkdirAll(filepath.Join(wo, doneDir), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(dd, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(p, s string) {
		t.Helper()
		if err := os.WriteFile(p, []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	run := func(date string, args ...string) {
		t.Helper()
		cmd := exec.Command("git", append([]string{"-C", root}, args...)...)
		cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t",
			"GIT_AUTHOR_DATE="+date, "GIT_COMMITTER_DATE="+date)
		if out, err := cmd.CombinedOutput(); err != nil {
			t.Fatalf("git %v: %v\n%s", args, err, out)
		}
	}
	rec := filepath.Join(dd, "0124-accept.md")
	head := "---\ntitle: Accept\nraised: 2026-10-14\nforecast: 40-90m\ncards: [a-now, b-done]\noptions: [ok]\n"
	write(filepath.Join(wo, initiativeFile), "id: tw\n")
	write(rec, head+"status: proposed\n---\n")
	run("2026-10-14T09:00:00+00:00", "init", "-q")
	run("2026-10-14T09:00:00+00:00", "add", ".")
	run("2026-10-14T09:00:00+00:00", "commit", "-q", "-m", "raise")
	write(rec, head+"status: ruled\nruled: 2026-10-14\nruled_by: pablo\nchosen: ok\n---\n")
	run("2026-10-14T10:30:00+00:00", "commit", "-q", "-am", "rule")
	write(rec, head+"status: ruled\nruled: 2026-10-14\nruled_by: pablo\nchosen: ok\n---\n\nA note later.\n")
	write(filepath.Join(wo, "a-now.md"), "---\ntitle: A\nstatus: now\nseat: a-build\n---\n")
	write(filepath.Join(wo, doneDir, "b-done.md"), "---\ntitle: B\nstatus: done\n---\n")
	run("2026-10-14T11:00:00+00:00", "add", ".")
	run("2026-10-14T11:00:00+00:00", "commit", "-q", "-m", "cards and a note")

	si := ReadInitiative(root, Options{Git: true, GitTimeout: 5 * time.Second, Now: func() time.Time { return time.Now() }})
	if len(si.Decisions) != 1 {
		t.Fatalf("one record: %+v %+v", si.Decisions, si.Problems)
	}
	got, err := time.Parse(time.RFC3339, si.Decisions[0].RuledAt)
	if err != nil || !got.Equal(time.Date(2026, 10, 14, 10, 30, 0, 0, time.UTC)) {
		t.Errorf("RuledAt %q, want the ruling commit 10:30Z", si.Decisions[0].RuledAt)
	}
	if si := ReadInitiative(root, Options{Now: time.Now}); si.Decisions[0].RuledAt != "" {
		t.Errorf("no git, no ruling time: %q", si.Decisions[0].RuledAt)
	}
}
