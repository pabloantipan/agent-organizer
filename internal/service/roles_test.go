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
	"organizer/internal/discuss"
	"organizer/internal/model"
	"organizer/internal/session"
)

// rolesNow is the fixed clock of the roles fixture: 4 Oct 2026, noon.
var rolesNow = time.Date(2026, 10, 4, 12, 0, 0, 0, time.Local)

// rolesHome writes the fixture's files under a temp dir: two initiatives
// (organizer, camp), the bitácoras, and runs.jsonl. It returns the dir.
//
//	hephaistos: a fixed bitácora with two HAND-OFFs, odyssey's first in
//	            the file, lodestar's fresh one second
//	aglaea:     organizer's bitácora, HAND-OFF dated 21 Sep (stale)
//	ariadna:    camp's bitácora, no HAND-OFF, seven dated log lines
//	daedalus:   no bitácora anywhere
func rolesHome(t *testing.T) string {
	t.Helper()
	dir := t.TempDir()
	write := func(rel, body string) {
		p := filepath.Join(dir, rel)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("agent-slack/docs/bitacora/hephaistos_bitacora.md", `# Hephaistos — bitácora

## HAND-OFF — 2026-09-28, odyssey, same sitting (continued)

- Odyssey's line.

## HAND-OFF — 2026-10-03, lodestar

**Forged:** the roles feed.

More.

## Earlier

- 2026-09-27, lodestar: older.
`)
	write("organizer/docs/bitacora/aglaea_bitacora.md", `# aglaea — bitácora

## HAND-OFF — 2026-09-21, at the context cap

Read first: the aglaea skill,
wrapped onto a second line.

- then a list.

## Log

- 2026-09-20 — first wake.
`)
	var log strings.Builder
	log.WriteString("# ariadna — bitácora\n\n## Log\n\n")
	for d := 1; d <= 7; d++ {
		log.WriteString("- 2026-09-0" + string(rune('0'+d)) + " — line " + string(rune('0'+d)) + "\n")
	}
	write("camp/docs/bitacora/ariadna_bitacora.md", log.String())
	return dir
}

func rolesRuns(t *testing.T, dir string) string {
	t.Helper()
	p := filepath.Join(dir, "runs.jsonl")
	at := func(day int) time.Time { return time.Date(2026, 10, day, 9, 0, 0, 0, time.Local) }
	if err := session.AppendRuns(p, []session.Run{
		{PID: 1, SessionID: "a", Session: "camp-probe-ariadna", Cwd: filepath.Join(dir, "camp"), FirstSeen: at(1), LastSeen: at(1)},
		{PID: 2, SessionID: "b", Session: "organizer-probe-ariadna", Cwd: filepath.Join(dir, "organizer", ".wt", "x"), FirstSeen: at(2), LastSeen: at(2)},
		{PID: 3, SessionID: "c", Session: "probe-hefesto", Cwd: filepath.Join(dir, "agent-slack"), FirstSeen: at(3), LastSeen: at(3)},
		{PID: 4, SessionID: "d", Session: "organizer-probe-fse", Cwd: filepath.Join(dir, "organizer"), FirstSeen: at(3), LastSeen: at(3)},
	}); err != nil {
		t.Fatal(err)
	}
	return p
}

func pct(v float64) *model.ContextStatus { return &model.ContextStatus{UsedPercent: v} }

func rolesInputs(t *testing.T, cells []RoleCell) RoleInputs {
	dir := rolesHome(t)
	var files roleFiles
	roles := config.DefaultRoles()
	roles[0].Bitacora = filepath.Join(dir, "agent-slack/docs/bitacora/hephaistos_bitacora.md")
	return RoleInputs{
		Roles:   roles,
		Machine: "lodestar",
		Initiatives: []RoleInitiative{
			{ID: "agent-slack", Path: filepath.Join(dir, "agent-slack"), Agents: []model.Agent{
				{Session: "probe-hefesto", State: model.AgentRunning, PID: 10, Context: pct(42)},
				{Session: "probe-hefesto-2", State: model.AgentWorking, PID: 11, Context: pct(61)},
			}},
			{ID: "organizer", Path: filepath.Join(dir, "organizer"), Agents: []model.Agent{
				{Session: "organizer-probe-aglaea", State: model.AgentRunning, PID: 12, Context: pct(18)},
				// The same session as its layout only: one line, the live one.
				{Session: "organizer-probe-aglaea", State: model.AgentExited},
				{Session: "organizer-probe-fse", State: model.AgentRunning, PID: 13},
			}},
			{ID: "camp", Path: filepath.Join(dir, "camp")},
		},
		Unassigned: []model.Agent{{Session: "probe-other", State: model.AgentRunning, PID: 14}},
		Runs:       session.LoadRuns(rolesRuns(t, dir)),
		Bitacora:   files.bitacora,
		Cells:      cells,
		Now:        rolesNow,
	}
}

func byName(rs []model.Role) map[string]model.Role {
	m := map[string]model.Role{}
	for _, r := range rs {
		m[r.Name] = r
	}
	return m
}

// G1: every state of the spec's States table, from injected inputs.
func TestRolesStates(t *testing.T) {
	cells := []RoleCell{{
		Project: "organizer", Initiative: "organizer",
		Threads: []discuss.Thread{
			{ID: "t1", Subject: "[for Aglaea] the drawer width", Status: "open", AgeSeconds: 60},
			{ID: "t2", Subject: "[FOR aglaea] answered already", Status: "open", AgeSeconds: 120},
			{ID: "t3", Subject: "[for aglaea] closed", Status: "closed"},
			{ID: "t4", Subject: "[for hephaistos] a stalled ask", Status: "stalled", AgeSeconds: 600},
			{ID: "t5", Subject: "roles-feed: not for a role", Status: "open"},
			{ID: "t6", Subject: "[for aglaea] journal", Status: "open", Kind: "journal"},
		},
		Facts: map[string]facts{
			"t1": {from: "fse", lastFrom: "fse", lastBody: "which width?"},
			"t2": {from: "fse", lastFrom: "pablo", lastBody: "[aglaea] 720 px, design system Widths"},
			"t4": {from: "sup37", lastFrom: "sup37", lastBody: "still waiting"},
		},
	}}
	rs := Roles(rolesInputs(t, cells))
	if got := names(rs); got != "Hephaistos,Aglaea,Ariadna,Daedalus,Talos,Hermione" {
		t.Fatalf("roles = %s", got)
	}
	r := byName(rs)

	cases := []struct {
		name  string
		check func(t *testing.T)
	}{
		{"live with two sessions shows the highest context", func(t *testing.T) {
			h := r["Hephaistos"]
			if h.State != model.RoleLive || !h.Working || len(h.Sessions) != 2 {
				t.Fatalf("state %q working %v sessions %d", h.State, h.Working, len(h.Sessions))
			}
			if h.Context == nil || *h.Context != 61 {
				t.Fatalf("context = %v, want 61", h.Context)
			}
			if h.Sessions[0].Initiative != "agent-slack" || *h.Sessions[0].Context != 42 {
				t.Fatalf("session 0 = %+v", h.Sessions[0])
			}
		}},
		{"one live session, the layout twin dropped", func(t *testing.T) {
			a := r["Aglaea"]
			if a.State != model.RoleLive || len(a.Sessions) != 1 || a.Sessions[0].PID != 12 || a.Sessions[0].Initiative != "organizer" {
				t.Fatalf("aglaea = %+v", a)
			}
		}},
		{"not running, last seen from runs.jsonl", func(t *testing.T) {
			a := r["Ariadna"]
			if a.State != model.RoleNotRunning || a.LastSeen == nil || a.LastSeen.Day() != 2 || a.LastSeenIn != "organizer" {
				t.Fatalf("ariadna = %q %v %q", a.State, a.LastSeen, a.LastSeenIn)
			}
		}},
		{"never seen", func(t *testing.T) {
			d := r["Daedalus"]
			if d.State != model.RoleNeverSeen || d.LastSeen != nil || len(d.Sessions) != 0 {
				t.Fatalf("daedalus = %+v", d)
			}
		}},
		{"no bitácora names the expected path", func(t *testing.T) {
			d := r["Daedalus"]
			if len(d.Bitacoras) != 0 || d.BitacoraExpected != "<initiative>/docs/bitacora/daedalus_bitacora.md" {
				t.Fatalf("bitacoras %v expected %q", d.Bitacoras, d.BitacoraExpected)
			}
		}},
		{"this machine's HAND-OFF, fresh, the other kept", func(t *testing.T) {
			b := r["Hephaistos"].Bitacoras
			if len(b) != 1 || b[0].HandOff == nil {
				t.Fatalf("bitacoras = %+v", b)
			}
			h := b[0].HandOff
			if h.Date != "2026-10-03" || h.Host != "lodestar" || h.FirstLine != "**Forged:** the roles feed." || h.Stale {
				t.Fatalf("hand-off = %+v", h)
			}
			if len(b[0].Others) != 1 || b[0].Others[0].Host != "odyssey" || b[0].Others[0].Date != "2026-09-28" {
				t.Fatalf("others = %+v", b[0].Others)
			}
			if b[0].Initiative != "agent-slack" || strings.Contains(h.Body, "Earlier") {
				t.Fatalf("initiative %q body %q", b[0].Initiative, h.Body)
			}
		}},
		{"a HAND-OFF older than a week is stale", func(t *testing.T) {
			b := r["Aglaea"].Bitacoras
			if len(b) != 1 || b[0].HandOff == nil || !b[0].HandOff.Stale || b[0].HandOff.Date != "2026-09-21" || b[0].HandOff.Host != "" {
				t.Fatalf("aglaea bitácora = %+v", b)
			}
			if b[0].HandOff.FirstLine != "Read first: the aglaea skill, wrapped onto a second line." || len(b[0].Log) != 0 {
				t.Fatalf("first line %q log %v", b[0].HandOff.FirstLine, b[0].Log)
			}
		}},
		{"a bitácora without a HAND-OFF gives its last five log lines", func(t *testing.T) {
			b := r["Ariadna"].Bitacoras
			if len(b) != 1 || b[0].HandOff != nil || len(b[0].Log) != 5 {
				t.Fatalf("ariadna bitácora = %+v", b)
			}
			if b[0].Log[4] != (model.RoleLogLine{Date: "2026-09-07", Text: "line 7"}) || b[0].Log[0].Date != "2026-09-03" {
				t.Fatalf("log = %+v", b[0].Log)
			}
		}},
		{"mail waiting, and answered by a [role reply", func(t *testing.T) {
			m := r["Aglaea"].Mail
			if r["Aglaea"].MailUnknown || len(m) != 1 || m[0].ThreadID != "t1" || m[0].From != "fse" || m[0].Project != "organizer" {
				t.Fatalf("aglaea mail = %+v", m)
			}
			if h := r["Hephaistos"].Mail; len(h) != 1 || h[0].ThreadID != "t4" {
				t.Fatalf("hephaistos mail = %+v", h)
			}
			if d := r["Daedalus"]; d.MailUnknown || d.Mail == nil || len(d.Mail) != 0 {
				t.Fatalf("daedalus mail = %+v unknown %v", d.Mail, d.MailUnknown)
			}
		}},
		{"initiatives touched: live sessions, bitácoras, runs", func(t *testing.T) {
			if got := strings.Join(r["Hephaistos"].Initiatives, ","); got != "agent-slack" {
				t.Fatalf("hephaistos = %s", got)
			}
			if got := strings.Join(r["Ariadna"].Initiatives, ","); got != "camp,organizer" {
				t.Fatalf("ariadna = %s", got)
			}
			if got := strings.Join(r["Daedalus"].Initiatives, ","); got != "" {
				t.Fatalf("daedalus = %s", got)
			}
		}},
		{"here: false carries its name and description only", func(t *testing.T) {
			tl := r["Talos"]
			want := model.Role{Name: "Talos", Description: "PLV infra, on odyssey"}
			b, _ := json.Marshal(tl)
			w, _ := json.Marshal(want)
			if string(b) != string(w) {
				t.Fatalf("talos = %s", b)
			}
		}},
	}
	for _, c := range cases {
		t.Run(c.name, c.check)
	}
}

// Discuss down: every cell unreadable means mail unknown, never zero.
func TestRolesMailUnknown(t *testing.T) {
	for _, c := range []struct {
		name    string
		cells   []RoleCell
		unknown bool
	}{
		{"discuss down", []RoleCell{{Project: "organizer", Err: "discuss is not running"}, {Project: "camp", Err: "discuss is not running"}}, true},
		{"one cell read", []RoleCell{{Project: "organizer"}, {Project: "camp", Err: "no identity with a discuss token"}}, false},
		{"no cells", nil, false},
	} {
		t.Run(c.name, func(t *testing.T) {
			for _, r := range Roles(rolesInputs(t, c.cells)) {
				if r.Here && r.MailUnknown != c.unknown {
					t.Fatalf("%s mail unknown = %v, want %v", r.Name, r.MailUnknown, c.unknown)
				}
			}
		})
	}
}

// roles: [] gives no roles on the feed; the default list gives six.
func TestAgentsViewRoles(t *testing.T) {
	t.Setenv("XDG_DATA_HOME", t.TempDir())
	dir := rolesHome(t)
	canned := filepath.Join(t.TempDir(), "health.json")
	if err := os.WriteFile(canned, []byte(`{"organizer":{"agents":[],"threads":[
		{"id":"t1","subject":"[for aglaea] read me","status":"open","kind":"conversation","messages":1}]}}`), 0o644); err != nil {
		t.Fatal(err)
	}
	st := cache.State{Local: model.Snapshot{Initiatives: []model.ScannedInitiative{
		{Initiative: model.Initiative{ID: "organizer", Path: filepath.Join(dir, "organizer")},
			Cell:   &model.Cell{Project: "organizer", Human: "pablo"},
			Agents: []model.Agent{{Session: "organizer-probe-aglaea", State: model.AgentRunning, PID: 12, Context: pct(30)}}},
	}}}
	for _, c := range []struct {
		name  string
		roles []config.Role
		want  string
	}{
		{"default", config.DefaultRoles(), "Hephaistos,Aglaea,Ariadna,Daedalus,Talos,Hermione"},
		{"roles: []", []config.Role{}, ""},
	} {
		t.Run(c.name, func(t *testing.T) {
			cfg := config.Config{Machine: "lodestar", CannedHealth: canned, DiscussStateDir: t.TempDir(), Roles: c.roles}
			s := NewWith(cfg, st, func() time.Time { return rolesNow })
			// The thread's facts as the feed caches them; no discuss here.
			s.openers = map[string]facts{"t1": {msgs: 1, from: "fse", lastFrom: "fse", lastBody: "read me"}}
			s.mu.Lock()
			v := s.agentsViewLocked()
			s.mu.Unlock()
			if v.Roles == nil || names(v.Roles) != c.want {
				t.Fatalf("roles = %q (nil %v), want %q", names(v.Roles), v.Roles == nil, c.want)
			}
			if c.want == "" {
				return
			}
			a := byName(v.Roles)["Aglaea"]
			if a.State != model.RoleLive || *a.Context != 30 || len(a.Mail) != 1 || a.Mail[0].Initiative != "organizer" {
				t.Fatalf("aglaea = %+v", a)
			}
		})
	}
}

// The bitácora cache reads a file again only when it changes.
func TestRoleFilesCache(t *testing.T) {
	p := filepath.Join(t.TempDir(), "b.md")
	write := func(body string, mod time.Time) {
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
		if err := os.Chtimes(p, mod, mod); err != nil {
			t.Fatal(err)
		}
	}
	var c roleFiles
	write("## HAND-OFF — 2026-10-01\n\nfirst\n", rolesNow)
	if b, ok := c.bitacora(p); !ok || b.HandOff.FirstLine != "first" {
		t.Fatalf("first read = %+v", b)
	}
	b, _ := c.bitacora(p)
	b.HandOff.Stale = true // a sample stamps its copy, never the cache
	if b, _ := c.bitacora(p); b.HandOff.Stale {
		t.Fatal("the cache was stamped")
	}
	write("## HAND-OFF — 2026-10-02\n\nsecond\n", rolesNow.Add(time.Minute))
	if b, _ := c.bitacora(p); b.HandOff.FirstLine != "second" {
		t.Fatalf("after a change = %+v", b.HandOff)
	}
	os.Remove(p)
	if _, ok := c.bitacora(p); ok {
		t.Fatal("a removed bitácora is still found")
	}
}

func names(rs []model.Role) string {
	var n []string
	for _, r := range rs {
		n = append(n, r.Name)
	}
	return strings.Join(n, ",")
}

// A HAND-OFF heading's date and host, as the bitácoras write them.
func TestHandOffHeading(t *testing.T) {
	for _, c := range []struct{ heading, date, host string }{
		{"## HAND-OFF — 2026-09-30, lodestar", "2026-09-30", "lodestar"},
		{"## HAND-OFF — 2026-09-30, odyssey (read this first; context cleared after it)", "2026-09-30", "odyssey"},
		{"## HAND-OFF — 2026-09-28, odyssey, same sitting (continued)", "2026-09-28", "odyssey"},
		{"## HAND-OFF — 2026-10-04, at the context cap", "2026-10-04", ""},
		{"### Hand-off 2026-10-01", "2026-10-01", ""},
		{"## HAND-OFF", "", ""},
	} {
		hands, _ := parseBitacora(c.heading + "\n\nbody\n")
		if len(hands) != 1 || hands[0].Date != c.date || hands[0].Host != c.host || hands[0].FirstLine != "body" {
			t.Errorf("%q = %+v, want date %q host %q", c.heading, hands, c.date, c.host)
		}
	}
}
