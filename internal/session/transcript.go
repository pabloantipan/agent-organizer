package session

import (
	"bufio"
	"encoding/json"
	"errors"
	"io"
	"os"
	"time"
)

// The statusline is a sample, taken when Claude Code draws it; the transcript
// is the session's own log, written whether or not anything is drawn. Its
// last assistant message carries the context as of the last response, and the
// `cost-state` line Claude Code writes as the session closes carries the bill.
// The last sample lags that bill by the last turn (lf18-statusline, S1), so a
// run's final line reads the transcript when it can.

// Tail is what the transcript says about the end of a session.
type Tail struct {
	// At is the last assistant message's time; zero when there is none.
	At time.Time
	// InputTokens is that message's context: input plus cache read and
	// cache creation, the same sum the statusline calls total input.
	InputTokens int
	// CostUSD is the last cost-state's total; HasCost says one was found.
	CostUSD float64
	HasCost bool
}

// transcriptLine is the subset of a transcript line this reads.
type transcriptLine struct {
	Type         string    `json:"type"`
	Timestamp    time.Time `json:"timestamp"`
	IsSidechain  bool      `json:"isSidechain"`
	TotalCostUSD *float64  `json:"totalCostUSD"`
	Message      *struct {
		Usage *struct {
			InputTokens              int `json:"input_tokens"`
			CacheCreationInputTokens int `json:"cache_creation_input_tokens"`
			CacheReadInputTokens     int `json:"cache_read_input_tokens"`
		} `json:"usage"`
	} `json:"message"`
}

// ReadTail reads a transcript to its end. ok is false when the file is
// missing or carries neither a usage nor a cost: then the statusline's
// sample is all there is. A line that does not parse is skipped.
func ReadTail(path string) (Tail, bool) {
	if path == "" {
		return Tail{}, false
	}
	f, err := os.Open(path)
	if err != nil {
		return Tail{}, false
	}
	defer f.Close()
	var t Tail
	r := bufio.NewReader(f)
	for {
		b, err := r.ReadBytes('\n')
		if len(b) > 0 {
			var l transcriptLine
			if json.Unmarshal(b, &l) == nil {
				switch {
				case l.Type == "cost-state" && l.TotalCostUSD != nil:
					t.CostUSD, t.HasCost = *l.TotalCostUSD, true
				case l.Type == "assistant" && !l.IsSidechain && l.Message != nil && l.Message.Usage != nil:
					u := l.Message.Usage
					t.At = l.Timestamp
					t.InputTokens = u.InputTokens + u.CacheCreationInputTokens + u.CacheReadInputTokens
				}
			}
		}
		if err != nil {
			if !errors.Is(err, io.EOF) {
				return Tail{}, false
			}
			break
		}
	}
	return t, !t.At.IsZero() || t.HasCost
}

// withTail folds a transcript's tail into a run's final values: the last
// response's context, the closing bill when it is higher than the last
// sample's, and the last response's time when it is later. Reports whether
// anything came from the transcript.
func withTail(run Run, t Tail) (Run, bool) {
	used := false
	if !t.At.IsZero() && t.InputTokens > 0 {
		run.InputTokens = t.InputTokens
		if run.WindowSize > 0 {
			run.UsedPercent = 100 * float64(t.InputTokens) / float64(run.WindowSize)
		}
		if t.At.After(run.LastSeen) {
			run.LastSeen = t.At.In(run.LastSeen.Location()) // one zone per line
		}
		used = true
	}
	if t.HasCost && t.CostUSD > run.CostUSD {
		run.CostUSD = t.CostUSD
		used = true
	}
	return run, used
}
