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

// questionFixture is hestia 0037's frontmatter (testdata/questions), read
// from the repo and returned as text; tests write their copies to temp dirs.
func questionFixture(t *testing.T) string {
	t.Helper()
	b, err := os.ReadFile(filepath.Join("..", "..", "testdata", "questions", "0037-big-picture-stage.md"))
	if err != nil {
		t.Fatal(err)
	}
	return string(b)
}

// ruleByHand rules a fixture text by hand, the way hestia's FSE did: status,
// ruled, ruled_by and the given chosen line.
func ruleByHand(src, chosen string) string {
	for _, kv := range [][2]string{
		{"status: proposed", "status: ruled"},
		{"ruled:\n", "ruled: 2026-10-23\n"},
		{"ruled_by:\n", "ruled_by: pablo\n"},
		{"chosen:\n", "chosen: " + chosen + "\n"},
	} {
		src = strings.Replace(src, kv[0], kv[1], 1)
	}
	return src
}

// TestQuestionRecordScan is leftovers-49 Q3 (FR-4): a question record ruled
// with one answer per question reads without a problem; an answer its
// question does not offer is one problem naming it. On main the first is
// reported as "chosen ... is not one of the options".
func TestQuestionRecordScan(t *testing.T) {
	for _, tc := range []struct {
		name, chosen, want string
	}{
		{"both answered", `"Q1 after-graph-performs-start-now, Q2 record-page"`, ""},
		{"an alternative Q2 does not offer", `"Q1 after-graph-performs-start-now, Q2 nope"`, "Q2 nope is not one of Q2's alternatives"},
	} {
		t.Run(tc.name, func(t *testing.T) {
			dir := t.TempDir()
			writeDecision(t, dir, "0037-big-picture-stage.md", ruleByHand(questionFixture(t), tc.chosen))
			ds, ps := readDecisions(dir, nil)
			if len(ds) != 1 || len(ds[0].Options) != 2 {
				t.Fatalf("decisions %+v", ds)
			}
			if tc.want == "" {
				if len(ps) != 0 {
					t.Errorf("problems %+v, want none", ps)
				}
				return
			}
			if len(ps) != 1 || !strings.Contains(ps[0].Msg, tc.want) {
				t.Errorf("problems %+v, want one naming %q", ps, tc.want)
			}
		})
	}
}

// TestQuestionRecord0038 is Q3 under Amendment 1: hestia 0038 as ruled
// (testdata/questions, a first question with one alternative, chosen fixed
// by hand) reads with no problem. On main: "is not one of the options".
func TestQuestionRecord0038(t *testing.T) {
	b, err := os.ReadFile(filepath.Join("..", "..", "testdata", "questions", "0038-usage-exit-amended-by-0018.md"))
	if err != nil {
		t.Fatal(err)
	}
	dir := t.TempDir()
	writeDecision(t, dir, "0038-usage-exit-amended-by-0018.md", string(b))
	ds, ps := readDecisions(dir, nil)
	if len(ds) != 1 || ds[0].Chosen != "Q1 amend-exit, Q2 threads-and-specs-ok" || len(Questions(ds[0].Options)) != 2 {
		t.Fatalf("decisions %+v", ds)
	}
	if len(ps) != 0 {
		t.Errorf("problems %+v, want none", ps)
	}
}

// TestQuestionRecordOneQuestion is the scan's half of Q2: a one-question
// record takes `b` and `Q1 b` alike.
func TestQuestionRecordOneQuestion(t *testing.T) {
	for _, tc := range []struct {
		options []string
		chosen  string
	}{
		{[]string{"Q1 a | b"}, "b"},
		{[]string{"Q1 a | b"}, "Q1 b"},
		{[]string{"Q1 start-now, Q2 record-page"}, "Q1 start-now, Q2 record-page"},
	} {
		d := model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-01", Ruled: "2026-09-01", RuledBy: "pablo", Options: tc.options, Chosen: tc.chosen}
		if ps := checkDecision(d); len(ps) != 0 {
			t.Errorf("%v chosen %q: %+v, want no problem", tc.options, tc.chosen, ps)
		}
	}
	// Numbered any other way, the list is plain and held to its items.
	d := model.Decision{Title: "x", Status: "ruled", Raised: "2026-09-01", Ruled: "2026-09-01", RuledBy: "pablo", Options: []string{"Q2 a | b", "Q3 x | y"}, Chosen: "Q2 a, Q3 x"}
	if ps := checkDecision(d); len(ps) != 1 || !strings.Contains(ps[0].Msg, "not one of the options") {
		t.Errorf("Q2/Q3 list: %+v, want the plain problem", ps)
	}
}

func TestQuestions(t *testing.T) {
	for _, tc := range []struct {
		name    string
		options []string
		want    [][]string // per question: label, then alternatives
	}{
		{"two questions", []string{"Q1 a | b | c", "Q2 x | y"}, [][]string{{"Q1", "a", "b", "c"}, {"Q2", "x", "y"}}},
		{"spaces around the bar are trimmed", []string{"Q1 a|b  |  c"}, [][]string{{"Q1", "a", "b", "c"}}},
		{"plain options", []string{"tray", "fsnotify", "none"}, nil},
		{"one item plain", []string{"Q1 a | b", "none"}, nil},
		{"one alternative (hestia 0038)", []string{"Q1 amend-exit", "Q2 a | b"}, [][]string{{"Q1", "amend-exit"}, {"Q2", "a", "b"}}},
		{"one question of one alternative", []string{"Q1 a"}, [][]string{{"Q1", "a"}}},
		{"not numbered from 1", []string{"Q2 a | b", "Q3 x | y"}, nil},
		{"a number skipped", []string{"Q1 a | b", "Q3 x | y"}, nil},
		{"out of order", []string{"Q2 a | b", "Q1 x | y"}, nil},
		{"Q1 twice (full-answer options)", []string{"Q1 start-now, Q2 record-page", "Q1 wait, Q2 record-page"}, nil},
		{"an empty alternative", []string{"Q1 a | | b"}, nil},
		{"no options", nil, nil},
	} {
		qs := Questions(tc.options)
		var got [][]string
		for _, q := range qs {
			got = append(got, append([]string{q.Label}, q.Alts...))
		}
		if strings.Join(flat(got), "/") != strings.Join(flat(tc.want), "/") || (qs == nil) != (tc.want == nil) {
			t.Errorf("%s: got %v, want %v", tc.name, got, tc.want)
		}
	}
}

func flat(xs [][]string) []string {
	var out []string
	for _, x := range xs {
		out = append(out, strings.Join(x, ","))
	}
	return out
}

func TestCheckAnswers(t *testing.T) {
	qs := Questions([]string{"Q1 a | b, c", "Q2 x | y"})
	for _, tc := range []struct{ chosen, want string }{
		{"Q1 a, Q2 y", ""},
		{"Q1 b, c, Q2 x", ""},
		{"Q1 a", "does not answer Q2"},
		{"Q2 x, Q1 a", "does not answer Q1 in its place"},
		{"Q1 nope, Q2 x", "Q1 nope is not one of Q1's alternatives (a, b, c)"},
		{"Q1 a, Q2 x, Q3 z", "answers more than the record's 2 questions"},
		{"a", "does not answer Q1 in its place"},
		{"Q1 a | b, c", "Q1 a | b, c is not one of Q1's alternatives"},
	} {
		err := CheckAnswers(qs, tc.chosen)
		switch {
		case tc.want == "" && err != nil:
			t.Errorf("%q: %v", tc.chosen, err)
		case tc.want != "" && (err == nil || !strings.Contains(err.Error(), tc.want)):
			t.Errorf("%q: %v, want %q", tc.chosen, err, tc.want)
		}
	}
}

// TestChosenPaddedByHand is leftovers-52 T1 (FR-6): a ruled record whose
// chosen was written padded by hand reads with no problem; the scan compares
// trimmed forms. On main the plain record is "not one of the options".
func TestChosenPaddedByHand(t *testing.T) {
	for _, tc := range []struct{ name, options, chosen string }{
		{"a plain record", "[a, b]", `" b "`},
		{"one question", `["Q1 a | b"]`, `" b "`},
		{"two questions", `["Q1 a | b", "Q2 x | y"]`, `" Q1 a , Q2 x "`},
	} {
		t.Run(tc.name, func(t *testing.T) {
			dir := t.TempDir()
			writeDecision(t, dir, "0001-padded.md", "---\ntitle: Padded\nstatus: ruled\nraised: 2026-10-01\nruled: 2026-10-02\nruled_by: pablo\noptions: "+tc.options+"\nchosen: "+tc.chosen+"\n---\n")
			ds, ps := readDecisions(dir, nil)
			if len(ds) != 1 {
				t.Fatalf("decisions %+v", ds)
			}
			if len(ps) != 0 {
				t.Errorf("problems %+v, want none", ps)
			}
		})
	}
}
