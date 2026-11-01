package service

// The run report (docs/specs/leftovers-57.md FR-1 to FR-3, FR-5; 0169):
// Deltagos draws `factory report`'s output and computes none of it. The
// types below are the contract's (agent-mailbox-specs
// contracts/factory-report/, factory-report.schema.json and
// factory-report-windows.schema.json at 8474386): field for field, so a
// decode then encode gives the JSON back. The one number Deltagos adds is
// tokens per progress line (LineTokens), which the report does not carry yet.

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"organizer/internal/session"
	"organizer/internal/usage"
)

// FactoryReport is `factory report <root> --json`.
type FactoryReport struct {
	Initiative string        `json:"initiative"`
	Root       string        `json:"root"`
	Generated  string        `json:"generated"`
	Why        string        `json:"why,omitempty"`
	Window     *ReportWindow `json:"window"` // null when no window could be drawn
	Progress   *Progress     `json:"progress,omitempty"`
	Waves      *ReportWaves  `json:"waves,omitempty"`
	Tracks     *Tracks       `json:"tracks,omitempty"`
	Rulings    []Ruling      `json:"rulings"`
}

// ReportWindow is the window drawn, and one entry of the windows list.
// Kind is given, autonomous or current. Moved and Moves are set only in the
// windows list (`--windows`).
type ReportWindow struct {
	Since    int64  `json:"since"`
	Until    int64  `json:"until"`
	Kind     string `json:"kind"`
	Source   string `json:"source"`
	SinceISO string `json:"since_iso"`
	UntilISO string `json:"until_iso"`
	Moved    *bool  `json:"moved,omitempty"`
	Moves    *int   `json:"moves,omitempty"`
}

// Progress is the cards that passed review in the window and the dead spans.
type Progress struct {
	Denominator Denominator    `json:"denominator"`
	Moves       []ProgressMove `json:"moves"`
	Lines       []ProgressLine `json:"lines"`
	Dead        []DeadSpan     `json:"dead"`
	Notes       []string       `json:"notes"`
}

type Denominator struct {
	Count int    `json:"count"`
	Kind  string `json:"kind"`
}

type ProgressMove struct {
	T      int64  `json:"t"`
	Slug   string `json:"slug"`
	Commit string `json:"commit"`
}

// ProgressLine is one row of the chart: the cards that moved at T.
type ProgressLine struct {
	T       int64    `json:"t"`
	Cards   []string `json:"cards"`
	Commits []string `json:"commits"`
	Done    int      `json:"done"`
	Pct     int      `json:"pct"`
	Hashes  int      `json:"hashes"`
}

type DeadSpan struct {
	Start   int64  `json:"start"`
	End     int64  `json:"end"`
	Cause   string `json:"cause"`
	Source  string `json:"source"`
	Minutes int    `json:"minutes"`
}

// ReportWaves is the waves block (0168 Q2): each progress line joined to the
// waves of the run records that hold its cards.
type ReportWaves struct {
	Source  string     `json:"source"`
	Records []string   `json:"records"`
	Lines   []WaveLine `json:"lines"`
	Waves   []RunWave  `json:"waves"`
	Notes   []string   `json:"notes"`
}

// WaveLine matches progress.lines[] by T.
type WaveLine struct {
	T             int64          `json:"t"`
	Cards         []WaveLineCard `json:"cards"`
	Waves         []string       `json:"waves"`
	RoundCount    int            `json:"round_count"`
	Failed        int            `json:"failed"`
	FailedByCause map[string]int `json:"failed_by_cause"`
	BuildMinutes  int            `json:"build_minutes"`
}

// WaveLineCard is one card of a line; Label is "no wave" when no run record
// lists it.
type WaveLineCard struct {
	Slug  string   `json:"slug"`
	Waves []string `json:"waves"`
	Label string   `json:"label"`
}

// RunWave is one wave of a run record, keyed <supervisor>/<wave>.
type RunWave struct {
	Key    string `json:"key"`
	Record string `json:"record"`
	// Wave is an integer or a string in the contract.
	Wave          any            `json:"wave"`
	Supervisor    *string        `json:"supervisor"`
	Task          *string        `json:"task"`
	Cards         []string       `json:"cards"`
	Launched      *int64         `json:"launched"`
	LaunchedISO   *string        `json:"launched_iso"`
	Merged        *int64         `json:"merged"`
	MergedISO     *string        `json:"merged_iso"`
	Rounds        []ReportRound  `json:"rounds"`
	RoundCount    int            `json:"round_count"`
	Failed        int            `json:"failed"`
	FailedByCause map[string]int `json:"failed_by_cause"`
	BuildMinutes  int            `json:"build_minutes"`
}

// ReportRound is one round; Cause is approach, execution, gate,
// environment, unclear or null (hestia 0042).
type ReportRound struct {
	Card     string  `json:"card"`
	Kind     string  `json:"kind"`
	Start    int64   `json:"start"`
	End      *int64  `json:"end"`
	Result   string  `json:"result"`
	Reviewer *string `json:"reviewer"`
	Reason   *string `json:"reason"`
	Cause    *string `json:"cause"`
	StartISO string  `json:"start_iso"`
	EndISO   *string `json:"end_iso"`
}

// Tracks is the board as of a revision; only Drawn is always there.
type Tracks struct {
	Drawn   bool     `json:"drawn"`
	Why     string   `json:"why,omitempty"`
	Rev     string   `json:"rev,omitempty"`
	RevTime int64    `json:"rev_time,omitempty"`
	Envs    []string `json:"envs,omitempty"`
	Tracks  []Track  `json:"tracks,omitempty"`
	Goal    string   `json:"goal,omitempty"`
}

type Track struct {
	ID        string   `json:"id"`
	Title     string   `json:"title"`
	Done      string   `json:"done"`
	Gates     []string `json:"gates"`
	Roadmap   bool     `json:"roadmap"`
	DoneCards []string `json:"done_cards"`
	OpenCards []string `json:"open_cards"`
	ToCut     []string `json:"to_cut"`
	Passed    int      `json:"passed"`
	Planned   int      `json:"planned"`
	Pct       *int     `json:"pct"`
	Left      []string `json:"left"`
	Waits     []Wait   `json:"waits"`
	// Env is per environment the share done: an integer, a string or null.
	Env map[string]any `json:"env"`
}

type Wait struct {
	What string `json:"what"`
	Who  string `json:"who"`
	From string `json:"from"`
}

// Ruling is one decision record ruled in the window. Mode is present,
// autonomous, standing rule, away or null; Note says why a ruled_by was
// refused.
type Ruling struct {
	ID         string  `json:"id"`
	Title      string  `json:"title"`
	File       string  `json:"file"`
	Source     string  `json:"source"`
	Commit     string  `json:"commit,omitempty"`
	RuledAt    int64   `json:"ruled_at"`
	RuledAtISO string  `json:"ruled_at_iso"`
	RuledBy    string  `json:"ruled_by"`
	Mode       *string `json:"mode"`
	Note       string  `json:"note,omitempty"`
}

// ReportWindows is `factory report <root> --windows --json`: the windows of
// the last Days days, newest first.
type ReportWindows struct {
	Initiative string         `json:"initiative"`
	Root       string         `json:"root"`
	Generated  string         `json:"generated"`
	Days       int            `json:"days"`
	From       int64          `json:"from"`
	FromISO    string         `json:"from_iso"`
	Windows    []ReportWindow `json:"windows"`
}

// LineTokens is the number Deltagos adds to a progress line (FR-5, 0020:
// tokens, never money): the usage ledger's tokens of sessions whose card is
// one of the line's cards, counted only for session-days wholly inside the
// window.
type LineTokens struct {
	T        int64 `json:"t"`
	Tokens   int64 `json:"tokens"`
	Sessions int   `json:"sessions"`
}

// RunReport is what Service.Report returns: the factory's report as given,
// and the tokens per line beside it, so the report itself stays the
// contract's.
type RunReport struct {
	Report     FactoryReport `json:"report"`
	LineTokens []LineTokens  `json:"line_tokens"`
}

// errReportNotFound is FR-2's words for a missing factory.
var errReportNotFound = errors.New("factory report not found")

// reportTimeout bounds one factory report call.
var reportTimeout = 60 * time.Second

// reportLedger is the usage ledger the tokens are read from; a var so tests
// read a fixture.
var reportLedger = func() string {
	ledger, _ := usage.DataPaths(filepath.Dir(session.Dir()))
	return ledger
}

// Report runs `factory report <root> --since <since> --until <until> --json`
// and adds the tokens per line. since and until are passed as given: a
// picked window is "@<epoch>" (FR-3).
func (s *Service) Report(initiative, since, until string) (RunReport, error) {
	root, err := s.reportRoot(initiative)
	if err != nil {
		return RunReport{}, err
	}
	out, err := runReport(root, "--since", since, "--until", until, "--json")
	if err != nil {
		return RunReport{}, err
	}
	var r FactoryReport
	if err := json.Unmarshal(out, &r); err != nil {
		return RunReport{}, fmt.Errorf("factory report: %v", err)
	}
	return RunReport{Report: r, LineTokens: lineTokens(r, usage.LoadLedger(reportLedger()))}, nil
}

// ReportText runs the same with --text and returns its bytes unchanged.
func (s *Service) ReportText(initiative, since, until string) (string, error) {
	root, err := s.reportRoot(initiative)
	if err != nil {
		return "", err
	}
	out, err := runReport(root, "--since", since, "--until", until, "--text")
	return string(out), err
}

// ReportWindows runs `factory report <root> --windows --days 14 --json` and
// returns the windows as given.
func (s *Service) ReportWindows(initiative string) (ReportWindows, error) {
	root, err := s.reportRoot(initiative)
	if err != nil {
		return ReportWindows{}, err
	}
	out, err := runReport(root, "--windows", "--days", "14", "--json")
	if err != nil {
		return ReportWindows{}, err
	}
	var w ReportWindows
	if err := json.Unmarshal(out, &w); err != nil {
		return ReportWindows{}, fmt.Errorf("factory report: %v", err)
	}
	return w, nil
}

// reportRoot is the local initiative's root. One known only from another
// machine's snapshot is refused with "drawn on <machine>" (FR-2), before
// anything runs.
func (s *Service) reportRoot(id string) (string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, si := range s.state.Local.Initiatives {
		if si.ID == id {
			return si.Path, nil
		}
	}
	for _, snap := range s.state.Remote {
		for _, ri := range snap.Initiatives {
			if ri.ID == id {
				return "", fmt.Errorf("drawn on %s", snap.Machine)
			}
		}
	}
	return "", fmt.Errorf("no initiative %s on this machine", id)
}

// runReport runs `factory report <root> <args>` and returns its stdout. A
// missing factory is errReportNotFound; a non-zero exit is its first stderr
// line (FR-2).
func runReport(root string, args ...string) ([]byte, error) {
	bin, _, err := factoryBin()
	if err != nil {
		return nil, errReportNotFound
	}
	ctx, cancel := context.WithTimeout(context.Background(), reportTimeout)
	defer cancel()
	cmd := exec.CommandContext(ctx, bin, append([]string{"report", root}, args...)...)
	cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	cmd.Cancel = func() error { return syscall.Kill(-cmd.Process.Pid, syscall.SIGTERM) }
	cmd.WaitDelay = factoryWaitDelay
	var stdout, stderr bytes.Buffer
	cmd.Stdout, cmd.Stderr = &stdout, &stderr
	err = cmd.Run()
	var ee *exec.ExitError
	switch {
	case errors.Is(ctx.Err(), context.DeadlineExceeded):
		return nil, fmt.Errorf("factory report timed out after %s", reportTimeout)
	case err == nil:
		return stdout.Bytes(), nil
	case errors.As(err, &ee):
		if line := firstStderrLine(stderr.String()); line != "" {
			return nil, errors.New(line)
		}
		return nil, fmt.Errorf("factory report exited %d", ee.ExitCode())
	case errors.Is(err, exec.ErrNotFound):
		return nil, errReportNotFound
	default:
		return nil, fmt.Errorf("factory report: %v", err)
	}
}

// firstStderrLine is the first non-blank line, trimmed.
func firstStderrLine(s string) string {
	for _, l := range strings.Split(s, "\n") {
		if l = strings.TrimSpace(l); l != "" {
			return l
		}
	}
	return ""
}

// lineTokens sums, per progress line, the ledger's tokens of the sessions
// whose task is one of the line's cards in the report's initiative. A
// ledger line (one session on one day) counts when its first and last
// message are both inside the window; a supervisor's wave:<seat> task is
// not a card and counts on no line, so no token counts twice.
func lineTokens(r FactoryReport, ledger []usage.Line) []LineTokens {
	if r.Progress == nil {
		return []LineTokens{}
	}
	out := make([]LineTokens, 0, len(r.Progress.Lines))
	var since, until time.Time
	if r.Window != nil {
		since, until = time.Unix(r.Window.Since, 0), time.Unix(r.Window.Until, 0)
	}
	for _, pl := range r.Progress.Lines {
		lt := LineTokens{T: pl.T}
		cards := map[string]bool{}
		for _, c := range pl.Cards {
			cards[c] = true
		}
		seen := map[string]bool{}
		for _, l := range ledger {
			if r.Window == nil || l.Initiative != r.Initiative || !cards[l.Task] {
				continue
			}
			if l.First.Before(since) || l.Last.After(until) {
				continue
			}
			lt.Tokens += l.Total()
			if !seen[l.SessionID] {
				seen[l.SessionID] = true
				lt.Sessions++
			}
		}
		out = append(out, lt)
	}
	return out
}
