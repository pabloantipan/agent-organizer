package service

import (
	"os"
	"path"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"time"

	"organizer/internal/config"
	"organizer/internal/discuss"
	"organizer/internal/model"
	"organizer/internal/session"
)

// The transversal roles (docs/ux/specs/transversal-roles.md, T2): which
// configured roles are up, what each is on, the mail waiting for it and the
// initiatives it touched. Built on the 10 s agents feed from the sample the
// feed already took; the only reads of its own are the bitácoras and
// runs.jsonl, and both are cached by modification time and size (roleFiles).

// handOffStale is how old a HAND-OFF may be before the row dims its date.
const handOffStale = 7 * 24 * time.Hour

// roleLogLines is how many log lines a bitácora without a HAND-OFF carries.
const roleLogLines = 5

// RoleInitiative is one scanned initiative as the roles see it: its root, for
// <initiative> in a bitácora path and for placing a cwd, and its agents.
type RoleInitiative struct {
	ID     string
	Path   string
	Agents []model.Agent
}

// RoleCell is one cell's mailbox as the agents feed read it, as the cell's
// human: its live threads and what each thread's messages say. Err is why the
// cell could not be read, empty when it was.
type RoleCell struct {
	Project    string
	Initiative string
	Threads    []discuss.Thread
	Facts      map[string]facts
	Err        string
}

// RoleInputs is everything Roles reads. Bitacora returns a parsed bitácora and
// false when there is none at that path.
type RoleInputs struct {
	Roles       []config.Role
	Machine     string
	Initiatives []RoleInitiative
	Unassigned  []model.Agent
	Runs        []session.Run
	Bitacora    func(path string) (model.RoleBitacora, bool)
	Cells       []RoleCell
	Now         time.Time
}

// Roles builds one model.Role per configured role, in the configured order.
func Roles(in RoleInputs) []model.Role {
	out := make([]model.Role, 0, len(in.Roles))
	for _, rc := range in.Roles {
		r := model.Role{Name: rc.Name, Description: rc.Description, Here: rc.Here}
		if !rc.Here {
			out = append(out, r)
			continue
		}
		r.Sessions, r.Bitacoras, r.Mail, r.Initiatives = []model.RoleSession{}, []model.RoleBitacora{}, []model.RoleMail{}, []string{}
		touched := newOrderedSet()

		// Sessions: the agents feed's sample, matched by session name.
		for _, s := range roleSessions(rc.Sessions, in) {
			r.Sessions = append(r.Sessions, s)
			if s.State == model.AgentWorking || s.State == model.AgentRunning {
				r.State = model.RoleLive
				touched.add(s.Initiative)
			}
			if s.Working {
				r.Working = true
			}
			if s.Context != nil && (r.Context == nil || *s.Context > *r.Context) {
				v := *s.Context
				r.Context = &v
			}
		}

		// Bitácoras, then what they say.
		paths := bitacoraPaths(rc.Bitacora, in.Initiatives)
		for _, p := range paths {
			b, ok := in.Bitacora(p.path)
			if !ok {
				continue
			}
			b.Path, b.Initiative = p.path, p.initiative
			pickHandOff(&b, in.Machine)
			if b.HandOff != nil {
				b.HandOff.Stale = staleDate(b.HandOff.Date, in.Now)
			}
			r.Bitacoras = append(r.Bitacoras, b)
			touched.add(p.initiative)
		}
		if len(r.Bitacoras) == 0 && rc.Bitacora != "" {
			r.BitacoraExpected = config.Expand(rc.Bitacora)
		}

		// Runs: last seen, and the initiatives of every run by cwd.
		for _, run := range in.Runs { // newest last-seen first
			if !matchSession(rc.Sessions, run.Session) {
				continue
			}
			init := initiativeOf(run.Cwd, in.Initiatives)
			if r.LastSeen == nil || run.LastSeen.After(*r.LastSeen) {
				t := run.LastSeen
				r.LastSeen, r.LastSeenIn = &t, init
			}
			touched.add(init)
		}
		if r.State == "" {
			r.State = model.RoleNeverSeen
			if r.LastSeen != nil || len(r.Sessions) > 0 {
				r.State = model.RoleNotRunning
			}
		}

		r.Mail, r.MailUnknown = roleMail(rc.Name, in.Cells)
		r.Initiatives = touched.items
		out = append(out, r)
	}
	return out
}

// roleSessions is every session of the sample whose name matches the glob,
// one line per name: a name seen twice keeps the line with a process.
func roleSessions(glob string, in RoleInputs) []model.RoleSession {
	var out []model.RoleSession
	at := map[string]int{}
	add := func(a model.Agent, initiative string) {
		if !matchSession(glob, a.Session) {
			return
		}
		s := model.RoleSession{
			Name: a.Session, Initiative: initiative, State: a.State,
			Working: a.State == model.AgentWorking,
			Created: a.Created, Uptime: a.Uptime, PID: a.PID,
		}
		if a.Context != nil {
			v := a.Context.UsedPercent
			s.Context = &v
		}
		if i, ok := at[s.Name]; ok {
			if out[i].PID == 0 && s.PID > 0 {
				out[i] = s
			}
			return
		}
		at[s.Name] = len(out)
		out = append(out, s)
	}
	for _, si := range in.Initiatives {
		for _, a := range si.Agents {
			add(a, si.ID)
		}
	}
	for _, a := range in.Unassigned {
		add(a, initiativeOf(a.Dir, in.Initiatives))
	}
	return out
}

// matchSession reports whether a session name matches a role's glob. An
// empty glob or name matches nothing.
func matchSession(glob, name string) bool {
	if glob == "" || name == "" {
		return false
	}
	ok, err := path.Match(glob, name)
	return err == nil && ok
}

type bitacoraPath struct{ path, initiative string }

// bitacoraPaths expands a role's bitácora path: once per initiative root when
// it holds <initiative>, else once, placed in the initiative it falls in.
func bitacoraPaths(pattern string, inits []RoleInitiative) []bitacoraPath {
	if pattern == "" {
		return nil
	}
	if !strings.Contains(pattern, config.InitiativeToken) {
		p := filepath.Clean(config.Expand(pattern))
		return []bitacoraPath{{p, initiativeOf(p, inits)}}
	}
	var out []bitacoraPath
	for _, si := range inits {
		p := strings.ReplaceAll(pattern, config.InitiativeToken, si.Path)
		out = append(out, bitacoraPath{filepath.Clean(config.Expand(p)), si.ID})
	}
	return out
}

// initiativeOf is the initiative whose root holds dir, the longest root
// winning; empty when none does.
func initiativeOf(dir string, inits []RoleInitiative) string {
	if dir == "" {
		return ""
	}
	best, n := "", 0
	for _, si := range inits {
		root := filepath.Clean(si.Path)
		if (dir == root || strings.HasPrefix(dir, root+string(filepath.Separator))) && len(root) > n {
			best, n = si.ID, len(root)
		}
	}
	return best
}

// roleMail is the open threads waiting for a role in every cell read as the
// human: the subject starts "[for <name>]" and the last message is not the
// role's reply, a body starting "[<name>". Unknown when cells exist and not
// one of them could be read, which is what discuss being down looks like.
func roleMail(name string, cells []RoleCell) ([]model.RoleMail, bool) {
	out := []model.RoleMail{}
	lower := strings.ToLower(name)
	read := 0
	for _, c := range cells {
		if c.Err != "" {
			continue
		}
		read++
		for _, t := range c.Threads {
			if t.Kind == "journal" || t.Status == "closed" {
				continue
			}
			if !strings.HasPrefix(strings.ToLower(strings.TrimSpace(t.Subject)), "[for "+lower+"]") {
				continue
			}
			f := c.Facts[t.ID]
			if strings.HasPrefix(strings.ToLower(strings.TrimSpace(f.lastBody)), "["+lower) {
				continue
			}
			out = append(out, model.RoleMail{
				ThreadID: t.ID, Subject: t.Subject, Project: c.Project, Initiative: c.Initiative,
				From: f.from, Status: t.Status, AgeSeconds: t.AgeSeconds,
			})
		}
	}
	sort.SliceStable(out, func(i, j int) bool { return out[i].AgeSeconds > out[j].AgeSeconds })
	return out, len(cells) > 0 && read == 0
}

// ---- bitácoras ----

var (
	isoDate     = regexp.MustCompile(`\d{4}-\d{2}-\d{2}`)
	afterDate   = regexp.MustCompile(`^\d{4}-\d{2}-\d{2},\s*([^\s,(]+)\s*(?:$|[,(])`)
	datedLine   = regexp.MustCompile(`^\s*(?:[-*]\s+|#+\s+)?(\d{4}-\d{2}-\d{2})\b[\s—–:-]*(.*)$`)
	listMarker  = regexp.MustCompile(`^\s*(?:[-*+]|\d+\.)\s+`)
	handOffWord = "HAND-OFF"
)

// parseBitacora reads what a bitácora says the role is on: every HAND-OFF
// section in file order (pickHandOff chooses the one the row shows), and,
// when there is none, its last dated log lines.
func parseBitacora(text string) (hands []model.RoleHandOff, log []model.RoleLogLine) {
	lines := strings.Split(text, "\n")
	for i := 0; i < len(lines); i++ {
		n, t := mdHeading(lines[i])
		if n == 0 || !strings.HasPrefix(strings.ToUpper(t), handOffWord) {
			continue
		}
		end := len(lines)
		for j := i + 1; j < len(lines); j++ {
			if m, _ := mdHeading(lines[j]); m > 0 && m <= n {
				end = j
				break
			}
		}
		body := strings.Trim(strings.Join(lines[i+1:end], "\n"), "\n")
		h := model.RoleHandOff{Title: t, Body: body}
		rest := strings.TrimSpace(strings.TrimLeft(t[len(handOffWord):], " —–-:"))
		if loc := isoDate.FindStringIndex(rest); loc != nil {
			h.Date = rest[loc[0]:loc[1]]
			if m := afterDate.FindStringSubmatch(rest[loc[0]:]); m != nil {
				h.Host = m[1]
			}
		}
		h.FirstLine = firstLine(body)
		hands = append(hands, h)
		i = end - 1
	}
	if len(hands) > 0 {
		return hands, nil
	}
	for _, l := range lines {
		if m := datedLine.FindStringSubmatch(l); m != nil {
			log = append(log, model.RoleLogLine{Date: m[1], Text: strings.TrimSpace(m[2])})
		}
	}
	// Some bitácoras log newest first: order by date, keep the file's order
	// within a day, and keep the last five.
	sort.SliceStable(log, func(i, j int) bool { return log[i].Date < log[j].Date })
	if len(log) > roleLogLines {
		log = log[len(log)-roleLogLines:]
	}
	return nil, log
}

// firstLine is the section's first line as it renders: its first paragraph
// or list item, wrapped lines joined, a list marker dropped. A bitácora wraps
// at 80 columns, so the file's first line is often half a sentence.
func firstLine(body string) string {
	var parts []string
	for _, l := range strings.Split(body, "\n") {
		t := strings.TrimSpace(l)
		if t == "" {
			if len(parts) > 0 {
				break
			}
			continue
		}
		if len(parts) > 0 && (listMarker.MatchString(l) || strings.HasPrefix(t, "#")) {
			break
		}
		parts = append(parts, strings.TrimSpace(listMarker.ReplaceAllString(l, "")))
	}
	return strings.Join(parts, " ")
}

// pickHandOff sets the HAND-OFF the row shows: this machine's when a heading
// names it (a bitácora shared by two Macs keeps one per host), else the first
// in the file. The others stay in Others, in file order.
func pickHandOff(b *model.RoleBitacora, machine string) {
	all := append([]model.RoleHandOff(nil), b.Others...)
	if b.HandOff != nil {
		all = append([]model.RoleHandOff{*b.HandOff}, all...)
	}
	if len(all) == 0 {
		b.HandOff, b.Others = nil, nil
		return
	}
	pick := 0
	for i, h := range all {
		if machine != "" && strings.EqualFold(h.Host, machine) {
			pick = i
			break
		}
	}
	h := all[pick]
	b.HandOff = &h
	b.Others = append(append([]model.RoleHandOff{}, all[:pick]...), all[pick+1:]...)
}

// mdHeading is the level and text of an ATX heading; 0 for any other line.
func mdHeading(line string) (int, string) {
	n := 0
	for n < len(line) && line[n] == '#' {
		n++
	}
	if n == 0 || n > 6 || n == len(line) || line[n] != ' ' {
		return 0, ""
	}
	return n, strings.TrimSpace(line[n:])
}

// staleDate reports whether a YYYY-MM-DD is more than a week before now.
func staleDate(date string, now time.Time) bool {
	d, err := time.ParseInLocation("2006-01-02", date, now.Location())
	if err != nil {
		return false
	}
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	return today.Sub(d) > handOffStale
}

// ---- the files, cached by modification time and size ----

type fileStamp struct {
	mod  time.Time
	size int64
}

func stampOf(fi os.FileInfo) fileStamp { return fileStamp{fi.ModTime(), fi.Size()} }

// roleFiles keeps the parsed bitácoras and runs.jsonl between samples. A file
// is stat'ed every sample and read again only when its stamp moves. Guarded by
// the service lock: the feed builds under it.
type roleFiles struct {
	bitacoras map[string]cachedBitacora
	runsStamp fileStamp
	runsPath  string
	runs      []session.Run
}

type cachedBitacora struct {
	stamp fileStamp
	b     model.RoleBitacora
}

func (c *roleFiles) bitacora(p string) (model.RoleBitacora, bool) {
	fi, err := os.Stat(p)
	if err != nil || fi.IsDir() {
		delete(c.bitacoras, p)
		return model.RoleBitacora{}, false
	}
	if c.bitacoras == nil {
		c.bitacoras = map[string]cachedBitacora{}
	}
	if hit, ok := c.bitacoras[p]; ok && hit.stamp == stampOf(fi) {
		return copyBitacora(hit.b), true
	}
	raw, err := os.ReadFile(p)
	if err != nil {
		return model.RoleBitacora{}, false
	}
	hands, log := parseBitacora(string(raw))
	b := model.RoleBitacora{Log: log}
	if len(hands) > 0 {
		b.HandOff, b.Others = &hands[0], hands[1:]
	}
	c.bitacoras[p] = cachedBitacora{stampOf(fi), b}
	return copyBitacora(b), true
}

// copyBitacora gives each sample its own HAND-OFF, since Roles stamps it.
func copyBitacora(b model.RoleBitacora) model.RoleBitacora {
	if b.HandOff != nil {
		h := *b.HandOff
		b.HandOff = &h
	}
	b.Others = append([]model.RoleHandOff(nil), b.Others...)
	b.Log = append([]model.RoleLogLine(nil), b.Log...)
	return b
}

func (c *roleFiles) loadRuns(p string) []session.Run {
	fi, err := os.Stat(p)
	if err != nil {
		c.runs, c.runsPath = nil, ""
		return nil
	}
	if c.runsPath != p || c.runsStamp != stampOf(fi) {
		c.runs, c.runsPath, c.runsStamp = session.LoadRuns(p), p, stampOf(fi)
	}
	return c.runs
}

// ---- on the feed ----

// rolesLocked builds the roles from the sample the feed just took and the
// cells it just read. Called with the service lock held.
func (s *Service) rolesLocked(cells []RoleCell) []model.Role {
	if len(s.cfg.Roles) == 0 {
		return []model.Role{}
	}
	inits := make([]RoleInitiative, 0, len(s.state.Local.Initiatives))
	for _, si := range s.state.Local.Initiatives {
		inits = append(inits, RoleInitiative{ID: si.ID, Path: si.Path, Agents: si.Agents})
	}
	return Roles(RoleInputs{
		Roles:       s.cfg.Roles,
		Machine:     s.cfg.Machine,
		Initiatives: inits,
		Unassigned:  s.state.Local.Unassigned,
		Runs:        s.roleFiles.loadRuns(session.RunsPath()),
		Bitacora:    s.roleFiles.bitacora,
		Cells:       cells,
		Now:         s.now(),
	})
}

// orderedSet keeps first-seen order and drops empties and repeats.
type orderedSet struct {
	seen  map[string]bool
	items []string
}

func newOrderedSet() *orderedSet { return &orderedSet{seen: map[string]bool{}, items: []string{}} }

func (o *orderedSet) add(s string) {
	if s != "" && !o.seen[s] {
		o.seen[s] = true
		o.items = append(o.items, s)
	}
}
