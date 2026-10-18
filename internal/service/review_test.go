package service

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/review"
)

// TestReviewHelperProcess is the make's child in these tests: what
// `organizer review <id> <card> --json --out o --work w` does (resolve,
// review.Make, write), over the config in REVIEW_HELPER_ROOT. Mode sleep
// starts a grandchild and waits; mode fail prints an error and exits 1.
func TestReviewHelperProcess(t *testing.T) {
	if os.Getenv("REVIEW_HELPER") == "" {
		return
	}
	args := os.Args
	for i, a := range args {
		if a == "--" {
			args = args[i+1:]
			break
		}
	}
	val := func(flag string) string {
		for i, a := range args {
			if a == flag && i+1 < len(args) {
				return args[i+1]
			}
		}
		return ""
	}
	id, card, out, work := args[1], args[2], val("--out"), val("--work")
	switch os.Getenv("REVIEW_HELPER") {
	case "sleep":
		_ = os.WriteFile(filepath.Join(work, "busy"), nil, 0o644)
		_ = exec.Command("sleep", "60").Run()
		os.Exit(0)
	case "fail":
		fmt.Fprintln(os.Stderr, "boom: the build failed")
		fmt.Fprintln(os.Stderr, "second line")
		os.Exit(1)
	}
	s := NewWith(config.Config{Machine: "lodestar", Roots: []string{os.Getenv("REVIEW_HELPER_ROOT")}, MaxDepth: 2}, cache.State{}, time.Now)
	s.Scan(false)
	si, err := s.initiative(id)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	ranges, _, err := review.Resolve(si, card)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}
	rm, err := review.Make(si, card, card, ranges, work)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
	b, _ := json.Marshal(rm)
	if err := os.WriteFile(out, b, 0o644); err != nil {
		os.Exit(1)
	}
	os.Exit(0)
}

// reviewFixture is initiative rv, a Go repo at its root, with card c1 on
// branch c1 changing A and B; the service is scanned over it, the make
// runs the helper process in mode, and change-check on the PATH is a fake
// that flags nothing.
func reviewFixture(t *testing.T, mode string) (*Service, string) {
	t.Helper()
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	root := filepath.Join(t.TempDir(), "rv")
	write := func(rel, body string) {
		t.Helper()
		p := filepath.Join(root, rel)
		_ = os.MkdirAll(filepath.Dir(p), 0o755)
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("working-on/initiative.yaml", "id: rv\ntitle: Review fixture\nstatus: active\n")
	write("working-on/c1.md", "---\ntitle: c1\nstatus: now\nbranch: c1\nupdated: 2026-10-18\nnext: \"x\"\n---\n")
	write("working-on/c2.md", "---\ntitle: c2\nstatus: next\nbranch: c2\nupdated: 2026-10-18\nnext: \"x\"\n---\n")
	write("go.mod", "module example.com/rv\n\ngo 1.22\n")
	write("p/a.go", "package p\n\nfunc A() int { return 1 }\n\nfunc B() int { return 1 }\n")
	write(".gitignore", "")
	gitIn(t, root, "init", "-q", "-b", "main")
	gitIn(t, root, "add", ".")
	gitIn(t, root, "commit", "-q", "-m", "base")
	gitIn(t, root, "checkout", "-q", "-b", "c1")
	write("p/a.go", "package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 2 }\n")
	gitIn(t, root, "commit", "-q", "-am", "A and B return 2")
	gitIn(t, root, "checkout", "-q", "main")

	fake := t.TempDir()
	if err := os.WriteFile(filepath.Join(fake, "change-check"), []byte("#!/bin/sh\necho '{\"flags\":[]}'\n"), 0o755); err != nil {
		t.Fatal(err)
	}
	t.Setenv("PATH", fake+string(os.PathListSeparator)+os.Getenv("PATH"))
	orig := reviewCommand
	reviewCommand = func(args ...string) (*exec.Cmd, error) {
		cmd := exec.Command(os.Args[0], append([]string{"-test.run=^TestReviewHelperProcess$", "--"}, args...)...)
		cmd.Env = append(os.Environ(), "REVIEW_HELPER="+mode, "REVIEW_HELPER_ROOT="+filepath.Dir(root))
		return cmd, nil
	}
	t.Cleanup(func() { reviewCommand = orig })
	makes.Lock()
	makes.m = map[string]*reviewJob{}
	makes.Unlock()

	now := time.Date(2026, 10, 18, 9, 0, 0, 0, time.UTC)
	s := NewWith(config.Config{Machine: "lodestar", Roots: []string{filepath.Dir(root)}, MaxDepth: 2}, cache.State{}, func() time.Time { return now })
	s.Scan(false)
	if _, err := s.initiative("rv"); err != nil {
		t.Fatalf("fixture not scanned: %v", err)
	}
	return s, root
}

func gitIn(t *testing.T, dir string, args ...string) string {
	t.Helper()
	cmd := exec.Command("git", append([]string{"-C", dir}, args...)...)
	cmd.Env = append(os.Environ(), "GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t", "GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t", "GIT_CONFIG_GLOBAL=/dev/null")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %v: %v\n%s", args, err, out)
	}
	return strings.TrimSpace(string(out))
}

// makeAndWait starts a make and waits for its end.
func makeAndWait(t *testing.T, s *Service, card string) ReviewMake {
	t.Helper()
	done := make(chan ReviewMake, 1)
	if _, err := s.MakeReview("rv", card, func(m ReviewMake) { done <- m }); err != nil {
		t.Fatal(err)
	}
	select {
	case m := <-done:
		return m
	case <-time.After(2 * time.Minute):
		t.Fatal("the make did not end")
	}
	return ReviewMake{}
}

func workDirs(t *testing.T) []string {
	t.Helper()
	ds, _ := filepath.Glob(filepath.Join(review.DataDir(), "review-make-*"))
	ws, _ := filepath.Glob(filepath.Join(review.DataDir(), "review-work-*"))
	return append(ds, ws...)
}

// D2 (FR-14, FR-15): none before a make; the map for the head after it,
// reconciled; moved with both shas once the branch moves; a missing card
// names both the branch and the merge.
func TestReviewStatusMakeMoved(t *testing.T) {
	s, root := reviewFixture(t, "build")
	head := gitIn(t, root, "rev-parse", "c1")
	st, err := s.ReviewStatus("rv", "c1")
	if err != nil || st.State != ReviewNone || st.Head != head || st.Make != nil {
		t.Fatalf("before: %+v %v", st, err)
	}
	m := makeAndWait(t, s, "c1")
	if m.State == MakeFailed {
		t.Logf("stderr of a failed make: %s", m.Error)
	}
	if m.State != MakeDone || m.Head != head || m.Command != "organizer review rv c1 --json" {
		t.Fatalf("make %+v", m)
	}
	if ws := workDirs(t); len(ws) != 0 {
		t.Errorf("work dirs left: %v", ws)
	}
	st, _ = s.ReviewStatus("rv", "c1")
	if st.State != ReviewMap || st.MapHead != head || st.MapPath != review.DefaultPath("rv", head) || st.Make == nil || st.Make.State != MakeDone {
		t.Errorf("after: %+v", st)
	}
	rm, err := s.ReviewMap("rv", "c1", "")
	if err != nil || rm.Head != head || !rm.Reconciled || rm.Reconciliation != "change-check c1" || len(rm.Nodes) == 0 {
		t.Fatalf("map %+v %v", rm, err)
	}

	gitIn(t, root, "checkout", "-q", "c1")
	if err := os.WriteFile(filepath.Join(root, "p/a.go"), []byte("package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 3 }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitIn(t, root, "commit", "-q", "-am", "B returns 3")
	gitIn(t, root, "checkout", "-q", "main")
	moved := gitIn(t, root, "rev-parse", "c1")
	st, _ = s.ReviewStatus("rv", "c1")
	if st.State != ReviewMoved || st.Head != moved || st.MapHead != head {
		t.Errorf("moved: %+v, want head %s map %s", st, moved, head)
	}
	if rm, err := s.ReviewMap("rv", "c1", head); err != nil || rm.Head != head {
		t.Errorf("old map: %v", err)
	}
	if _, err := s.ReviewMap("rv", "c1", ""); err == nil {
		t.Error("a map for the moved head that was never made")
	}
	st, _ = s.ReviewStatus("rv", "c2")
	if st.State != ReviewMissing || !strings.Contains(st.Reason, "branch c2 of card c2 does not exist") || !strings.Contains(st.Reason, `"merge: c2 "`) {
		t.Errorf("missing: %+v", st)
	}
	if _, err := s.MakeReview("rv", "c2", nil); err == nil {
		t.Error("a make of a missing card started")
	}
	if out := gitIn(t, root, "status", "--porcelain", "--ignored"); out != "" {
		t.Errorf("the repo changed: %q", out)
	}
}

// D2: a second make of the card while one runs is refused; Stop kills it
// (and its child) and leaves no map and no work dir.
func TestReviewMakeOnceAndStop(t *testing.T) {
	s, root := reviewFixture(t, "sleep")
	head := gitIn(t, root, "rev-parse", "c1")
	m, err := s.MakeReview("rv", "c1", nil)
	if err != nil || m.State != MakeRunning || m.Started == "" {
		t.Fatalf("start %+v %v", m, err)
	}
	if _, err := s.MakeReview("rv", "c1", nil); err == nil || !strings.Contains(err.Error(), "already being made") {
		t.Errorf("second make: %v", err)
	}
	if st, _ := s.ReviewStatus("rv", "c1"); st.Make == nil || st.Make.State != MakeRunning {
		t.Errorf("status while making: %+v", st)
	}
	deadline := time.Now().Add(10 * time.Second)
	for len(workDirs(t)) == 0 || !fileExists(filepath.Join(workDirs(t)[0], "busy")) {
		if time.Now().After(deadline) {
			t.Fatal("the make never started working")
		}
		time.Sleep(20 * time.Millisecond)
	}
	stopped, err := s.StopReview("rv", "c1")
	if err != nil || stopped.State != MakeStopped {
		t.Fatalf("stop %+v %v", stopped, err)
	}
	if ws := workDirs(t); len(ws) != 0 {
		t.Errorf("work dirs left: %v", ws)
	}
	if fileExists(review.DefaultPath("rv", head)) {
		t.Error("a stopped make left a map")
	}
	if st, _ := s.ReviewStatus("rv", "c1"); st.State != ReviewNone || st.Make.State != MakeStopped {
		t.Errorf("after stop: %+v", st)
	}
}

// FR-15: a failed make returns its first error line and the command.
func TestReviewMakeFails(t *testing.T) {
	s, _ := reviewFixture(t, "fail")
	m := makeAndWait(t, s, "c1")
	if m.State != MakeFailed || m.Error != "boom: the build failed" || m.Command != "organizer review rv c1 --json" {
		t.Errorf("failed make %+v", m)
	}
	if ws := workDirs(t); len(ws) != 0 {
		t.Errorf("work dirs left: %v", ws)
	}
}

// D3 (FR-14): a range read at base and head with 3 lines of context;
// another machine's card and a path outside the repo are refused.
func TestReviewFile(t *testing.T) {
	s, root := reviewFixture(t, "build")
	base, head := gitIn(t, root, "merge-base", "main", "c1"), gitIn(t, root, "rev-parse", "c1")
	tx, err := s.ReviewFile("rv", "c1", base, "p/a.go", 3, 3)
	if err != nil || tx.First != 1 || len(tx.Lines) != 5 || tx.Lines[2] != "func A() int { return 1 }" {
		t.Errorf("base %+v %v", tx, err)
	}
	tx, err = s.ReviewFile("rv", "c1", head, "p/a.go", 5, 5)
	if err != nil || tx.First != 2 || len(tx.Lines) != 4 || tx.Lines[3] != "func B() int { return 2 }" || tx.Total != 5 {
		t.Errorf("head %+v %v", tx, err)
	}
	for _, p := range []string{"../rv/p/a.go", "/etc/hosts", "p/../../x"} {
		if _, err := s.ReviewFile("rv", "c1", head, p, 1, 1); err == nil || !strings.Contains(err.Error(), "outside the repo") {
			t.Errorf("%q: %v", p, err)
		}
	}
	s.mu.Lock()
	s.state.Remote = []model.Snapshot{{Machine: "odyssey", Initiatives: []model.ScannedInitiative{
		{Initiative: model.Initiative{ID: "rv"}, Cards: []model.Card{{Slug: "far"}}},
		{Initiative: model.Initiative{ID: "elsewhere"}, Cards: []model.Card{{Slug: "c1"}}},
	}}}
	s.mu.Unlock()
	for _, c := range [][2]string{{"rv", "far"}, {"elsewhere", "c1"}} {
		_, err := s.ReviewFile(c[0], c[1], head, "p/a.go", 1, 1)
		if err == nil || !strings.Contains(err.Error(), "is on odyssey, not this machine") {
			t.Errorf("%v: %v", c, err)
		}
		if _, err := s.ReviewStatus(c[0], c[1]); err == nil {
			t.Errorf("status of %v", c)
		}
		if _, err := s.MakeReview(c[0], c[1], nil); err == nil {
			t.Errorf("make of %v", c)
		}
	}
}

// D4 (FR-16): marks signed by the ruler land under the data dir only; a
// question with no note is refused; after the branch moves and the map is
// made again, the unchanged symbol keeps its mark and the changed one is
// changed since you reviewed.
func TestReviewMarksAcrossRemap(t *testing.T) {
	s, root := reviewFixture(t, "build")
	makeAndWait(t, s, "c1")
	head := gitIn(t, root, "rev-parse", "c1")
	a, b := "go:example.com/rv/p.A", "go:example.com/rv/p.B"
	if _, err := s.MarkReview("rv", "c1", "", a, "question", " "); err == nil || !strings.Contains(err.Error(), "needs a note") {
		t.Errorf("question with no note: %v", err)
	}
	if _, err := s.MarkReview("rv", "c1", "", a, "reviewed", ""); err != nil {
		t.Fatal(err)
	}
	m, err := s.MarkReview("rv", "c1", "", b, "blocked", "returns the wrong thing")
	if err != nil || len(m.Marks) != 2 || m.Marks[0].By != "pablo" || m.Marks[0].At != "2026-10-18T09:00:00Z" {
		t.Fatalf("marks %+v %v", m, err)
	}
	state := filepath.Join(os.Getenv("XDG_DATA_HOME"), "organizer", "review", "rv", head, "state.json")
	if !fileExists(state) {
		t.Errorf("no %s", state)
	}
	if out := gitIn(t, root, "status", "--porcelain", "--ignored"); out != "" {
		t.Errorf("the repo changed: %q", out)
	}

	gitIn(t, root, "checkout", "-q", "c1")
	if err := os.WriteFile(filepath.Join(root, "p/a.go"), []byte("package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 3 }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitIn(t, root, "commit", "-q", "-am", "B returns 3")
	gitIn(t, root, "checkout", "-q", "main")
	makeAndWait(t, s, "c1")
	m2, err := s.ReviewMarks("rv", "c1", "")
	if err != nil {
		t.Fatal(err)
	}
	if len(m2.Marks) != 1 || m2.Marks[0].Symbol != a || len(m2.Changed) != 1 || m2.Changed[0].Symbol != b || m2.From != head {
		t.Errorf("after the remap %+v", m2)
	}
	if old, err := s.ReviewMarks("rv", "c1", head); err != nil || len(old.Marks) != 2 {
		t.Errorf("old head's marks %+v %v", old, err)
	}
}

// fakeMailbox is a discuss API on httptest: health lists agents, posts
// open a thread when none is named, and a thread in closed refuses with
// the server's 409 sentence. Nothing reaches a real mailbox.
type fakeMailbox struct {
	sync.Mutex
	srv    *httptest.Server
	agents []string
	closed map[string]bool
	posts  []map[string]string
	n      int
}

func newFakeMailbox(t *testing.T, s *Service, project string, agents ...string) *fakeMailbox {
	t.Helper()
	f := &fakeMailbox{agents: agents, closed: map[string]bool{}}
	f.srv = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		f.Lock()
		defer f.Unlock()
		switch {
		case r.URL.Path == "/healthz":
			w.WriteHeader(200)
		case r.Method == "GET" && r.URL.Path == "/projects/"+project+"/health":
			rows := []map[string]string{}
			for _, a := range f.agents {
				rows = append(rows, map[string]string{"agent": a, "watcher": "alive"})
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"agents": rows, "threads": []any{}})
		case r.Method == "POST" && r.URL.Path == "/projects/"+project+"/messages":
			var p map[string]string
			_ = json.NewDecoder(r.Body).Decode(&p)
			if f.closed[p["thread_id"]] {
				w.WriteHeader(http.StatusConflict)
				_, _ = fmt.Fprintf(w, `{"error":"posting %s to thread %s (status closed): thread is not open"}`, p["kind"], p["thread_id"])
				return
			}
			f.n++
			if p["thread_id"] == "" {
				p["thread_id"] = fmt.Sprintf("T%d", f.n)
			}
			p["id"] = fmt.Sprintf("M%d", f.n)
			f.posts = append(f.posts, p)
			_ = json.NewEncoder(w).Encode(map[string]string{"id": p["id"], "thread_id": p["thread_id"]})
		default:
			http.NotFound(w, r)
		}
	}))
	t.Cleanup(f.srv.Close)
	state := t.TempDir()
	if err := os.WriteFile(filepath.Join(state, "tokens.json"), []byte(`{"tokens":{"fake-token":{"project":"`+project+`","agent":"pablo"}}}`), 0o600); err != nil {
		t.Fatal(err)
	}
	t.Setenv("DISCUSS_BIND", strings.TrimPrefix(f.srv.URL, "http://"))
	s.mu.Lock()
	s.cfg.DiscussStateDir = state
	s.mu.Unlock()
	return f
}

// withCell gives the fixture's initiative a cell and card c1 a next action,
// then rescans.
func withCell(t *testing.T, s *Service, root, cell, next string) {
	t.Helper()
	if cell != "" {
		_ = os.MkdirAll(filepath.Join(root, "agents"), 0o755)
		if err := os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(cell), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	card := "---\ntitle: c1\nstatus: now\nbranch: c1\nupdated: 2026-10-18\nnext: \"" + next + "\"\n---\n"
	if err := os.WriteFile(filepath.Join(root, "working-on", "c1.md"), []byte(card), 0o644); err != nil {
		t.Fatal(err)
	}
	s.Scan(false)
}

const cellWithFSE = `{"project":"rv","human":"pablo","agents":["fse"],"reconciler":""}`

// A1 (v3 FR-25): the supervisor at the start of next when health lists
// it; else the FSE; else the reconciler; else nobody, saying why; another
// machine's card refused.
func TestReviewAddressee(t *testing.T) {
	s, root := reviewFixture(t, "build")
	newFakeMailbox(t, s, "rv", "pablo", "fse", "sup81")
	check := func(name, seat, why string) {
		t.Helper()
		got, err := s.ReviewAddressee("rv", "c1")
		if err != nil || got.Seat != seat || got.Why != why {
			t.Errorf("%s: %+v %v, want %q %q", name, got, err, seat, why)
		}
	}
	withCell(t, s, root, "", "sup81 runs it (0147 ruled)")
	check("no cell", "", WhyNoCell)
	withCell(t, s, root, cellWithFSE, "sup81 runs it (0147 ruled)")
	check("sup81 in health", "sup81", WhyRunsCard)
	withCell(t, s, root, "", "sup82 runs it (0147 ruled)")
	check("sup82 not in health", "fse", WhyFSE)
	withCell(t, s, root, "", "supper is served")
	check("not a supervisor", "fse", WhyFSE)
	withCell(t, s, root, `{"project":"rv","human":"pablo","agents":["po","dev"],"reconciler":"po"}`, "x")
	check("a reconciler, no fse", "po", WhyReconciler)
	withCell(t, s, root, `{"project":"rv","human":"pablo","agents":["dev"],"reconciler":""}`, "x")
	check("neither", "", WhyNoSeat)

	s.mu.Lock()
	s.state.Remote = []model.Snapshot{{Machine: "odyssey", Initiatives: []model.ScannedInitiative{
		{Initiative: model.Initiative{ID: "rv"}, Cards: []model.Card{{Slug: "far", Next: "sup81 runs it"}}},
	}}}
	s.mu.Unlock()
	if _, err := s.ReviewAddressee("rv", "far"); err == nil || !strings.Contains(err.Error(), "is on odyssey, not this machine") {
		t.Errorf("another machine's card: %v", err)
	}
	if _, err := s.AskReview("rv", "far", "", "x", "question", "why"); err == nil || !strings.Contains(err.Error(), "is on odyssey") {
		t.Errorf("ask on another machine's card: %v", err)
	}
}

// A2 (v3 FR-26): asks on a, b and a again are three messages in one thread
// `c1: review at <sha>` to the seat, kind question; after a remap the new
// head's ask lands in the same thread; a closed thread is replaced once;
// a reviewed mark, an empty note and nobody to ask are refused with no
// write; with the server down the mark is saved without asked and the
// error comes back.
func TestAskReview(t *testing.T) {
	s, root := reviewFixture(t, "build")
	mb := newFakeMailbox(t, s, "rv", "pablo", "fse", "sup81")
	withCell(t, s, root, cellWithFSE, "sup81 runs it (0147 ruled)")
	makeAndWait(t, s, "c1")
	head := gitIn(t, root, "rev-parse", "c1")
	a, b := "go:example.com/rv/p.A", "go:example.com/rv/p.B"
	state := review.StatePath("rv", head)

	for _, c := range []struct{ state, note, want string }{
		{"reviewed", "", "only a question or a block"},
		{"question", "  ", "needs a note"},
	} {
		if _, err := s.AskReview("rv", "c1", "", a, c.state, c.note); err == nil || !strings.Contains(err.Error(), c.want) {
			t.Errorf("%s %q: %v", c.state, c.note, err)
		}
	}
	if fileExists(state) || len(mb.posts) != 0 {
		t.Fatalf("a refusal wrote: state %v, posts %v", fileExists(state), mb.posts)
	}

	r1, err := s.AskReview("rv", "c1", "", a, "question", "why 2?")
	if err != nil || r1.Error != "" || r1.To.Seat != "sup81" || r1.Thread != "T1" || r1.Asked != "M1" {
		t.Fatalf("first ask %+v %v", r1, err)
	}
	r2, _ := s.AskReview("rv", "c1", "", b, "blocked", "B must stay 1")
	r3, _ := s.AskReview("rv", "c1", "", a, "question", "and again?")
	if r2.Thread != "T1" || r3.Thread != "T1" || r3.Asked != "M3" {
		t.Errorf("later asks %+v %+v", r2, r3)
	}
	sha := head[:7]
	if len(mb.posts) != 3 || mb.posts[0]["subject"] != "c1: review at "+sha || mb.posts[1]["subject"] != "" {
		t.Fatalf("posts %v", mb.posts)
	}
	firsts := []string{a + " · p/a.go:3-3 · question", b + " · p/a.go:5-5 · blocked", a + " · p/a.go:3-3 · question"}
	for i, p := range mb.posts {
		lines := strings.Split(p["body"], "\n")
		if p["to"] != "sup81" || p["kind"] != "question" || p["thread_id"] != "T1" || lines[0] != firsts[i] || lines[len(lines)-1] != "Next action: sup81 answers in this thread" {
			t.Errorf("post %d: %v", i, p)
		}
	}
	if got := mb.posts[1]["body"]; !strings.Contains(got, "\nB must stay 1\n") {
		t.Errorf("the note: %q", got)
	}
	m, _ := s.ReviewMarks("rv", "c1", "")
	if m.Thread != "T1" || len(m.Marks) != 2 || m.Marks[0].Asked != "M3" || m.Marks[1].Asked != "M2" {
		t.Errorf("marks %+v", m)
	}

	// a remap: the new head's ask lands in the same thread
	gitIn(t, root, "checkout", "-q", "c1")
	if err := os.WriteFile(filepath.Join(root, "p/a.go"), []byte("package p\n\nfunc A() int { return 2 }\n\nfunc B() int { return 3 }\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	gitIn(t, root, "commit", "-q", "-am", "B returns 3")
	gitIn(t, root, "checkout", "-q", "main")
	makeAndWait(t, s, "c1")
	r4, err := s.AskReview("rv", "c1", "", b, "question", "3 now?")
	if err != nil || r4.Thread != "T1" || mb.posts[3]["thread_id"] != "T1" || mb.posts[3]["subject"] != "" {
		t.Errorf("after the remap %+v %v %v", r4, err, mb.posts[3])
	}

	// the thread closed: one new thread, the new id kept
	mb.Lock()
	mb.closed["T1"] = true
	mb.Unlock()
	r5, err := s.AskReview("rv", "c1", "", a, "question", "closed?")
	newHead := gitIn(t, root, "rev-parse", "c1")
	if err != nil || r5.Error != "" || r5.Thread != "T5" || len(mb.posts) != 5 || mb.posts[4]["subject"] != "c1: review at "+newHead[:7] {
		t.Errorf("after the 409 %+v %v %v", r5, err, mb.posts)
	}
	if m, _ := s.ReviewMarks("rv", "c1", ""); m.Thread != "T5" {
		t.Errorf("thread after the 409 %q", m.Thread)
	}

	// the server down: saved, not asked, the error returned
	mb.srv.Close()
	r6, err := s.AskReview("rv", "c1", "", b, "blocked", "down")
	if err != nil || r6.Error == "" || r6.Asked != "" || strings.Contains(r6.Error, "\n") {
		t.Fatalf("down %+v %v", r6, err)
	}
	m, _ = s.ReviewMarks("rv", "c1", "")
	for _, mk := range m.Marks {
		// the earlier ask of b is kept (leftovers-44 FR-1), no new one recorded
		if mk.Symbol == b && (mk.State != "blocked" || mk.Note != "down" || mk.Asked != "M4" || mk.AskedThread != "T1" || mk.AskedNote != "3 now?") {
			t.Errorf("the mark after a failed post %+v", mk)
		}
	}
	if m.Thread != "T5" {
		t.Errorf("a failed post moved the thread: %q", m.Thread)
	}

	// nobody to ask: refused with no write
	withCell(t, s, root, `{"project":"rv","human":"pablo","agents":["dev"],"reconciler":""}`, "x")
	before, _ := os.ReadFile(review.StatePath("rv", newHead))
	if _, err := s.AskReview("rv", "c1", "", a, "question", "anyone?"); err == nil || !strings.Contains(err.Error(), "no one to ask here: "+WhyNoSeat) {
		t.Errorf("nobody: %v", err)
	}
	if after, _ := os.ReadFile(review.StatePath("rv", newHead)); string(after) != string(before) {
		t.Error("a refused ask wrote the marks")
	}
}
