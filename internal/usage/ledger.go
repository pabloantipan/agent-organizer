// Package usage is the token and money ledger (docs/specs/usage.md, FR-1 to
// FR-4). Claude Code writes every assistant message's usage into the
// session's transcript under ~/.claude/projects; the ledger sums the four
// token kinds once per message id, per session and local day, keeps who the
// session was (initiative, role, task) from the moment it is first seen, and
// splits the session's cost (the statusline's, from runs.jsonl and the live
// records) over its days. Reading is incremental: a transcript is read from
// where the last pass stopped, so a rescan of an unchanged home reads nothing.
//
// The ledger is this machine's only copy of the history: one JSON line per
// session and day in usage.jsonl, rewritten whole when anything grows.
// Transcripts, session records and runs.jsonl are read, never written.
package usage

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

// Kinds are the four token kinds of one message's usage, and their sums.
type Kinds struct {
	Input      int64 `json:"input"`
	Output     int64 `json:"output"`
	CacheRead  int64 `json:"cache_read"`
	CacheWrite int64 `json:"cache_write"`
}

// Total is every kind added up: the "tokens" the view shows.
func (k Kinds) Total() int64 { return k.Input + k.Output + k.CacheRead + k.CacheWrite }

// Add sums o into k.
func (k *Kinds) Add(o Kinds) {
	k.Input += o.Input
	k.Output += o.Output
	k.CacheRead += o.CacheRead
	k.CacheWrite += o.CacheWrite
}

// Attribution is who a session was, fixed when it is first seen and kept on
// every one of its lines so it survives the worktree, the branch and the card
// moving to done/. An empty field is not attributed; Reason says why.
type Attribution struct {
	Name       string   `json:"name,omitempty"` // the session name (probe's), when it had one
	Cwd        string   `json:"cwd,omitempty"`
	Initiative string   `json:"initiative,omitempty"`
	Role       string   `json:"role,omitempty"`
	Task       string   `json:"task,omitempty"`       // a card slug, or wave:<supervisor> for a supervisor of several cards
	TaskTitle  string   `json:"task_title,omitempty"` // the card's title, or "<sup> · <slug>, <slug>"
	Cards      []string `json:"cards,omitempty"`      // the slugs a wave task spans
	Reason     string   `json:"reason,omitempty"`     // why something is not attributed
}

// Line is one session on one local day: the ledger's unit.
type Line struct {
	SessionID string `json:"session_id"`
	Day       string `json:"day"` // YYYY-MM-DD, local time
	Attribution
	Kinds
	// Models splits the day's tokens by model, for the By model cut.
	Models   map[string]Kinds `json:"models,omitempty"`
	Messages int              `json:"messages"`
	First    time.Time        `json:"first"`
	Last     time.Time        `json:"last"`
	// Cost is this day's share of the session's cost, by its share of the
	// session's tokens; null when no record of the session carries a cost.
	Cost *float64 `json:"cost"`
	// CostFrom says where the session's cost came from: "record" (the
	// statusline, runs.jsonl or a live record) or "transcript" (its
	// cost-state); empty with a null cost.
	CostFrom string `json:"cost_from,omitempty"`
}

// Model is the day's main model: the one with the most tokens.
func (l Line) Model() string {
	best, n := "", int64(-1)
	for m, k := range l.Models {
		if t := k.Total(); t > n || (t == n && m < best) {
			best, n = m, t
		}
	}
	return best
}

// fileState is how far one transcript has been read.
type fileState struct {
	Session string `json:"session"`
	Offset  int64  `json:"offset"`
	// Last is the last message counted. A streamed message repeats its id
	// on consecutive lines with its usage growing (the first line is a
	// snapshot taken mid-stream), possibly across two passes: a repeat adds
	// only what grew, to the day and model it was first counted under.
	Last *counted `json:"last,omitempty"`
}

// counted is one message as the ledger has counted it so far.
type counted struct {
	ID    string    `json:"id"`
	Day   string    `json:"day"`
	Model string    `json:"model"`
	TS    time.Time `json:"ts"`
	Kinds Kinds     `json:"kinds"`
}

// grow raises c to k field by field and returns what it rose by. Usage
// only grows within a stream; a smaller repeat adds nothing.
func (c *counted) grow(k Kinds) Kinds {
	up := func(have *int64, now int64) int64 {
		if now <= *have {
			return 0
		}
		d := now - *have
		*have = now
		return d
	}
	return Kinds{up(&c.Kinds.Input, k.Input), up(&c.Kinds.Output, k.Output),
		up(&c.Kinds.CacheRead, k.CacheRead), up(&c.Kinds.CacheWrite, k.CacheWrite)}
}

// sessionMeta is what a transcript says about its session once, near its
// start; kept because an incremental pass does not see the start again.
type sessionMeta struct {
	Name  string `json:"name,omitempty"`
	Cwd   string `json:"cwd,omitempty"`
	Pair  string `json:"pair,omitempty"` // a pair skill the session loaded
	Fixed bool   `json:"fixed,omitempty"`
	// TranscriptCost is the largest totalCostUSD of the transcript's
	// cost-state entries, Claude Code's own running total for the session.
	TranscriptCost float64 `json:"transcript_cost,omitempty"`
}

// offsets is the file beside the ledger that makes reading incremental.
type offsets struct {
	// Version changes when the offsets start recording something earlier
	// passes skipped; an older file is dropped and the ledger rebuilt.
	Version int `json:"version"`
	// Generation is the ledger's header generation these offsets were
	// written with. The two files are renamed one after the other; a crash
	// between leaves them on different generations, and a mismatch is
	// read as "start over", never as a second count of the grown bytes.
	Generation int64                   `json:"generation"`
	Files      map[string]*fileState   `json:"files"`
	Sessions   map[string]*sessionMeta `json:"sessions"`
}

// offsetsVersion 2 records the transcripts' cost-state (FR-2 Amendment 1);
// 3 counts a streamed message's final usage, not its first snapshot.
const offsetsVersion = 3

// CostSource is one record of a session's cumulative cost: a runs.jsonl run
// or a live statusline record. Claude Code's total is cumulative across a
// resume (a resumed session reports at least what it had), so the largest
// one is the session's cost.
type CostSource struct {
	SessionID string
	Session   string // AGENT_SESSION, a name when the transcript has none
	Persona   string // AGENT_NAME
	CostUSD   float64
	HasCost   bool
}

// Options is one ingest pass.
type Options struct {
	ProjectsDir string // ~/.claude/projects
	LedgerPath  string
	OffsetsPath string
	Costs       []CostSource
	Initiatives []Initiative
	Loc         *time.Location // local days; nil is time.Local
}

// Stats says what a pass did; BytesRead is the incremental-reading proof.
type Stats struct {
	Files     int   `json:"files"`
	FilesRead int   `json:"files_read"`
	BytesRead int64 `json:"bytes_read"`
	Sessions  int   `json:"sessions"`
	Lines     int   `json:"lines"`
	Changed   bool  `json:"changed"`
}

// DataPaths are the ledger and its offsets under the organizer's data dir.
func DataPaths(dataDir string) (ledger, offs string) {
	return filepath.Join(dataDir, "usage.jsonl"), filepath.Join(dataDir, "usage-offsets.json")
}

// ProjectsDir is where Claude Code keeps transcripts: $CLAUDE_CONFIG_DIR or
// ~/.claude, then projects.
func ProjectsDir() string {
	base := os.Getenv("CLAUDE_CONFIG_DIR")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".claude")
	}
	return filepath.Join(base, "projects")
}

// Ingest reads what the transcripts gained since the last pass into the
// ledger, attributes sessions seen for the first time, splits costs, and
// rewrites the ledger and the offsets when anything changed. Two processes
// (the app and the CLI) serialise on a lock file beside the ledger.
func Ingest(o Options) (Stats, error) {
	var st Stats
	if o.Loc == nil {
		o.Loc = time.Local
	}
	if err := os.MkdirAll(filepath.Dir(o.LedgerPath), 0o700); err != nil {
		return st, err
	}
	unlock, err := lockFile(o.LedgerPath + ".lock")
	if err != nil {
		return st, err
	}
	defer unlock()

	gen := ledgerGeneration(o.LedgerPath)
	lines := LoadLedger(o.LedgerPath)
	byKey := map[string]*Line{}
	for i := range lines {
		l := lines[i]
		byKey[l.SessionID+"|"+l.Day] = &l
	}
	offs := loadOffsets(o.OffsetsPath)
	if offs.Version != offsetsVersion || offs.Generation != gen {
		// Offsets from before this version skipped what this one reads, or
		// they and the ledger were not written together: read every
		// transcript again, rebuilding the ledger from them.
		offs = &offsets{Version: offsetsVersion, Files: map[string]*fileState{}, Sessions: map[string]*sessionMeta{}}
		byKey = map[string]*Line{}
		st.Changed = true
	}
	grown := map[string]bool{}

	err = filepath.WalkDir(o.ProjectsDir, func(p string, d fs.DirEntry, err error) error {
		if err != nil || d.IsDir() || !strings.HasSuffix(p, ".jsonl") {
			return nil
		}
		sid, ok := sessionOf(o.ProjectsDir, p)
		if !ok {
			return nil
		}
		st.Files++
		info, err := d.Info()
		if err != nil {
			return nil
		}
		fsx := offs.Files[p]
		if fsx == nil {
			fsx = &fileState{Session: sid}
			offs.Files[p] = fsx
		}
		if info.Size() == fsx.Offset {
			return nil
		}
		if info.Size() < fsx.Offset {
			// A transcript is append-only; a shorter one was replaced. Its
			// old messages are already counted, so read only what follows.
			fsx.Offset = info.Size()
			return nil
		}
		meta := offs.Sessions[sid]
		if meta == nil {
			meta = &sessionMeta{}
			offs.Sessions[sid] = meta
		}
		n, err := readFrom(p, fsx, meta, o.Loc, func(day string, ts time.Time, model string, k Kinds, first bool) {
			key := sid + "|" + day
			l := byKey[key]
			if l == nil {
				l = &Line{SessionID: sid, Day: day, First: ts, Last: ts}
				byKey[key] = l
			}
			l.Kinds.Add(k)
			if l.Models == nil {
				l.Models = map[string]Kinds{}
			}
			mk := l.Models[model]
			mk.Add(k)
			l.Models[model] = mk
			if first {
				l.Messages++
			}
			if ts.Before(l.First) {
				l.First = ts
			}
			if ts.After(l.Last) {
				l.Last = ts
			}
		})
		st.FilesRead++
		st.BytesRead += n
		if n > 0 {
			grown[sid] = true
		}
		return err
	})
	if err != nil && !errors.Is(err, fs.ErrNotExist) {
		return st, err
	}

	bySession := map[string][]*Line{}
	for _, l := range byKey {
		bySession[l.SessionID] = append(bySession[l.SessionID], l)
	}
	costs := foldCosts(o.Costs)
	changed := len(grown) > 0 || st.Changed
	for sid, ls := range bySession {
		meta := offs.Sessions[sid]
		if meta == nil {
			meta = &sessionMeta{}
			offs.Sessions[sid] = meta
		}
		// Attributed once: a fully attributed session is fixed and keeps its
		// answer whatever happens to its worktree or card. One that could not
		// be (its card cut after its first turn, say) is tried again on every
		// pass until it is.
		if meta.Fixed {
			// A new day of a fixed session takes the attribution its
			// earlier days carry: the ledger keeps it, not the cards.
			sort.Slice(ls, func(i, j int) bool { return ls[i].Day < ls[j].Day })
			for _, l := range ls[1:] {
				if !sameAttribution(l.Attribution, ls[0].Attribution) {
					l.Attribution = ls[0].Attribution
					changed = true
				}
			}
		} else {
			c := costs[sid]
			a := Attribute(Seen{Name: meta.Name, Cwd: meta.Cwd, Pair: meta.Pair, Session: c.Session, Persona: c.Persona}, o.Initiatives)
			meta.Fixed = a.Reason == ""
			for _, l := range ls {
				if !sameAttribution(l.Attribution, a) {
					l.Attribution = a
					changed = true
				}
			}
		}
		if splitCost(ls, costOf(costs[sid], meta)) {
			changed = true
		}
	}

	out := make([]Line, 0, len(byKey))
	for _, l := range byKey {
		out = append(out, *l)
	}
	sortLines(out)
	st.Sessions, st.Lines, st.Changed = len(bySession), len(out), changed
	if changed || st.BytesRead > 0 || st.FilesRead > 0 {
		// Both files move to the next generation together: the ledger
		// first, then the offsets. A crash between them is a mismatch the
		// next pass rebuilds from, never grown bytes counted twice.
		offs.Generation = gen + 1
		if err := writeLedger(o.LedgerPath, offs.Generation, out); err != nil {
			return st, err
		}
		if err := writeJSON(o.OffsetsPath, offs); err != nil {
			return st, err
		}
	}
	return st, nil
}

// sessionOf names the session a transcript belongs to: <project>/<id>.jsonl
// is the session itself, <project>/<id>/subagents/<agent>.jsonl a sub-agent
// of it, counted under its parent. Anything else is not a transcript.
func sessionOf(root, p string) (string, bool) {
	rel, err := filepath.Rel(root, p)
	if err != nil {
		return "", false
	}
	parts := strings.Split(rel, string(filepath.Separator))
	switch {
	case len(parts) == 2:
		return strings.TrimSuffix(parts[1], ".jsonl"), true
	case len(parts) == 4 && parts[2] == "subagents":
		return parts[1], true
	}
	return "", false
}

// entry is the subset of a transcript line the ledger reads.
type entry struct {
	Type        string `json:"type"`
	Timestamp   string `json:"timestamp"`
	Cwd         string `json:"cwd"`
	AgentName   string `json:"agentName"`
	CustomTitle string `json:"customTitle"`
	Message     *struct {
		ID    string `json:"id"`
		Model string `json:"model"`
		Usage *struct {
			Input      int64 `json:"input_tokens"`
			Output     int64 `json:"output_tokens"`
			CacheRead  int64 `json:"cache_read_input_tokens"`
			CacheWrite int64 `json:"cache_creation_input_tokens"`
		} `json:"usage"`
	} `json:"message"`
}

// pairSkills are the pair sessions' skills (Pablo's present-tense sessions:
// Hephaistos and his family), recognised when the transcript loads one.
var pairSkills = []string{"hephaistos", "aglaea", "daedalus", "ariadna"}

var (
	markAssistant = []byte(`"type":"assistant"`)
	markName      = []byte(`"type":"agent-name"`)
	markTitle     = []byte(`"type":"custom-title"`)
	markCwd       = []byte(`"cwd":"`)
	markCost      = []byte(`"type":"cost-state"`)
)

// readFrom reads complete lines from the file's offset to its end, calls add
// for every assistant message not counted before, and advances the offset
// past the last complete line. A line still being written is left for the
// next pass. Returns the bytes consumed.
func readFrom(p string, fsx *fileState, meta *sessionMeta, loc *time.Location, add func(day string, ts time.Time, model string, k Kinds, first bool)) (int64, error) {
	f, err := os.Open(p)
	if err != nil {
		return 0, nil
	}
	defer f.Close()
	if _, err := f.Seek(fsx.Offset, io.SeekStart); err != nil {
		return 0, err
	}
	r := bufio.NewReaderSize(f, 1<<20)
	var read int64
	seen := map[string]*counted{}
	if fsx.Last != nil {
		seen[fsx.Last.ID] = fsx.Last
	}
	sub := strings.Contains(p, string(filepath.Separator)+"subagents"+string(filepath.Separator))
	for {
		b, err := r.ReadBytes('\n')
		if err != nil {
			// No newline: an unfinished line, read again next pass.
			break
		}
		read += int64(len(b))
		switch {
		case bytes.Contains(b, markAssistant):
			var e entry
			if json.Unmarshal(b, &e) != nil || e.Type != "assistant" || e.Message == nil || e.Message.Usage == nil {
				break
			}
			id := e.Message.ID
			if id == "" || e.Message.Model == "<synthetic>" {
				break
			}
			u := e.Message.Usage
			k := Kinds{u.Input, u.Output, u.CacheRead, u.CacheWrite}
			if c := seen[id]; c != nil {
				if d := c.grow(k); d.Total() > 0 {
					add(c.Day, c.TS, c.Model, d, false)
				}
				fsx.Last = c
				break
			}
			ts, err := time.Parse(time.RFC3339Nano, e.Timestamp)
			if err != nil {
				break
			}
			if !sub && meta.Cwd == "" && e.Cwd != "" {
				meta.Cwd = e.Cwd
			}
			c := &counted{ID: id, Day: ts.In(loc).Format("2006-01-02"), Model: e.Message.Model, TS: ts, Kinds: k}
			seen[id] = c
			fsx.Last = c
			add(c.Day, ts, c.Model, k, true)
		case !sub && (bytes.Contains(b, markName) || bytes.Contains(b, markTitle)):
			var e entry
			if json.Unmarshal(b, &e) == nil {
				if e.AgentName != "" {
					meta.Name = e.AgentName
				} else if e.CustomTitle != "" && meta.Name == "" {
					meta.Name = e.CustomTitle
				}
			}
		case !sub && bytes.Contains(b, markCost):
			var c struct {
				Type  string  `json:"type"`
				Total float64 `json:"totalCostUSD"`
			}
			if json.Unmarshal(b, &c) == nil && c.Type == "cost-state" && c.Total > meta.TranscriptCost {
				meta.TranscriptCost = c.Total
			}
		default:
			if !sub && meta.Cwd == "" && bytes.Contains(b, markCwd) {
				var e entry
				if json.Unmarshal(b, &e) == nil && e.Cwd != "" {
					meta.Cwd = e.Cwd
				}
			}
		}
		if !sub && meta.Pair == "" {
			meta.Pair = pairSkillIn(b)
		}
	}
	fsx.Offset += read
	return read, nil
}

// pairSkillIn finds a pair skill loaded on this line: the Skill tool's input
// or the slash command that invokes it.
func pairSkillIn(b []byte) string {
	for _, s := range pairSkills {
		if bytes.Contains(b, []byte(`"skill":"`+s+`"`)) || bytes.Contains(b, []byte(`<command-name>/`+s+`<`)) {
			return s
		}
	}
	return ""
}

func foldCosts(srcs []CostSource) map[string]CostSource {
	out := map[string]CostSource{}
	for _, c := range srcs {
		if c.SessionID == "" {
			continue
		}
		prev, ok := out[c.SessionID]
		if !ok {
			out[c.SessionID] = c
			continue
		}
		if c.HasCost && (!prev.HasCost || c.CostUSD > prev.CostUSD) {
			prev.CostUSD, prev.HasCost = c.CostUSD, true
		}
		if prev.Session == "" {
			prev.Session = c.Session
		}
		if prev.Persona == "" {
			prev.Persona = c.Persona
		}
		out[c.SessionID] = prev
	}
	return out
}

// sessionCost is a session's cost and where it came from.
type sessionCost struct {
	USD  float64
	From string // "record", "transcript", or empty: no cost
}

// costOf picks a session's cost (FR-2, Amendment 1): the statusline's from
// runs.jsonl or a live record, else the transcript's own cost-state. A
// record of $0 is no record, so a session the record left at $0 and the
// transcript prices takes the transcript's. Neither is no cost.
func costOf(c CostSource, meta *sessionMeta) sessionCost {
	switch {
	case c.HasCost && c.CostUSD > 0:
		return sessionCost{USD: c.CostUSD, From: "record"}
	case meta != nil && meta.TranscriptCost > 0:
		return sessionCost{USD: meta.TranscriptCost, From: "transcript"}
	}
	return sessionCost{}
}

// splitCost puts the session's cost on its days by each day's share of its
// tokens. A session with no cost keeps null on every day; one with a cost
// but no tokens has nowhere to put it. Reports whether it moved.
func splitCost(ls []*Line, c sessionCost) bool {
	var total int64
	for _, l := range ls {
		total += l.Total()
	}
	changed := false
	for _, l := range ls {
		var next *float64
		from := ""
		if c.From != "" && total > 0 {
			v := c.USD * float64(l.Total()) / float64(total)
			next, from = &v, c.From
		}
		if !sameCost(l.Cost, next) || l.CostFrom != from {
			l.Cost, l.CostFrom = next, from
			changed = true
		}
	}
	return changed
}

func sameCost(a, b *float64) bool {
	if a == nil || b == nil {
		return a == b
	}
	d := *a - *b
	return d < 1e-9 && d > -1e-9
}

func sameAttribution(a, b Attribution) bool {
	return a.Name == b.Name && a.Cwd == b.Cwd && a.Initiative == b.Initiative && a.Role == b.Role &&
		a.Task == b.Task && a.TaskTitle == b.TaskTitle && a.Reason == b.Reason &&
		strings.Join(a.Cards, ",") == strings.Join(b.Cards, ",")
}

func sortLines(ls []Line) {
	sort.Slice(ls, func(i, j int) bool {
		if ls[i].Day != ls[j].Day {
			return ls[i].Day < ls[j].Day
		}
		return ls[i].SessionID < ls[j].SessionID
	})
}

// LoadLedger reads every line; a missing file is an empty ledger and a
// broken line is skipped.
func LoadLedger(path string) []Line {
	b, err := os.ReadFile(path)
	if err != nil {
		return nil
	}
	var out []Line
	for _, raw := range bytes.Split(b, []byte("\n")) {
		if len(bytes.TrimSpace(raw)) == 0 {
			continue
		}
		var l Line
		if json.Unmarshal(raw, &l) != nil || l.SessionID == "" || l.Day == "" {
			continue
		}
		out = append(out, l)
	}
	return out
}

// ledgerHeader is the ledger's first line; LoadLedger skips it, since it
// has no session.
type ledgerHeader struct {
	Generation int64 `json:"generation"`
}

// ledgerGeneration reads the header of the ledger; 0 for none.
func ledgerGeneration(path string) int64 {
	f, err := os.Open(path)
	if err != nil {
		return 0
	}
	defer f.Close()
	line, _ := bufio.NewReader(f).ReadBytes('\n')
	var h ledgerHeader
	if json.Unmarshal(line, &h) != nil {
		return 0
	}
	return h.Generation
}

func writeLedger(path string, gen int64, ls []Line) error {
	var buf bytes.Buffer
	hb, _ := json.Marshal(ledgerHeader{Generation: gen})
	buf.Write(hb)
	buf.WriteByte('\n')
	for _, l := range ls {
		b, err := json.Marshal(l)
		if err != nil {
			return err
		}
		buf.Write(b)
		buf.WriteByte('\n')
	}
	return writeAtomic(path, buf.Bytes())
}

func loadOffsets(path string) *offsets {
	o := &offsets{}
	if b, err := os.ReadFile(path); err == nil {
		_ = json.Unmarshal(b, o)
	}
	if o.Files == nil {
		o.Files = map[string]*fileState{}
	}
	if o.Sessions == nil {
		o.Sessions = map[string]*sessionMeta{}
	}
	return o
}

func writeJSON(path string, v any) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return writeAtomic(path, b)
}

// writeAtomic writes beside the file, syncs, renames over it, and syncs
// the directory, so a crash leaves the old file or the new one whole.
func writeAtomic(path string, b []byte) error {
	tmp := path + ".tmp"
	f, err := os.OpenFile(tmp, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0o600)
	if err != nil {
		return err
	}
	if _, err := f.Write(b); err != nil {
		f.Close()
		return err
	}
	if err := f.Sync(); err != nil {
		f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmp, path); err != nil {
		return err
	}
	if d, err := os.Open(filepath.Dir(path)); err == nil {
		_ = d.Sync()
		d.Close()
	}
	return nil
}

func lockFile(path string) (func(), error) {
	f, err := os.OpenFile(path, os.O_CREATE|os.O_RDWR, 0o600)
	if err != nil {
		return nil, err
	}
	if err := syscall.Flock(int(f.Fd()), syscall.LOCK_EX); err != nil {
		f.Close()
		return nil, err
	}
	return func() {
		_ = syscall.Flock(int(f.Fd()), syscall.LOCK_UN)
		f.Close()
	}, nil
}
