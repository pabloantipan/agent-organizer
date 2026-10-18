package service

import (
	"bytes"
	"encoding/json"
	"net"
	"os"
	"path/filepath"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
)

func TestCardsOnThreadsByIdAndSubject(t *testing.T) {
	si := &model.ScannedInitiative{}
	si.Cards = []model.Card{
		{Slug: "readiness-endpoint", Status: "next", Threads: []string{"t1"}},
		{Slug: "paper-form", Status: "now"},
		{Slug: "old", Status: "done", Archived: true, Threads: []string{"t2"}},
	}
	threads := []discuss.Thread{
		{ID: "t1", Subject: "readiness-endpoint: frozen?"},
		{ID: "t2", Subject: "old: gone"},
		{ID: "t3", Subject: "paper-form — five open calls"},
		{ID: "t4", Subject: "nothing"},
	}
	got := cardsOnThreads(si, threads)
	if len(got["t1"]) != 1 || got["t1"][0] != "readiness-endpoint" {
		t.Errorf("t1 named once, not twice: %v", got["t1"])
	}
	if len(got["t2"]) != 0 {
		t.Errorf("done cards do not link: %v", got["t2"])
	}
	if len(got["t3"]) != 1 || got["t3"][0] != "paper-form" {
		t.Errorf("subject convention: %v", got["t3"])
	}
	if _, ok := got["t4"]; ok {
		t.Error("t4 links nothing")
	}
}

func TestFactsOfCountsWhatIsAskedOfTheHuman(t *testing.T) {
	d := discuss.ThreadDetail{Messages: []discuss.Message{
		{From: "po_andrea", To: "tech_lead_nicolas", Kind: "question"},
		{From: "tech_lead_nicolas", To: "pablo", Kind: "question"},
		{From: "po_andrea", To: "pablo", Kind: "msg"},
	}}
	f := factsOf(d, "pablo")
	if f.from != "po_andrea" || f.to != "tech_lead_nicolas" || f.msgs != 3 {
		t.Errorf("opening %+v", f)
	}
	if f.askedOfMe != 2 || f.askedBy != "po_andrea" {
		t.Errorf("asked %+v", f)
	}
	d.Messages = append(d.Messages, discuss.Message{From: "pablo", To: "po_andrea", Kind: "answer"})
	if f := factsOf(d, "pablo"); f.askedOfMe != 0 {
		t.Errorf("the human's reply clears the queue: %+v", f)
	}
	if f := factsOf(d, ""); f.askedOfMe != 0 {
		t.Error("no human seat, nothing asked")
	}
}

// noMailbox points DISCUSS_BIND at a listener that counts every connection,
// so a test can say no post or probe reached a mailbox.
func noMailbox(t *testing.T) *atomic.Int32 {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	var n atomic.Int32
	go func() {
		for {
			c, err := ln.Accept()
			if err != nil {
				return
			}
			n.Add(1)
			c.Close()
		}
	}()
	t.Cleanup(func() { ln.Close() })
	t.Setenv("DISCUSS_BIND", ln.Addr().String())
	return &n
}

func postLines(t *testing.T, file string) []discuss.PostRequest {
	t.Helper()
	b, err := os.ReadFile(file)
	if err != nil {
		t.Fatal(err)
	}
	var out []discuss.PostRequest
	for _, l := range bytes.Split(bytes.TrimSuffix(b, []byte("\n")), []byte("\n")) {
		var r discuss.PostRequest
		if err := json.Unmarshal(l, &r); err != nil {
			t.Fatalf("line %q: %v", l, err)
		}
		out = append(out, r)
	}
	return out
}

// FR-14: under canned_post a post is one JSON line in the file, answered
// canned-<n>, and nothing connects to a mailbox; the refusals stay.
func TestPostToCellCanned(t *testing.T) {
	conns := noMailbox(t)
	file := filepath.Join(t.TempDir(), "posts.jsonl")
	si := model.ScannedInitiative{}
	si.ID, si.Path = "cx", t.TempDir()
	si.Cell = &model.Cell{Project: "cx", Agents: []string{"fse"}, Human: "pablo"}
	at := time.Date(2026, 10, 18, 9, 0, 0, 0, time.UTC)
	s := NewWith(config.Config{DiscussStateDir: t.TempDir(), CannedPost: file}, cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}, func() time.Time { return at })

	if _, err := s.PostToCell("cx", CellPost{To: "fse", Body: "hi"}); err == nil || !strings.Contains(err.Error(), "needs a subject") {
		t.Errorf("no subject: %v", err)
	}
	r1, err := s.PostToCell("cx", CellPost{To: "fse", Kind: "question", Subject: " c1: review ", Body: "why?"})
	if err != nil || r1.ThreadID != "canned-1" || r1.ID != "canned-msg-1" || r1.CreatedAt != at.Unix() {
		t.Fatalf("first post %+v %v", r1, err)
	}
	r2, err := s.PostToCell("cx", CellPost{To: "fse", ThreadID: r1.ThreadID, Body: "and?"})
	if err != nil || r2.ThreadID != "canned-1" || r2.ID != "canned-msg-2" {
		t.Fatalf("post into the thread %+v %v", r2, err)
	}
	r3, err := s.PostToCell("cx", CellPost{To: "fse", Subject: "other", Body: "new"})
	if err != nil || r3.ThreadID != "canned-3" {
		t.Fatalf("second thread %+v %v", r3, err)
	}
	got := postLines(t, file)
	want := []discuss.PostRequest{
		{To: "fse", Kind: "question", Subject: "c1: review", Body: "why?"},
		{To: "fse", ThreadID: "canned-1", Kind: "msg", Body: "and?"},
		{To: "fse", Kind: "msg", Subject: "other", Body: "new"},
	}
	if len(got) != len(want) {
		t.Fatalf("lines %+v, want %+v", got, want)
	}
	for i := range want {
		if got[i] != want[i] {
			t.Errorf("line %d = %+v, want %+v", i+1, got[i], want[i])
		}
	}
	if n := conns.Load(); n != 0 {
		t.Errorf("%d connections reached the mailbox", n)
	}
}

// G6 (leftovers-41 FR-13, FR-14): the app's AskReview on the config
// `fixture-home.sh --review --canned-post` writes, with the fixture's map
// of rv-fixture made. Runs only when FIXTURE_ASK_REVIEW=1 and the fixture's
// environment is exported; progress.md has the three commands.
func TestFixtureAskReviewCanned(t *testing.T) {
	if os.Getenv("FIXTURE_ASK_REVIEW") != "1" {
		t.Skip("set FIXTURE_ASK_REVIEW=1 with the fixture's environment exported")
	}
	conns := noMailbox(t)
	cfg, ok, err := config.Load()
	if err != nil || !ok {
		t.Fatalf("config %s: %v (found %v)", config.Path(), err, ok)
	}
	tmp := filepath.Dir(config.Path())
	if !strings.HasPrefix(cfg.DiscussStateDir, tmp+string(filepath.Separator)) {
		t.Errorf("discuss_state_dir %q is not under %s", cfg.DiscussStateDir, tmp)
	}
	if cfg.CannedPost != filepath.Join(tmp, "posts.jsonl") {
		t.Errorf("canned_post %q, want %s", cfg.CannedPost, filepath.Join(tmp, "posts.jsonl"))
	}
	if _, err := os.Stat(cfg.CannedPost); err == nil {
		t.Fatalf("%s exists before the ask; run it on a fresh fixture", cfg.CannedPost)
	}
	s := NewWith(cfg, cache.State{}, time.Now)
	s.Scan(false)
	rm, _, err := s.cardMap("init-a", "rv-fixture", "")
	if err != nil {
		t.Fatalf("the fixture's map: %v (organizer review init-a rv-fixture first)", err)
	}
	symbol := ""
	for _, n := range rm.Nodes {
		if strings.HasSuffix(n.ID, ".Greet") {
			symbol = n.ID
		}
	}
	if symbol == "" {
		t.Fatalf("no Greet in the map: %+v", rm.Nodes)
	}
	r, err := s.AskReview("init-a", "rv-fixture", "", symbol, "question", "why does Greet change?")
	if err != nil || r.Error != "" || r.Thread != "canned-1" || r.Asked != "canned-msg-1" {
		t.Fatalf("ask %+v %v", r, err)
	}
	got := postLines(t, cfg.CannedPost)
	if len(got) != 1 || got[0].To != r.To.Seat || got[0].Kind != "question" || !strings.HasPrefix(got[0].Subject, "rv-fixture: review at ") {
		t.Errorf("posts.jsonl %+v, want one question to %s", got, r.To.Seat)
	}
	if n := conns.Load(); n != 0 {
		t.Errorf("%d connections reached the mailbox", n)
	}
	t.Logf("asked %s in %s; posts.jsonl: %+v", r.To.Seat, r.Thread, got)
}
