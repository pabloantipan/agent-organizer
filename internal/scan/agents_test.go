package scan

import (
	"testing"

	"organizer/internal/model"
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
	inits := []model.ScannedInitiative{{}, {}}
	inits[0].ID, inits[0].Path = "shop", "/h/work/shop"
	inits[1].ID, inits[1].Path = "traces", "/h/traces"
	agents := []model.Agent{
		{Name: "a", Dir: "/h/work/shop/3.0/x", State: model.AgentWorking},
		{Name: "b", Dir: "/h/traces", State: model.AgentRunning},
		{Name: "c", Dir: "/h/other"},
		{Name: "d", Family: "traces", Dir: ""},
	}
	un := AssignAgents(inits, agents)
	if len(inits[0].Agents) != 1 || len(inits[1].Agents) != 2 || len(un) != 1 {
		t.Fatalf("shop=%d traces=%d un=%d", len(inits[0].Agents), len(inits[1].Agents), len(un))
	}
	live, working := inits[0].LiveAgents()
	if live != 1 || working != 1 {
		t.Errorf("live=%d working=%d", live, working)
	}
}
