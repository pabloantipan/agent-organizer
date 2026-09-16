package scan

import (
	"testing"
	"time"

	"organizer/internal/model"
	"organizer/internal/session"
)

func TestParseCPUTime(t *testing.T) {
	cases := map[string]float64{"1:02.50": 62.5, "12:34:56": 45296, "3-01:02:03": 3*86400 + 3723}
	for in, want := range cases {
		if got := parseCPUTime(in); got != want {
			t.Errorf("%s -> %v want %v", in, got, want)
		}
	}
}

func TestSplitProbeAndAge(t *testing.T) {
	if f, s := splitProbe("shop-probe-dog-11"); f != "shop" || s != "dog-11" {
		t.Errorf("got %s %s", f, s)
	}
	if f, s := splitProbe("probe-fox-1"); f != "" || s != "fox-1" {
		t.Errorf("got %s %s", f, s)
	}
	if f, s := splitProbe("ob-katherine"); f != "" || s != "ob-katherine" {
		t.Errorf("got %s %s", f, s)
	}
	if shortAge("14days 7h 7m 33s") != "14days 7h" {
		t.Error("shortAge")
	}
}

func TestNameArg(t *testing.T) {
	for in, want := range map[string]string{
		" /x/claude -n shop-probe-implementer": "shop-probe-implementer",
		" claude --resume 'traces-probe-x'":    "traces-probe-x",
		" claude":                              "",
	} {
		m := nameArgRe.FindStringSubmatch(in)
		got := ""
		if m != nil {
			got = m[1]
		}
		if got != want {
			t.Errorf("%q -> %q want %q", in, got, want)
		}
	}
}

func TestAssignAgents(t *testing.T) {
	inits := []model.ScannedInitiative{{}, {}, {}}
	inits[0].ID, inits[0].Path = "shop", "/h/work/shop"
	inits[1].ID, inits[1].Path = "traces", "/h/traces"
	// A cell's seats run in sessions named after the cell's project, not
	// after the initiative: camp-probe-andrea belongs to ccint-camp-monorepo.
	inits[2].ID, inits[2].Path = "ccint-camp-monorepo", "/h/ccint/ccint-camp-monorepo"
	inits[2].Cell = &model.Cell{Project: "camp", Agents: []string{"po_andrea"}}
	agents := []model.Agent{
		{Name: "a", Dir: "/h/work/shop/3.0/x", State: model.AgentWorking},
		{Name: "b", Dir: "/h/traces", State: model.AgentRunning},
		{Name: "c", Dir: "/h/other"},
		{Name: "d", Family: "traces", Dir: ""},
		{Name: "camp-probe-andrea", Family: "camp", Short: "andrea", Dir: ""},
	}
	un := AssignAgents(inits, agents)
	if len(inits[0].Agents) != 1 || len(inits[1].Agents) != 2 || len(un) != 1 {
		t.Fatalf("shop=%d traces=%d un=%d", len(inits[0].Agents), len(inits[1].Agents), len(un))
	}
	if len(inits[2].Agents) != 1 || inits[2].Agents[0].Name != "camp-probe-andrea" {
		t.Errorf("a crew session should reach its initiative by the cell's project: %+v", inits[2].Agents)
	}
	live, working := inits[0].LiveAgents()
	if live != 1 || working != 1 {
		t.Errorf("live=%d working=%d", live, working)
	}
}

func TestIdentityFromPsLine(t *testing.T) {
	sess, persona, cell := identity("-n camp-probe-po-andrea PATH=/usr/bin PROJECT_ID=camp AGENT_NAME=po_andrea DISCUSS_TOKEN=secret AGENT_SESSION=camp-probe-po-andrea")
	if sess != "camp-probe-po-andrea" || persona != "po_andrea" || cell != "camp" {
		t.Errorf("got %q %q %q", sess, persona, cell)
	}
	// No -n: the probe env still names the session; a plain agent has nothing.
	if sess, _, _ := identity("AGENT_SESSION=probe-fox-1 HOME=/h"); sess != "probe-fox-1" {
		t.Errorf("env session %q", sess)
	}
	if sess, persona, cell := identity("HOME=/h"); sess != "" || persona != "" || cell != "" {
		t.Error("plain agent should have no identity")
	}
}

func TestAttachSessions(t *testing.T) {
	dir := t.TempDir()
	now := time.Now()
	for _, r := range []session.Record{
		{PID: 5, SessionID: "s5", Persona: "po_andrea", Cell: "camp", Session: "camp-probe-po-andrea", UsedPercent: 37, WindowSize: 200000, UpdatedAt: now},
		{PID: 6, SessionID: "gone", UpdatedAt: now.Add(-time.Hour)},
	} {
		if err := session.Write(dir, r); err != nil {
			t.Fatal(err)
		}
	}
	procs := []model.Agent{{PID: 5}, {PID: 7}}
	attachSessions(AgentOptions{SessionsDir: dir}, procs)
	if procs[0].Context == nil || procs[0].Context.UsedPercent != 37 || procs[0].Persona != "po_andrea" || procs[0].Session != "camp-probe-po-andrea" {
		t.Errorf("pid 5: %+v", procs[0])
	}
	if procs[1].Context != nil {
		t.Error("pid 7 has no record")
	}
	if _, ok := session.Load(dir)[6]; ok {
		t.Error("stale record for a dead pid should be pruned")
	}
}
