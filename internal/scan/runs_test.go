package scan

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"organizer/internal/model"
)

// writeFiles lays out files under root, creating directories.
func writeFiles(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for name, body := range files {
		p := filepath.Join(root, name)
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
}

const twoWaves = `---
waves:
  - wave: 1
    supervisor: sup7
    task: "the first task"
    cards: [alpha, beta]
    launched: 2026-10-06T15:21-03:00
    merged: 2026-10-06T15:48-03:00
    rounds:
      - card: alpha
        kind: build
        start: 2026-10-06T15:21-03:00
        end: 2026-10-06T15:38-03:00
        result: n/a
        reviewer:
        reason: "gate met"
      - card: alpha
        kind: review
        start: 2026-10-06T15:39-03:00
        end: 2026-10-06T15:42-03:00
        result: fail
        reviewer: a-review
        reason: "gate row 2"
      - card: beta
        kind: take
        start: 2026-10-06T15:43:10+02:00
        end: 2026-10-06T15:47:00+02:00
        result: pass
        reviewer: pablo
        reason: "looks right"
  - wave: 2
    supervisor: sup7
    task: "the first task"
    cards: [gamma]
    launched: 2026-10-06T15:49Z
    merged:
    rounds:
      - card: gamma
        kind: build
        start: 2026-10-06T15:49Z
        end: 2026-10-06T16:15Z
        result: n/a
        reviewer:
        reason: "built"
      - card: gamma
        kind: ui-review
        start: 2026-10-06T16:16Z
        end:
        result:
        reviewer: g-ui
        reason: ""
---

# The first task, wave by wave
`

// W1: a record with two waves and five rounds parses whole, times keep their
// offsets as written, and a record with no block is a dot dated by its name.
func TestReadRunsWavesRoundsAndDot(t *testing.T) {
	root := t.TempDir()
	writeFiles(t, root, map[string]string{
		"runs/2026-10-06-first.md":    twoWaves,
		"runs/2026-09-26-old-wave.md": "# An older run, prose only\n\nRounds: built, reviewed.\n",
		"runs/TEMPLATE.md":            "---\nwaves: []\n---\n",
		"runs/notes.txt":              "not a record",
	})
	waves, probs := readRuns(root, nil)
	if len(probs) != 0 {
		t.Fatalf("problems=%v", probs)
	}
	if len(waves) != 3 {
		t.Fatalf("waves=%d %+v", len(waves), waves)
	}
	dot := waves[0]
	if !dot.Dot || dot.Record != "2026-09-26-old-wave.md" || dot.Date != "2026-09-26" || dot.Task != "An older run, prose only" || dot.Rounds == nil || len(dot.Rounds) != 0 || dot.Cards == nil {
		t.Errorf("dot=%+v", dot)
	}
	w1, w2 := waves[1], waves[2]
	for _, w := range []model.Wave{w1, w2} {
		if w.Dot || w.Record != "2026-10-06-first.md" || w.Date != "2026-10-06" || w.Supervisor != "sup7" {
			t.Errorf("wave=%+v", w)
		}
	}
	if w1.Number != 1 || strings.Join(w1.Cards, ",") != "alpha,beta" || w1.Launched != "2026-10-06T15:21-03:00" || w1.Merged != "2026-10-06T15:48-03:00" {
		t.Errorf("w1=%+v", w1)
	}
	if w2.Number != 2 || w2.Launched != "2026-10-06T15:49Z" || w2.Merged != "" {
		t.Errorf("w2 open=%+v", w2)
	}
	if len(w1.Rounds)+len(w2.Rounds) != 5 {
		t.Fatalf("rounds %d+%d", len(w1.Rounds), len(w2.Rounds))
	}
	r := w1.Rounds[1]
	if r.Card != "alpha" || r.Kind != model.RoundReview || r.Result != model.ResultFail || r.Reviewer != "a-review" || r.Reason != "gate row 2" || r.Start != "2026-10-06T15:39-03:00" {
		t.Errorf("review round=%+v", r)
	}
	if take := w1.Rounds[2]; take.Kind != model.RoundTake || take.Start != "2026-10-06T15:43:10+02:00" || take.End != "2026-10-06T15:47:00+02:00" {
		t.Errorf("take=%+v", take)
	}
	if open := w2.Rounds[1]; open.Kind != model.RoundUIReview || open.End != "" || open.Result != "" {
		t.Errorf("round in flight=%+v", open)
	}
}

// FR-1: no runs/ is no waves and no problem.
func TestReadRunsNoDir(t *testing.T) {
	waves, probs := readRuns(t.TempDir(), nil)
	if waves != nil || probs != nil {
		t.Errorf("waves=%v problems=%v", waves, probs)
	}
}

// W2: a wave whose cards sit in two stages (one of them done) is under both,
// in roadmap order; a wave whose cards join none is outside any stage.
func TestReadInitiativeJoinsWavesToStages(t *testing.T) {
	sandbox(t)
	root := t.TempDir()
	card := func(status, stage string) string {
		s := "---\ntitle: a card\nstatus: " + status + "\nrepos: []\nbranch: none\nupdated: 2026-10-06\nnext: \"x\"\n"
		if stage != "" {
			s += "stage: " + stage + "\n"
		}
		return s + "---\n"
	}
	writeFiles(t, root, map[string]string{
		"working-on/initiative.yaml": "id: waves\ntitle: Waves\nrepos: []\n",
		"working-on/roadmap.yaml":    "stages:\n  - id: early\n    title: Early\n  - id: late\n    title: Late\n",
		"working-on/a.md":            card("now", "late"),
		"working-on/done/b.md":       card("done", "early"),
		"working-on/c.md":            card("next", ""),
		"runs/2026-10-06-w.md": `---
waves:
  - wave: 1
    supervisor: sup1
    task: t
    cards: [a, b]
    launched: 2026-10-06T10:00-03:00
    merged: 2026-10-06T11:00-03:00
    rounds: []
  - wave: 2
    supervisor: sup1
    task: t
    cards: [c]
    launched: 2026-10-06T11:00-03:00
    merged:
    rounds: []
---
`,
	})
	si := ReadInitiative(root, Options{})
	for _, p := range si.Problems {
		t.Errorf("problem: %s: %s", p.Path, p.Msg)
	}
	if len(si.Waves) != 2 {
		t.Fatalf("waves=%+v", si.Waves)
	}
	if got := strings.Join(si.Waves[0].Stages, ","); got != "early,late" {
		t.Errorf("two-stage wave stages=%q", got)
	}
	if si.Waves[1].Stages == nil || len(si.Waves[1].Stages) != 0 {
		t.Errorf("outside wave stages=%#v, want empty and not nil", si.Waves[1].Stages)
	}
}

// W3: each malformed case is one problem, and the record and its waves are
// kept. Unparseable YAML is one problem and the record stays as a dot.
func TestReadRunsMalformedKeptAndReported(t *testing.T) {
	cases := []struct {
		name, round, want string
	}{
		{"time without offset", "card: a\n        kind: build\n        start: 2026-10-06T15:21\n        end: 2026-10-06T15:38-03:00\n        result: n/a",
			`round 1 start "2026-10-06T15:21" is not ISO 8601 with an offset`},
		{"kind outside the set", "card: a\n        kind: rebuild\n        start: 2026-10-06T15:21-03:00\n        end: 2026-10-06T15:38-03:00\n        result: n/a",
			`round 1 kind "rebuild" is not build, review, ui-review or take`},
		{"result outside the set", "card: a\n        kind: review\n        start: 2026-10-06T15:21-03:00\n        end: 2026-10-06T15:38-03:00\n        result: maybe",
			`round 1 result "maybe" is not pass, fail or n/a`},
		{"card the wave does not list", "card: z\n        kind: build\n        start: 2026-10-06T15:21-03:00\n        end: 2026-10-06T15:38-03:00\n        result: n/a",
			`round 1 names card "z", which the wave does not list`},
		{"end before start", "card: a\n        kind: build\n        start: 2026-10-06T15:38-03:00\n        end: 2026-10-06T15:21-03:00\n        result: n/a",
			`round 1 ends 2026-10-06T15:21-03:00 before it starts 2026-10-06T15:38-03:00`},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			root := t.TempDir()
			writeFiles(t, root, map[string]string{"runs/2026-10-06-bad.md": "---\nwaves:\n  - wave: 1\n    supervisor: sup1\n    task: t\n    cards: [a]\n    launched: 2026-10-06T15:21-03:00\n    merged:\n    rounds:\n      - " + c.round + "\n---\n"})
			waves, probs := readRuns(root, nil)
			if len(probs) != 1 || !strings.HasSuffix(probs[0].Msg, c.want) || !strings.HasSuffix(probs[0].Path, "2026-10-06-bad.md") {
				t.Fatalf("problems=%+v, want one ending %q", probs, c.want)
			}
			if len(waves) != 1 || waves[0].Dot || len(waves[0].Rounds) != 1 {
				t.Errorf("record not kept: %+v", waves)
			}
		})
	}
	t.Run("wave time without offset", func(t *testing.T) {
		root := t.TempDir()
		writeFiles(t, root, map[string]string{"runs/2026-10-06-bad.md": "---\nwaves:\n  - wave: 3\n    cards: [a]\n    launched: 6 Oct 15:21\n---\n"})
		waves, probs := readRuns(root, nil)
		if len(probs) != 1 || probs[0].Msg != `wave 3 launched "6 Oct 15:21" is not ISO 8601 with an offset` || len(waves) != 1 {
			t.Errorf("waves=%+v problems=%+v", waves, probs)
		}
	})
	t.Run("unparseable yaml", func(t *testing.T) {
		root := t.TempDir()
		writeFiles(t, root, map[string]string{
			"runs/2026-10-05-broken.md": "---\nwaves:\n  - wave: [\n---\n# Broken\n",
			"runs/2026-10-06-fine.md":   "# Fine, prose only\n",
		})
		waves, probs := readRuns(root, nil)
		if len(probs) != 1 || !strings.HasPrefix(probs[0].Msg, "run record waves: ") {
			t.Fatalf("problems=%+v", probs)
		}
		if len(waves) != 2 || !waves[0].Dot || waves[0].Date != "2026-10-05" || !waves[1].Dot {
			t.Errorf("waves=%+v", waves)
		}
	})
}
