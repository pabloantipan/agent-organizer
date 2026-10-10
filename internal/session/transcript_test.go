package session

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestReadTail(t *testing.T) {
	tail, ok := ReadTail(filepath.Join("testdata", "transcript-later-usage.jsonl"))
	if !ok {
		t.Fatal("no tail read")
	}
	want := time.Date(2026, 10, 10, 16, 35, 36, 817000000, time.UTC)
	if !tail.At.Equal(want) {
		t.Errorf("at = %v, want %v (the last main-chain message, not the sidechain's)", tail.At, want)
	}
	if tail.InputTokens != 85348 {
		t.Errorf("input tokens = %d, want 85348", tail.InputTokens)
	}
	if !tail.HasCost || tail.CostUSD != 1.0598626000000004 {
		t.Errorf("cost = %v %v, want the cost-state's 1.0598626", tail.HasCost, tail.CostUSD)
	}
	for _, p := range []string{"", filepath.Join("testdata", "missing.jsonl"), filepath.Join("testdata", "transcript-no-usage.jsonl")} {
		if _, ok := ReadTail(p); ok {
			t.Errorf("ReadTail(%q) ok, want no tail", p)
		}
	}
}

// S2 (leftovers-18, FR-10): a session sampled once by the statusline ends
// with the transcript's last context and cost on its final line; without a
// usable transcript the line says it holds one sample.
func TestRetireFinalLineReadsTheTranscript(t *testing.T) {
	t0 := time.Date(2026, 10, 10, 16, 32, 50, 0, time.UTC)
	one := Record{PID: 74891, SessionID: "s-one", Session: "organizer-probe-fo-review",
		Cwd: "/tmp/elsewhere", Model: "Opus 5.5", UsedPercent: 5, InputTokens: 50003,
		WindowSize: 1000000, CostUSD: 0.2459, UpdatedAt: t0, Samples: 1}
	later, _ := filepath.Abs(filepath.Join("testdata", "transcript-later-usage.jsonl"))
	noUsage, _ := filepath.Abs(filepath.Join("testdata", "transcript-no-usage.jsonl"))

	cases := []struct {
		name       string
		transcript string
		check      func(t *testing.T, r Run, line string)
	}{
		{"transcript with later usage", later, func(t *testing.T, r Run, line string) {
			if !r.FromTranscript || r.InputTokens != 85348 || r.CostUSD != 1.0598626000000004 {
				t.Errorf("final = %+v, want the transcript's 85348 tokens and 1.0598626", r)
			}
			if int(r.UsedPercent+0.5) != 9 {
				t.Errorf("used = %v, want 85348 of 1M, about 9 %%", r.UsedPercent)
			}
			if want := time.Date(2026, 10, 10, 16, 35, 36, 817000000, time.UTC); !r.LastSeen.Equal(want) {
				t.Errorf("last seen = %v, want the last response %v", r.LastSeen, want)
			}
			if r.Wall() == 0 {
				t.Error("wall is zero: a once-sampled run that went on should have a span")
			}
		}},
		{"transcript without usage", noUsage, func(t *testing.T, r Run, line string) {
			if r.FromTranscript || r.CostUSD != 0.2459 || r.UsedPercent != 5 {
				t.Errorf("final = %+v, want the one sample kept", r)
			}
			if !strings.Contains(line, `"samples":1`) {
				t.Errorf("final line %s does not say samples 1", line)
			}
		}},
		{"no transcript at all", "", func(t *testing.T, r Run, line string) {
			if r.FromTranscript || !strings.Contains(line, `"samples":1`) {
				t.Errorf("final line %s does not say samples 1", line)
			}
		}},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			dir := t.TempDir()
			runs := filepath.Join(t.TempDir(), "runs.jsonl")
			rec := one
			rec.Transcript = c.transcript
			writeRecord(t, dir, rec)
			// The open line, while the process lives, holds the one sample.
			if _, err := Retire(dir, runs, map[int]bool{74891: true}, 2*time.Minute, t0.Add(time.Second), nil, nil); err != nil {
				t.Fatal(err)
			}
			// The process is gone and past the grace: the final line.
			n, err := Retire(dir, runs, map[int]bool{}, 2*time.Minute, t0.Add(10*time.Minute), nil, nil)
			if err != nil || n != 1 {
				t.Fatalf("retired %d, err %v", n, err)
			}
			b, _ := os.ReadFile(runs)
			lines := bytes.Split(bytes.TrimSpace(b), []byte("\n"))
			if len(lines) != 2 {
				t.Fatalf("%d lines, want open and final", len(lines))
			}
			got := LoadRuns(runs)
			if len(got) != 1 || !got[0].Ended {
				t.Fatalf("folded = %+v", got)
			}
			c.check(t, got[0], string(lines[1]))
		})
	}
}

func TestCountedCountsSamplesPerSession(t *testing.T) {
	dir := t.TempDir()
	r := Record{PID: 9, SessionID: "a", UpdatedAt: time.Now()}
	for want := 1; want <= 3; want++ {
		r = Counted(dir, r)
		if r.Samples != want {
			t.Fatalf("samples = %d, want %d", r.Samples, want)
		}
		writeRecord(t, dir, r)
	}
	// A new session under the same pid (a /clear, a reused pid) starts over.
	r.SessionID = "b"
	if r = Counted(dir, r); r.Samples != 1 {
		t.Errorf("new session samples = %d, want 1", r.Samples)
	}
}
