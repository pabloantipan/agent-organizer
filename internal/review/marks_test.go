package review

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// marksRepo is a module whose branch c1 changes A and B on top of main,
// and a map of it built under a fresh data dir.
func marksRepo(t *testing.T) (fixture, *RevMap) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	f := fixture{t: t, dir: t.TempDir()}
	f.git("init", "-q", "-b", "main")
	f.write("go.mod", "module example.com/m\n\ngo 1.22\n")
	f.write("p/a.go", "package p\n\nfunc A() int { return 1 }\n\nfunc B() int { return 1 }\n")
	f.git("add", ".")
	f.git("commit", "-q", "-m", "base")
	f.git("checkout", "-q", "-b", "c1")
	f.write("p/a.go", "package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 2 }\n")
	f.git("commit", "-q", "-am", "A and B return 2")
	f.git("checkout", "-q", "main")
	return f, buildMap(t, f)
}

func buildMap(t *testing.T, f fixture) *RevMap {
	t.Helper()
	rs, err := CardRanges("c1", "c1", []Repo{{Dir: f.dir}})
	if err != nil {
		t.Fatal(err)
	}
	rm, err := Build("init-m", "c1", rs, []Source{GoTypes{}}, t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	return rm
}

func textIn(f fixture, rm *RevMap) TextOf {
	return func(n Node) (string, error) { return SymbolText(rm, []Repo{{Dir: f.dir}}, n) }
}

// D4 (FR-16): marks land in the data dir's state.json beside the map and
// nowhere in the repo; question and blocked refuse an empty note; a remap
// after the branch moved carries the mark whose symbol's text did not
// change and reports the other as changed since you reviewed.
func TestMarksCarryAcrossRemap(t *testing.T) {
	f, rm := marksRepo(t)
	at := time.Date(2026, 10, 18, 9, 0, 0, 0, time.UTC)
	a, b := "go:example.com/m/p.A", "go:example.com/m/p.B"
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "question", "  ", "pablo", at); err == nil || !strings.Contains(err.Error(), "needs a note") {
		t.Errorf("question with no note: %v", err)
	}
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "blocked", "", "pablo", at); err == nil {
		t.Error("blocked with no note was kept")
	}
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "maybe", "", "pablo", at); err == nil {
		t.Error("an unknown mark was kept")
	}
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "reviewed", "", "pablo", at); err != nil {
		t.Fatal(err)
	}
	m, err := SetMark("init-m", "c1", rm, textIn(f, rm), b, "question", "why 2?", "pablo", at)
	if err != nil {
		t.Fatal(err)
	}
	if len(m.Marks) != 2 || m.Marks[0].By != "pablo" || m.Marks[1].Note != "why 2?" || m.Marks[0].Hash == "" || m.Marks[0].At != "2026-10-18T09:00:00Z" {
		t.Errorf("marks %+v", m.Marks)
	}
	state := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer", "review", "init-m", rm.Head, "state.json")
	if _, err := os.Stat(state); err != nil {
		t.Errorf("no %s: %v", state, err)
	}
	if out := f.git("status", "--porcelain", "--ignored"); out != "" {
		t.Errorf("the repo changed: %q", out)
	}

	// the branch moves: B changes again, A's text stays
	f.git("checkout", "-q", "c1")
	f.write("p/a.go", "package p\n\nconst k = 0 // A moves down two lines\n\nfunc A() int { return 2 }\n\nfunc B() int { return 3 }\n")
	f.git("commit", "-q", "-am", "B returns 3")
	f.git("checkout", "-q", "main")
	rm2 := buildMap(t, f)
	if rm2.Head == rm.Head {
		t.Fatal("the head did not move")
	}
	m2, err := ReadMarks("init-m", "c1", rm2, textIn(f, rm2))
	if err != nil {
		t.Fatal(err)
	}
	if len(m2.Marks) != 1 || m2.Marks[0].Symbol != a || m2.Marks[0].From != rm.Head || m2.From != rm.Head {
		t.Errorf("carried %+v", m2.Marks)
	}
	if len(m2.Changed) != 1 || m2.Changed[0].Symbol != b || m2.Changed[0].Note != "why 2?" {
		t.Errorf("changed %+v", m2.Changed)
	}
	// the old head's marks stay as they were
	if old, _ := ReadMarks("init-m", "c1", rm, textIn(f, rm)); len(old.Marks) != 2 || len(old.Changed) != 0 {
		t.Errorf("old head %+v", old)
	}
	// marking B on the new head takes it out of changed
	m3, err := SetMark("init-m", "c1", rm2, textIn(f, rm2), b, "reviewed", "", "pablo", at)
	if err != nil || len(m3.Marks) != 2 || len(m3.Changed) != 0 {
		t.Errorf("after marking B: %+v %v", m3, err)
	}
	// clearing a mark
	if m4, err := SetMark("init-m", "c1", rm2, textIn(f, rm2), a, "", "", "pablo", at); err != nil || len(m4.Marks) != 1 {
		t.Errorf("clear: %+v %v", m4, err)
	}
}

// D3, the package half (FR-14): a range plus 3 lines each side at base and
// head, clipped to the file; a path out of the repo and a non-sha refused.
func TestReadRange(t *testing.T) {
	f := fixture{t: t, dir: t.TempDir()}
	f.git("init", "-q", "-b", "main")
	var lines []string
	for i := 1; i <= 20; i++ {
		lines = append(lines, "line "+string(rune('a'+i-1)))
	}
	f.write("f.txt", strings.Join(lines, "\n")+"\n")
	f.git("add", ".")
	f.git("commit", "-q", "-m", "base")
	base := f.git("rev-parse", "HEAD")
	lines[9] = "line J changed"
	f.write("f.txt", strings.Join(lines, "\n")+"\n")
	f.git("commit", "-q", "-am", "head")
	head := f.git("rev-parse", "HEAD")

	tx, err := ReadRange(f.dir, base, "f.txt", 10, 11)
	if err != nil {
		t.Fatal(err)
	}
	if tx.First != 7 || len(tx.Lines) != 8 || tx.Lines[3] != "line j" || tx.Total != 20 {
		t.Errorf("base %+v", tx)
	}
	tx, err = ReadRange(f.dir, head, "f.txt", 10, 10)
	if err != nil || tx.First != 7 || len(tx.Lines) != 7 || tx.Lines[3] != "line J changed" {
		t.Errorf("head %+v %v", tx, err)
	}
	if tx, err := ReadRange(f.dir, head, "f.txt", 1, 2); err != nil || tx.First != 1 || len(tx.Lines) != 5 {
		t.Errorf("clipped at the top %+v %v", tx, err)
	}
	if tx, err := ReadRange(f.dir, head, "f.txt", 19, 20); err != nil || tx.First != 16 || len(tx.Lines) != 5 {
		t.Errorf("clipped at the bottom %+v %v", tx, err)
	}
	for _, p := range []string{"../f.txt", "/etc/hosts", "a/../../f.txt", "", "."} {
		if _, err := ReadRange(f.dir, head, p, 1, 1); err == nil || !strings.Contains(err.Error(), "outside the repo") {
			t.Errorf("%q: %v", p, err)
		}
	}
	if _, err := ReadRange(f.dir, "--output=/tmp/x", "f.txt", 1, 1); err == nil {
		t.Error("a flag as sha was read")
	}
	if _, err := ReadRange(f.dir, head, "nope.txt", 1, 1); err == nil {
		t.Error("a missing file was read")
	}
}

// v3 FR-26: the review's thread and a mark's asked id are kept on the
// head's marks; the thread and the asked mark carry to the next head.
func TestMarksKeepThreadAndAsked(t *testing.T) {
	f, rm := marksRepo(t)
	at := time.Date(2026, 10, 18, 9, 0, 0, 0, time.UTC)
	a := "go:example.com/m/p.A"
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "question", "why 2?", "pablo", at); err != nil {
		t.Fatal(err)
	}
	if _, err := SetAsked("init-m", rm.Head, "go:example.com/m/p.Z", "T1", "M1", "why 2?"); err == nil {
		t.Error("asked on a symbol with no mark")
	}
	m, err := SetAsked("init-m", rm.Head, a, "T1", "M1", "why 2?")
	if err != nil || m.Thread != "T1" || m.Marks[0].Asked != "M1" {
		t.Fatalf("asked %+v %v", m, err)
	}
	if back, _ := ReadMarks("init-m", "c1", rm, textIn(f, rm)); back.Thread != "T1" || back.Marks[0].Asked != "M1" {
		t.Errorf("read back %+v", back)
	}
	f.git("checkout", "-q", "c1")
	f.write("p/a.go", "package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 3 }\n")
	f.git("commit", "-q", "-am", "B returns 3")
	f.git("checkout", "-q", "main")
	rm2 := buildMap(t, f)
	m2, err := ReadMarks("init-m", "c1", rm2, textIn(f, rm2))
	if err != nil || m2.Thread != "T1" || len(m2.Marks) != 1 || m2.Marks[0].Asked != "M1" {
		t.Errorf("carried %+v %v", m2, err)
	}
}

// K1 (leftovers-44 FR-1): a Save never forgets an ask. An asked mark saved
// with an edited note, then saved as reviewed, keeps Asked, AskedThread
// and AskedNote, the note it was asked with, both times, on disk too.
func TestSetMarkKeepsTheAsk(t *testing.T) {
	f, rm := marksRepo(t)
	at := time.Date(2026, 10, 18, 9, 0, 0, 0, time.UTC)
	a := "go:example.com/m/p.A"
	if _, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "question", "why 2?", "pablo", at); err != nil {
		t.Fatal(err)
	}
	if _, err := SetAsked("init-m", rm.Head, a, "T1", "M1", "  why 2?\n"); err != nil {
		t.Fatal(err)
	}
	asked := func(step string, m Marks, state, note string) {
		t.Helper()
		if len(m.Marks) != 1 {
			t.Fatalf("%s: %+v", step, m.Marks)
		}
		mk := m.Marks[0]
		if mk.State != state || mk.Note != note || mk.Asked != "M1" || mk.AskedThread != "T1" || mk.AskedNote != "why 2?" {
			t.Errorf("%s: %+v", step, mk)
		}
		if m.ThreadOf(mk) != "T1" {
			t.Errorf("%s: thread of %q", step, m.ThreadOf(mk))
		}
	}
	m, err := SetMark("init-m", "c1", rm, textIn(f, rm), a, "question", "why 2, not 3?", "pablo", at.Add(time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	asked("note edited", m, "question", "why 2, not 3?")
	m, err = SetMark("init-m", "c1", rm, textIn(f, rm), a, "reviewed", "why 2, not 3?", "pablo", at.Add(2*time.Minute))
	if err != nil {
		t.Fatal(err)
	}
	asked("reviewed", m, "reviewed", "why 2, not 3?")
	back, err := ReadMarks("init-m", "c1", rm, textIn(f, rm))
	if err != nil {
		t.Fatal(err)
	}
	asked("read back", back, "reviewed", "why 2, not 3?")
	raw, _ := os.ReadFile(StatePath("init-m", rm.Head))
	if !strings.Contains(string(raw), `"asked_note": "why 2?"`) {
		t.Errorf("state.json:\n%s", raw)
	}
	// a mark never asked writes no ask fields
	b := "go:example.com/m/p.B"
	if m, err = SetMark("init-m", "c1", rm, textIn(f, rm), b, "reviewed", "", "pablo", at); err != nil {
		t.Fatal(err)
	}
	for _, mk := range m.Marks {
		if mk.Symbol == b && (mk.Asked != "" || mk.AskedThread != "" || mk.AskedNote != "") {
			t.Errorf("never asked: %+v", mk)
		}
	}
}
