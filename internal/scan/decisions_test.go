package scan

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

func writeDecision(t *testing.T, dir, name, content string) {
	t.Helper()
	if err := os.WriteFile(filepath.Join(dir, name), []byte(content), 0o644); err != nil {
		t.Fatal(err)
	}
}

func TestReadDecisions(t *testing.T) {
	dir := t.TempDir()
	writeDecision(t, dir, "0002-later.md", "---\ntitle: Which polish\nstatus: proposed\nraised: 2026-09-02\nowner: pablo\noptions: [tray, none]\n---\n\n## Question\n\nwhich\n")
	writeDecision(t, dir, "0001-first.md", "---\ntitle: Firebase\nstatus: superseded\nraised: 2026-09-02\nruled: 2026-09-04\nruled_by: pablo\noptions: [a, b]\nchosen: b\nsuperseded_by: \"0003\"\n---\n")
	writeDecision(t, dir, "0003-second.md", "---\ntitle: Auth off\nstatus: ruled\nraised: 2026-09-16\nruled: 2026-09-16\nruled_by: pablo\nsupersedes: [\"0001\"]\n---\n")
	writeDecision(t, dir, "notes.md", "not a record")

	ds, problems := readDecisions(dir, nil)
	if len(ds) != 3 || ds[0].Number != "0001" || ds[2].Slug != "second" {
		t.Fatalf("decisions in number order from the file name: %+v", ds)
	}
	if len(problems) != 1 || !strings.Contains(problems[0].Msg, "NNNN-slug") {
		t.Errorf("only the misnamed file is a problem: %+v", problems)
	}
	if ds[1].Body == "" || !ds[1].Open() || ds[0].Open() {
		t.Errorf("body and open state: %+v", ds[1])
	}
	if got := ds[0].TurnaroundDays(); got != 2 {
		t.Errorf("turnaround %d, want 2", got)
	}
	if got := ds[1].TurnaroundDays(); got != -1 {
		t.Errorf("an open decision has no turnaround, got %d", got)
	}
	if got := ds[1].AgeDays(time.Date(2026, 9, 26, 15, 0, 0, 0, time.Local)); got != 24 {
		t.Errorf("age %d, want 24", got)
	}
}

func TestCheckDecision(t *testing.T) {
	for _, tc := range []struct {
		name string
		d    model.Decision
		want string
	}{
		{"unknown status", model.Decision{Title: "x", Status: "decided", Raised: "2026-09-01"}, "unknown decision status"},
		{"ruled without a ruler", model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-01", Ruled: "2026-09-02"}, "without ruled and ruled_by"},
		{"proposed with a ruling", model.Decision{Title: "x", Status: "proposed", Raised: "2026-09-01", Chosen: "a"}, "carries a ruling"},
		{"chosen outside options", model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-01", Ruled: "2026-09-01", RuledBy: "pablo", Options: []string{"a"}, Chosen: "b"}, "not one of the options"},
		{"ruled before raised", model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-05", Ruled: "2026-09-01", RuledBy: "pablo"}, "before it was raised"},
		{"superseded without successor", model.Decision{Title: "x", Status: "superseded", Raised: "2026-09-01", Ruled: "2026-09-01", RuledBy: "pablo"}, "without superseded_by"},
		{"bad date", model.Decision{Title: "x", Status: "proposed", Raised: "last week"}, "not YYYY-MM-DD"},
	} {
		ps := checkDecision(tc.d)
		if len(ps) == 0 || !strings.Contains(ps[0].Msg, tc.want) {
			t.Errorf("%s: got %+v, want %q", tc.name, ps, tc.want)
		}
	}
	ok := model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-01", Ruled: "2026-09-01", RuledBy: "pablo", Options: []string{"a"}, Chosen: "a"}
	if ps := checkDecision(ok); len(ps) != 0 {
		t.Errorf("a well-formed ruling is not a problem: %+v", ps)
	}
}

func TestDecisionLinks(t *testing.T) {
	ps := checkDecisionLinks([]model.Decision{
		{Number: "0001", Path: "a", SupersededBy: "0009"},
		{Number: "0001", Path: "b"},
	})
	if len(ps) != 2 {
		t.Fatalf("a duplicate number and a dangling reference: %+v", ps)
	}
}
