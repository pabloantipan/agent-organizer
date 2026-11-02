package service

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/session"

	"gopkg.in/yaml.v3"
)

func TestLaunchDir(t *testing.T) {
	root := t.TempDir()
	for _, d := range []string{".wt/run-gate", ".wt/organizer-legacy"} {
		if err := os.MkdirAll(filepath.Join(root, d), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	tests := []struct {
		name string
		card model.Card
		want string
	}{
		{"worktree named after the branch", model.Card{Slug: "x", Branch: "run-gate"}, ".wt/run-gate"},
		{"worktree named after the slug", model.Card{Slug: "run-gate", Branch: "none"}, ".wt/run-gate"},
		{"worktree named repo-slug", model.Card{Slug: "legacy", Branch: "none", Repos: []string{"organizer"}}, ".wt/organizer-legacy"},
		{"no worktree falls back to the root", model.Card{Slug: "other", Branch: "feat/other"}, ""},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			want := root
			if tt.want != "" {
				want = filepath.Join(root, tt.want)
			}
			if got := launchDir(root, tt.card); got != want {
				t.Errorf("launchDir = %q, want %q", got, want)
			}
		})
	}
}

func TestHeadBranch(t *testing.T) {
	repo := t.TempDir()
	gitDir := filepath.Join(repo, ".git")
	if err := os.MkdirAll(gitDir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(path, body string) {
		t.Helper()
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write(filepath.Join(gitDir, "HEAD"), "ref: refs/heads/crew-and-context\n")

	// A directory deep inside the checkout still finds it.
	deep := filepath.Join(repo, "internal", "cli")
	if err := os.MkdirAll(deep, 0o755); err != nil {
		t.Fatal(err)
	}
	if got := headBranch(deep); got != "crew-and-context" {
		t.Errorf("headBranch(deep) = %q", got)
	}

	// A worktree points at its git dir with a file, not a directory.
	wt := t.TempDir()
	wtGit := filepath.Join(repo, "worktrees", "run-gate")
	if err := os.MkdirAll(wtGit, 0o755); err != nil {
		t.Fatal(err)
	}
	write(filepath.Join(wtGit, "HEAD"), "ref: refs/heads/run-gate\n")
	write(filepath.Join(wt, ".git"), "gitdir: "+wtGit+"\n")
	if got := headBranch(wt); got != "run-gate" {
		t.Errorf("headBranch(worktree) = %q, want run-gate", got)
	}

	// A detached HEAD names no card.
	write(filepath.Join(gitDir, "HEAD"), "eb47adda26b3ecb8830f2c1a5d03c907a6c087c6\n")
	if got := headBranch(repo); got != "" {
		t.Errorf("detached HEAD = %q, want empty", got)
	}
	if got := headBranch(t.TempDir()); got != "" {
		t.Errorf("no checkout = %q, want empty", got)
	}
}

// The session-length warning reads the one ceiling and says what probe does:
// it refuses a name over zellij's socket budget, it never truncates one.
func TestPrepareLaunchWarnsOnlyOverTheSessionCeiling(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	card := func(slug string) model.Card {
		return model.Card{Slug: slug, Spec: "s", Gate: "g", Boundary: []string{"b"}}
	}
	long := "a-card-slug-long-enough-to-overflow-the-socket-budget-x" // organizer-probe- + 55 = 71
	si := model.ScannedInitiative{}
	si.ID, si.Path = "organizer", t.TempDir()
	si.Cards = []model.Card{card("redesign-goal-stages"), card(long)}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}

	lengthWarnings := func(slug string) []string {
		t.Helper()
		l, err := s.PrepareLaunch("organizer", slug)
		if err != nil {
			t.Fatal(err)
		}
		var out []string
		for _, w := range l.Warnings {
			if strings.Contains(w, "characters") {
				out = append(out, w)
			}
		}
		return out
	}
	if w := lengthWarnings("redesign-goal-stages"); len(w) != 0 {
		t.Errorf("organizer-probe-redesign-goal-stages fits, got %v", w)
	}
	w := lengthWarnings(long)
	if len(w) != 1 || !strings.Contains(w[0], "is 71 characters; zellij holds at most 68") || !strings.Contains(w[0], "probe refuses it") {
		t.Errorf("warnings %v, want the length, the ceiling and that probe refuses", w)
	}
	if len(w) == 1 && strings.Contains(w[0], "truncat") {
		t.Errorf("probe does not truncate: %q", w[0])
	}
}

// G6: the app's runs for one initiative sum input tokens per card over the
// archive and the sessions still running — and carry no dollar figure, which
// decision 0020 keeps in `organizer runs`. Everything reads from a temp
// XDG_DATA_HOME, so the real runs.jsonl is neither read nor written.
func TestInitiativeRunsSumsTokensPerCard(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	root := t.TempDir()
	worktree := filepath.Join(root, ".wt", "redesign-runs-binding")
	if err := os.MkdirAll(worktree, 0o755); err != nil {
		t.Fatal(err)
	}
	si := model.ScannedInitiative{}
	si.ID, si.Path = "organizer", root
	si.Cards = []model.Card{
		{Slug: "redesign-runs-binding", Branch: "redesign-runs-binding"},
		{Slug: "retire-keeps-the-cell", Branch: "retire-keeps-the-cell"},
	}
	other := model.ScannedInitiative{}
	other.ID, other.Path = "agent-slack", t.TempDir()
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si, other}}}}

	day := func(d int) time.Time { return time.Date(2026, 9, d, 10, 0, 0, 0, time.UTC) }
	archived := []session.Run{
		// Two finished runs on the card.
		{PID: 1, SessionID: "s1", Cwd: worktree, Model: "opus", InputTokens: 12_000, WindowSize: 200_000,
			CostUSD: 1.5, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(20), LastSeen: day(21), Ended: true},
		{PID: 2, SessionID: "s2", Cwd: worktree, Model: "opus", InputTokens: 30_000, WindowSize: 200_000,
			CostUSD: 4.25, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(22), LastSeen: day(23), Ended: true},
		// The open line of the session that is still running: stale numbers the
		// live record must replace, not be added to.
		{PID: 3, SessionID: "s3", Cwd: worktree, Model: "opus", InputTokens: 5_000, WindowSize: 200_000,
			CostUSD: 0.4, Initiative: "organizer", Card: "redesign-runs-binding", Branch: "redesign-runs-binding",
			FirstSeen: day(25), LastSeen: day(25)},
		// Another initiative's run is not this initiative's business.
		{PID: 4, SessionID: "s4", Cwd: other.Path, Model: "opus", InputTokens: 99_000,
			Initiative: "agent-slack", Card: "cell-pause", FirstSeen: day(24), LastSeen: day(24), Ended: true},
	}
	if err := session.AppendRuns(session.RunsPath(), archived); err != nil {
		t.Fatal(err)
	}
	live := session.Record{PID: 3, SessionID: "s3", Session: "organizer-probe-sup2", Cwd: worktree,
		Model: "opus", UsedPercent: 20, InputTokens: 40_000, WindowSize: 200_000, CostUSD: 6.75,
		UpdatedAt: day(26)}
	if err := session.Write(session.Dir(), live); err != nil {
		t.Fatal(err)
	}

	view := s.InitiativeRuns("organizer")
	const want = 12_000 + 30_000 + 40_000
	if view.Initiative != "organizer" || view.InputTokens != want {
		t.Errorf("view = %q %d tokens, want organizer %d", view.Initiative, view.InputTokens, want)
	}
	if len(view.Cards) != 1 {
		t.Fatalf("cards = %+v, want one (the other initiative's run filtered out)", view.Cards)
	}
	c := view.Cards[0]
	if c.Card != "redesign-runs-binding" || c.InputTokens != want {
		t.Errorf("card %q = %d tokens, want redesign-runs-binding %d", c.Card, c.InputTokens, want)
	}
	if len(c.Runs) != 3 || c.Live != 1 {
		t.Fatalf("runs = %d (%d live), want 3 folded runs, one live", len(c.Runs), c.Live)
	}
	// Newest last-seen first, and the live session's numbers are the record's
	// while its start is the one the archive remembers.
	r := c.Runs[0]
	if !r.Live || r.SessionID != "s3" || r.InputTokens != 40_000 || r.Ended {
		t.Errorf("newest run = %+v, want the live s3 at 40000 tokens", r)
	}
	if !r.FirstSeen.Equal(day(25)) || !r.LastSeen.Equal(day(26)) {
		t.Errorf("live run seen %s..%s, want %s..%s", r.FirstSeen, r.LastSeen, day(25), day(26))
	}

	// 0020: no dollar figure crosses into the app, whatever the archive holds.
	b, err := json.Marshal(view)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(strings.ToLower(string(b)), "cost") {
		t.Errorf("the bound view names a cost: %s", b)
	}
}

// A card of an initiative with a cell launches under the cell's wrapper:
// caro-stuff's cell is `caro`, so caro-probe, never caro-stuff-probe.
func TestPrepareLaunchUsesTheCellFamily(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	card := model.Card{Slug: "tr2-fix", Spec: "s", Gate: "g", Boundary: []string{"b"}}
	withCell := model.ScannedInitiative{}
	withCell.ID, withCell.Path = "caro-stuff", t.TempDir()
	withCell.Cell = &model.Cell{Project: "caro"}
	withCell.Cards = []model.Card{card}
	noCell := model.ScannedInitiative{}
	noCell.ID, noCell.Path = "qa-automation", t.TempDir()
	noCell.Cards = []model.Card{card}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{withCell, noCell}}}}

	for id, want := range map[string]string{"caro-stuff": "/caro-probe'", "qa-automation": "/qa-automation-probe'"} {
		l, err := s.PrepareLaunch(id, "tr2-fix")
		if err != nil {
			t.Fatal(err)
		}
		if !strings.Contains(l.Command, want) {
			t.Errorf("%s: command %q, want the wrapper %q", id, l.Command, want)
		}
	}
}

// R1 (leftovers-46 FR-1): the service hands the archiver each card's seat,
// so a seat run from the root on main lands under its card; two cards
// naming the seat leave it unattributed.
func TestRunsFindTheirCardBySeat(t *testing.T) {
	for _, tt := range []struct {
		name  string
		cards []model.Card
		want  string
	}{
		{"one card names the seat", []model.Card{{Slug: "lf46-runs-seat", Branch: "lf46-runs-seat", Seat: "rr-build"}, {Slug: "x", Branch: "x"}}, "lf46-runs-seat"},
		{"two cards name the seat", []model.Card{{Slug: "lf46-runs-seat", Branch: "lf46-runs-seat", Seat: "rr-build"}, {Slug: "x", Branch: "x", Seat: "rr-build"}}, ""},
	} {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("XDG_DATA_HOME", t.TempDir())
			root := t.TempDir()
			si := model.ScannedInitiative{}
			si.ID, si.Path, si.Cards = "organizer", root, tt.cards
			s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}
			rec := session.Record{PID: 9, SessionID: "s9", Session: "organizer-probe-rr-build", Cwd: root,
				InputTokens: 1000, UpdatedAt: time.Date(2026, 10, 23, 10, 0, 0, 0, time.UTC)}
			if err := session.Write(session.Dir(), rec); err != nil {
				t.Fatal(err)
			}
			// an unattributed run names no initiative, so the view drops it
			view := s.InitiativeRuns("organizer")
			got := ""
			if len(view.Cards) == 1 {
				got = view.Cards[0].Card
			}
			if len(view.Cards) > 1 || got != tt.want {
				t.Errorf("cards = %+v, want the run under %q", view.Cards, tt.want)
			}
		})
	}
}

// C2 (leftovers-47 FR-5): the app's runs fold per conversation as `organizer
// runs` does, live records included: a seat thawed under a new pid is one
// row, its cost by the conversation rule (carried, not summed).
func TestInitiativeRunsFoldsAConversation(t *testing.T) {
	root := t.TempDir()
	wt := filepath.Join(root, ".wt", "lf47-runs-cost")
	hour := func(h int) time.Time { return time.Date(2026, 10, 23, h, 0, 0, 0, time.UTC) }
	card := func(r session.Run) session.Run {
		r.SessionID, r.Cwd, r.Initiative, r.Card, r.Branch = "conv", wt, "organizer", "lf47-runs-cost", "lf47-runs-cost"
		return r
	}
	archived := []session.Run{
		card(session.Run{PID: 10, InputTokens: 50_000, CostUSD: 1.00, FirstSeen: hour(9), LastSeen: hour(11), Ended: true}),
		// The thawed process's open line, stale against its live record.
		card(session.Run{PID: 20, InputTokens: 10_000, CostUSD: 1.10, FirstSeen: hour(12), LastSeen: hour(12)}),
	}
	live := []session.Run{
		card(session.Run{PID: 20, InputTokens: 60_000, CostUSD: 1.50, FirstSeen: hour(13), LastSeen: hour(13)}),
	}

	// The cost never reaches RunInfo (0020); the rows runsView draws carry it.
	rows := runConversations("organizer", archived, live, nil)
	if len(rows) != 1 || rows[0].CostUSD != 1.50 || !rows[0].Live || rows[0].Resumed != 1 {
		t.Fatalf("rows = %+v, want one live conversation at 1.50 (C1's rule), resumed 1", rows)
	}

	view := runsView("organizer", archived, live, nil)
	if len(view.Cards) != 1 || len(view.Cards[0].Runs) != 1 {
		t.Fatalf("cards = %+v, want one card with one row", view.Cards)
	}
	c := view.Cards[0]
	r := c.Runs[0]
	if c.Card != "lf47-runs-cost" || c.Live != 1 || !r.Live || r.Ended {
		t.Errorf("card %q live %d, row %+v; want lf47-runs-cost, one live row", c.Card, c.Live, r)
	}
	if r.InputTokens != 60_000 || c.InputTokens != 60_000 || view.InputTokens != 60_000 {
		t.Errorf("tokens row %d card %d view %d, want 60000 each (the last process's context, once)",
			r.InputTokens, c.InputTokens, view.InputTokens)
	}
	if !r.FirstSeen.Equal(hour(9)) || !r.LastSeen.Equal(hour(13)) {
		t.Errorf("seen %s..%s, want %s..%s", r.FirstSeen, r.LastSeen, hour(9), hour(13))
	}
}

// leftovers-53 FR-1a: a card whose spec: names several references is
// launched against the first.
func TestPrepareLaunchUsesTheFirstSpec(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	var c model.Card
	if err := yaml.Unmarshal([]byte("spec: [docs/specs/x.md#goals, decisions 0002]\ngate: g\nboundary: x/"), &c); err != nil {
		t.Fatal(err)
	}
	c.Slug = "two-specs"
	si := model.ScannedInitiative{}
	si.ID, si.Path = "organizer", t.TempDir()
	si.Cards = []model.Card{c}
	s := &Service{state: cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{si}}}}
	l, err := s.PrepareLaunch("organizer", "two-specs")
	if err != nil {
		t.Fatal(err)
	}
	if l.Spec != "docs/specs/x.md#goals" {
		t.Errorf("launch spec %q, want the first reference", l.Spec)
	}
}

// lf68Home is a home for leftovers 68: one initiative root `org` with cards
// whose reviewer: lists name two seats each, an accept record whose
// supervisor: is a probe session and whose cards: are two of them, and the
// reviewer and supervisor runs, both from the root, archived with no card
// (MatchRun knows neither). extra is more card files, name to body.
func lf68Home(t *testing.T, extra map[string]string) (*Service, string, string) {
	t.Helper()
	data := t.TempDir()
	t.Setenv("XDG_DATA_HOME", data)
	t.Setenv("CLAUDE_CONFIG_DIR", t.TempDir())
	roots := t.TempDir()
	root := filepath.Join(roots, "org")
	write := func(p, body string) {
		t.Helper()
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	card := func(title, seat, reviewer string) string {
		return "---\ntitle: " + title + "\nstatus: now\nseat: " + seat + "\nreviewer: " + reviewer + "\nupdated: 2026-11-02\nnext: build it\n---\n\nbody\n"
	}
	write(filepath.Join(root, "working-on", "initiative.yaml"), "id: org\ntitle: Org\nstatus: active\n")
	write(filepath.Join(root, "working-on", "lf9.md"), card("lf9", "l9-go", "l9-rev, l9-ui"))
	write(filepath.Join(root, "working-on", "lf10.md"), card("lf10", "l10-go", "[l10-rev, l10-ui]"))
	for name, body := range extra {
		write(filepath.Join(root, "working-on", name), body)
	}
	write(filepath.Join(root, "working-on", "decisions", "0009-accept-leftovers-9.md"),
		"---\ntitle: Accept leftovers 9\nstatus: ruled\nraised: 2026-11-02\nowner: pablo\noptions: [\"accept as written\", \"send back\"]\ncards: [lf9, lf10]\nruled: 2026-11-02\nruled_by: pablo\nsupervisor: org-probe-sup9\nchosen: accept as written\n---\n\n## Question\n\nq\n")

	at := time.Date(2026, 11, 2, 9, 0, 0, 0, time.UTC)
	runs := []session.Run{
		{PID: 999981, SessionID: "s-rev", Session: "org-probe-l9-rev", Cwd: root, InputTokens: 10, CostUSD: 1.25, FirstSeen: at, LastSeen: at.Add(time.Minute), Ended: true},
		// The supervisor resumed once: one conversation, its cost once.
		{PID: 999982, SessionID: "s-sup", Session: "org-probe-sup9", Cwd: root, InputTokens: 20, CostUSD: 2.00, FirstSeen: at, LastSeen: at.Add(2 * time.Minute), Ended: true},
		{PID: 999983, SessionID: "s-sup", Session: "org-probe-sup9", Cwd: root, InputTokens: 30, CostUSD: 3.50, FirstSeen: at.Add(3 * time.Minute), LastSeen: at.Add(4 * time.Minute), Ended: true},
	}
	if err := session.AppendRuns(session.RunsPath(), runs); err != nil {
		t.Fatal(err)
	}
	cfg := config.Config{Machine: "lodestar", Roots: []string{roots}, MaxDepth: 2}
	now := func() time.Time { return time.Date(2026, 11, 2, 12, 0, 0, 0, time.Local) }
	s := NewWith(cfg, cache.State{}, now)
	s.Scan(false)
	return s, filepath.Join(data, "organizer"), root
}

// cardOf is each run's card in a runs view, by session id.
func cardOf(v RunsView) map[string]string {
	got := map[string]string{}
	for _, c := range v.Cards {
		for _, r := range c.Runs {
			got[r.SessionID] = r.Card
		}
	}
	return got
}

// G1 (leftovers-68 FR-1): a reviewer run from the root, its seat named in
// one card's reviewer: list, is that card's; two cards naming it, none.
func TestLF68G1ReviewerRunIsItsCards(t *testing.T) {
	s, _, _ := lf68Home(t, nil)
	if got := cardOf(s.InitiativeRuns("org"))["s-rev"]; got != "lf9" {
		t.Errorf("reviewer org-probe-l9-rev: card %q, want lf9 (the one card whose reviewer: names it)", got)
	}
	cli := map[string]string{}
	for _, r := range s.Runs("org") {
		cli[r.SessionID] = r.Card
	}
	if cli["s-rev"] != "lf9" {
		t.Errorf("organizer runs: reviewer card %q, want lf9", cli["s-rev"])
	}

	two, _, _ := lf68Home(t, map[string]string{
		"lf11.md": "---\ntitle: lf11\nstatus: next\nseat: l11-go\nreviewer: l9-rev, l11-ui\nupdated: 2026-11-02\nnext: build it\n---\n\nbody\n",
	})
	for _, r := range two.Runs("") {
		if r.SessionID == "s-rev" && r.Card != "" {
			t.Errorf("reviewer named by two cards: card %q, want none", r.Card)
		}
	}
	if got, ok := cardOf(two.InitiativeRuns("org"))["s-rev"]; ok {
		t.Errorf("reviewer named by two cards shows in org's runs under %q, want no row", got)
	}
}

// G2 (leftovers-68 FR-2): a supervisor run named by one ruled record's
// supervisor: is that record's task, `task 0009`, one row with its cost
// once, never spread over the record's two cards.
func TestLF68G2SupervisorRunIsItsRecordsTask(t *testing.T) {
	s, _, _ := lf68Home(t, nil)
	var sup []session.Run
	for _, r := range s.Runs("org") {
		if r.SessionID == "s-sup" {
			sup = append(sup, r)
		}
	}
	if len(sup) != 1 {
		t.Fatalf("organizer runs org: %d rows for the supervisor, want 1", len(sup))
	}
	if sup[0].Card != "task 0009" || sup[0].Initiative != "org" {
		t.Errorf("supervisor row %s/%q, want org/\"task 0009\"", sup[0].Initiative, sup[0].Card)
	}
	if sup[0].CostUSD != 3.50 {
		t.Errorf("supervisor cost $%.2f, want $3.50 (2.00, then 3.50 carried across the resume: counted once)", sup[0].CostUSD)
	}
	v := s.InitiativeRuns("org")
	for _, c := range v.Cards {
		for _, r := range c.Runs {
			if r.SessionID == "s-sup" && c.Card != "task 0009" {
				t.Errorf("app runs view: supervisor under %q, want task 0009", c.Card)
			}
		}
	}
	got := 0
	for _, c := range v.Cards {
		if c.Card == "task 0009" {
			got = c.InputTokens
			if len(c.Runs) != 1 {
				t.Errorf("task 0009: %d rows, want 1", len(c.Runs))
			}
		}
	}
	if got != 30 {
		t.Errorf("task 0009 input tokens %d, want 30 (the conversation's last process, once)", got)
	}
}

// G3 (leftovers-68 FR-3): after a usage pass over the reviewer's and the
// supervisor's transcripts, `organizer runs`, the app's runs view and the
// usage ledger name each session alike: lf9 for the reviewer, task 0009 for
// the supervisor (the ledger's record), before and after the pass.
func TestLF68G3RunsAndUsageAgree(t *testing.T) {
	s, dataDir, root := lf68Home(t, nil)
	before := cardOf(s.InitiativeRuns("org"))

	transcript := func(sid, name string) string {
		return `{"type":"user","cwd":"` + root + `","sessionId":"` + sid + `","timestamp":"2026-11-02T09:00:00.000Z","message":{"role":"user","content":"go"}}` + "\n" +
			`{"type":"agent-name","agentName":"` + name + `","sessionId":"` + sid + `"}` + "\n" +
			`{"type":"assistant","cwd":"` + root + `","sessionId":"` + sid + `","timestamp":"2026-11-02T09:00:05.000Z","message":{"id":"msg_` + sid + `","model":"claude-opus-5-5","usage":{"input_tokens":10,"output_tokens":10,"cache_read_input_tokens":10,"cache_creation_input_tokens":10}}}` + "\n"
	}
	proj := filepath.Join(os.Getenv("CLAUDE_CONFIG_DIR"), "projects", "-org")
	if err := os.MkdirAll(proj, 0o755); err != nil {
		t.Fatal(err)
	}
	for sid, name := range map[string]string{"s-rev": "org-probe-l9-rev", "s-sup": "org-probe-sup9"} {
		if err := os.WriteFile(filepath.Join(proj, sid+".jsonl"), []byte(transcript(sid, name)), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	// The ledger as written, read raw: task and record per session.
	b, err := os.ReadFile(filepath.Join(dataDir, "usage.jsonl"))
	if err != nil {
		t.Fatal(err)
	}
	ledger := map[string]string{}
	for _, raw := range strings.Split(strings.TrimSpace(string(b)), "\n") {
		var l struct {
			SessionID string `json:"session_id"`
			Task      string `json:"task"`
			Record    string `json:"record"`
		}
		if json.Unmarshal([]byte(raw), &l) != nil || l.SessionID == "" {
			continue
		}
		ledger[l.SessionID] = l.Task
		if l.Record != "" {
			ledger[l.SessionID] = "task " + l.Record
		}
	}
	after := cardOf(s.InitiativeRuns("org"))
	cli := map[string]string{}
	for _, r := range s.Runs("org") {
		cli[r.SessionID] = r.Card
	}
	want := map[string]string{"s-rev": "lf9", "s-sup": "task 0009"}
	for sid, w := range want {
		if ledger[sid] != w || before[sid] != w || after[sid] != w || cli[sid] != w {
			t.Errorf("%s: usage ledger %q, app before the pass %q, after %q, organizer runs %q; want %q everywhere",
				sid, ledger[sid], before[sid], after[sid], cli[sid], w)
		}
	}
}
