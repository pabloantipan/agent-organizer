package session

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"
)

// A session record is deleted when its process is gone, and with it the only
// number the factory has for what a card cost. runs.jsonl is where the record
// goes first: one append-only log of every agent session this machine ever
// ran, with the card it ran against.
//
// The statusline never writes a start time — only `updated_at`, refreshed
// every turn — so a run is written twice: an *open* line the first time the
// session is seen, and a *final* line when its record is retired. Folding the
// file by pid and session id, last line wins, gives first seen, last seen and
// the final values. Two lines per session, whatever its length.

// Run is one agent session as the archive keeps it.
type Run struct {
	PID       int    `json:"pid"`
	SessionID string `json:"session_id"`
	// Session is the probe session name (AGENT_SESSION), empty for a plain
	// terminal; Persona and Cell are set for a crew seat.
	Session string `json:"session"`
	Persona string `json:"persona,omitempty"`
	Cell    string `json:"cell,omitempty"`
	Cwd     string `json:"cwd"`
	Model   string `json:"model"`
	// The context window and the bill as of LastSeen.
	UsedPercent float64 `json:"used_percent"`
	InputTokens int     `json:"input_tokens"`
	WindowSize  int     `json:"window_size"`
	CostUSD     float64 `json:"cost_usd"`
	// The card this session was working on, when one matched. Empty is
	// honest: a session in a directory no card claims has no card.
	Initiative string `json:"initiative,omitempty"`
	Card       string `json:"card,omitempty"`
	Branch     string `json:"branch,omitempty"`

	FirstSeen time.Time `json:"first_seen"`
	LastSeen  time.Time `json:"last_seen"`
	// Ended is true on the final line: the process is gone and the numbers
	// will not move again.
	Ended bool `json:"ended"`
}

// Key identifies a run across its open and final lines. A pid is reused by
// the operating system, so the session id is part of it.
func (r Run) Key() string { return strconv.Itoa(r.PID) + ":" + r.SessionID }

// Wall is how long the session was observed. Zero when it was only ever seen
// once, which is what a single-turn session looks like.
func (r Run) Wall() time.Duration {
	if r.FirstSeen.IsZero() || r.LastSeen.Before(r.FirstSeen) {
		return 0
	}
	return r.LastSeen.Sub(r.FirstSeen)
}

// RunsPath is the archive: beside the cache and the session records.
func RunsPath() string {
	return filepath.Join(filepath.Dir(Dir()), "runs.jsonl")
}

// LoadRuns folds the archive into one Run per session, newest state wins,
// sorted newest last-seen first. A missing file is empty, not an error; an
// unparseable line is skipped, because a half-written line must not cost the
// whole history.
func LoadRuns(path string) []Run {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	byKey := map[string]Run{}
	for _, line := range strings.Split(string(b), "\n") {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var r Run
		if json.Unmarshal([]byte(line), &r) != nil || r.PID <= 0 {
			continue
		}
		byKey[r.Key()] = r
	}
	out := make([]Run, 0, len(byKey))
	for _, r := range byKey {
		out = append(out, r)
	}
	sort.Slice(out, func(i, j int) bool {
		if !out[i].LastSeen.Equal(out[j].LastSeen) {
			return out[i].LastSeen.After(out[j].LastSeen)
		}
		return out[i].Key() < out[j].Key()
	})
	return out
}

// AppendRuns adds lines to the archive. Append-only on purpose: a crash
// costs the last line, never the history.
func AppendRuns(path string, runs []Run) error {
	if len(runs) == 0 {
		return nil
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	f, err := os.OpenFile(path, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0o600)
	if err != nil {
		return err
	}
	defer f.Close()
	for _, r := range runs {
		b, err := json.Marshal(r)
		if err != nil {
			return err
		}
		if _, err := f.Write(append(b, '\n')); err != nil {
			return err
		}
	}
	return nil
}

// CardRef is what the archiver needs to name the card a session ran against:
// where the initiative is, which card, and the branch the card works on.
type CardRef struct {
	Initiative string
	Slug       string
	Branch     string
	Root       string // the initiative root directory
}

// MatchCard picks the card a working directory belongs to. The initiative is
// the longest root that prefixes the directory. Inside it, a worktree path
// wins: a directory element equal to the card's branch or slug (the .wt/
// convention the supervise skill launches with). Failing that, the checkout's
// branch, when the caller knows it. No git is run here.
func MatchCard(cwd, branch string, cards []CardRef) (CardRef, bool) {
	cwd = filepath.Clean(cwd)
	var best []CardRef
	bestLen := -1
	for _, c := range cards {
		root := filepath.Clean(c.Root)
		if root == "" || !underRoot(cwd, root) {
			continue
		}
		if len(root) > bestLen {
			bestLen, best = len(root), nil
		}
		if len(root) == bestLen {
			best = append(best, c)
		}
	}
	if len(best) == 0 {
		return CardRef{}, false
	}
	rel, err := filepath.Rel(filepath.Clean(best[0].Root), cwd)
	if err != nil {
		rel = ""
	}
	elems := strings.Split(rel, string(filepath.Separator))
	for _, c := range best {
		for _, e := range elems {
			if e == "" || e == "." {
				continue
			}
			if e == c.Branch || e == c.Slug {
				return c, true
			}
		}
	}
	if branch != "" {
		for _, c := range best {
			if c.Branch == branch {
				return c, true
			}
		}
	}
	return CardRef{}, false
}

func underRoot(path, root string) bool {
	if path == root {
		return true
	}
	return strings.HasPrefix(path, root+string(filepath.Separator))
}

// Retire is the archive pass. Every record on disk is folded into the log —
// an open line the first time it is seen — and every record whose process is
// gone is written with its final values and then deleted. It is Prune plus a
// memory, and it must run before the scan prunes, or the numbers are lost.
//
// branchOf answers "which branch is this directory on", so the archiver can
// match a card without shelling out to git; nil means path matching only.
// Returns how many records were retired.
func Retire(dir, path string, alive map[int]bool, grace time.Duration, now time.Time, cards []CardRef, branchOf func(cwd string) string) (int, error) {
	known := map[string]Run{}
	for _, r := range LoadRuns(path) {
		known[r.Key()] = r
	}
	records := Load(dir)
	pids := make([]int, 0, len(records))
	for pid := range records {
		pids = append(pids, pid)
	}
	sort.Ints(pids)

	var lines []Run
	var retired []int
	for _, pid := range pids {
		rec := records[pid]
		run := Run{
			PID: rec.PID, SessionID: rec.SessionID, Session: rec.Session,
			Persona: rec.Persona, Cell: rec.Cell, Cwd: rec.Cwd, Model: rec.Model,
			UsedPercent: rec.UsedPercent, InputTokens: rec.InputTokens,
			WindowSize: rec.WindowSize, CostUSD: rec.CostUSD,
			FirstSeen: rec.UpdatedAt, LastSeen: rec.UpdatedAt,
		}
		branch := ""
		if branchOf != nil {
			branch = branchOf(rec.Cwd)
		}
		if c, ok := MatchCard(rec.Cwd, branch, cards); ok {
			run.Initiative, run.Card, run.Branch = c.Initiative, c.Slug, c.Branch
		}
		prev, seen := known[run.Key()]
		if seen {
			run.FirstSeen = prev.FirstSeen
			if prev.Ended {
				continue // already archived; the record is a leftover
			}
		}
		dead := !alive[pid] && now.Sub(rec.UpdatedAt) >= grace
		switch {
		case dead:
			run.Ended = true
			lines = append(lines, run)
			retired = append(retired, pid)
		case !seen:
			lines = append(lines, run)
		}
	}
	if err := AppendRuns(path, lines); err != nil {
		return 0, err
	}
	n := 0
	for _, pid := range retired {
		if os.Remove(filepath.Join(dir, strconv.Itoa(pid)+".json")) == nil {
			n++
		}
	}
	return n, nil
}
