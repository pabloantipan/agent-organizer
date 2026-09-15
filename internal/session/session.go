// Package session is the statusline record store. Claude Code runs the
// configured statusLine command after every turn with a JSON document on
// stdin that carries the session id, the transcript path and the context
// window usage. `organizer statusline` turns that into one file per agent
// process, and the scan joins the files to the process table by pid. There is
// no daemon: the agent reports, the scan reads.
package session

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"organizer/internal/model"
)

// Record is one agent process as its statusline last described it.
type Record struct {
	PID        int    `json:"pid"`
	SessionID  string `json:"session_id"`
	Session    string `json:"session"` // AGENT_SESSION from probe, when set
	Persona    string `json:"persona"` // AGENT_NAME from the discuss launch line
	Cell       string `json:"cell"`    // PROJECT_ID from the discuss launch line
	Cwd        string `json:"cwd"`
	Transcript string `json:"transcript"`
	Model      string `json:"model"`
	// UsedPercent, InputTokens and WindowSize describe the context window
	// after the last API response; zero before the first one.
	UsedPercent float64   `json:"used_percent"`
	InputTokens int       `json:"input_tokens"`
	WindowSize  int       `json:"window_size"`
	CostUSD     float64   `json:"cost_usd"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Status converts a record to the shape the UI reads.
func (r Record) Status() *model.ContextStatus {
	return &model.ContextStatus{
		SessionID:   r.SessionID,
		Model:       r.Model,
		UsedPercent: r.UsedPercent,
		InputTokens: r.InputTokens,
		WindowSize:  r.WindowSize,
		CostUSD:     r.CostUSD,
		Transcript:  r.Transcript,
		UpdatedAt:   r.UpdatedAt,
	}
}

// Dir is where records live: $XDG_DATA_HOME/organizer/sessions or
// ~/.local/share/organizer/sessions, beside the cache and the prompts.
func Dir() string {
	base := os.Getenv("XDG_DATA_HOME")
	if base == "" {
		home, _ := os.UserHomeDir()
		base = filepath.Join(home, ".local", "share")
	}
	return filepath.Join(base, "organizer", "sessions")
}

// statusInput is the subset of the statusline JSON that matters here. The
// field names are Claude Code's; see docs/en/statusline.
type statusInput struct {
	SessionID      string `json:"session_id"`
	TranscriptPath string `json:"transcript_path"`
	Cwd            string `json:"cwd"`
	Model          struct {
		ID          string `json:"id"`
		DisplayName string `json:"display_name"`
	} `json:"model"`
	ContextWindow struct {
		TotalInputTokens  int      `json:"total_input_tokens"`
		ContextWindowSize int      `json:"context_window_size"`
		UsedPercentage    *float64 `json:"used_percentage"`
	} `json:"context_window"`
	Cost struct {
		TotalCostUSD float64 `json:"total_cost_usd"`
	} `json:"cost"`
}

// Parse reads the statusline JSON and the identity environment into a record.
// env is looked up through getenv so tests can inject one.
func Parse(raw []byte, getenv func(string) string, now time.Time) (Record, error) {
	var in statusInput
	if err := json.Unmarshal(raw, &in); err != nil {
		return Record{}, fmt.Errorf("statusline json: %w", err)
	}
	if in.SessionID == "" {
		return Record{}, errors.New("statusline json has no session_id")
	}
	r := Record{
		SessionID:   in.SessionID,
		Session:     getenv("AGENT_SESSION"),
		Persona:     getenv("AGENT_NAME"),
		Cell:        getenv("PROJECT_ID"),
		Cwd:         in.Cwd,
		Transcript:  in.TranscriptPath,
		Model:       in.Model.DisplayName,
		InputTokens: in.ContextWindow.TotalInputTokens,
		WindowSize:  in.ContextWindow.ContextWindowSize,
		CostUSD:     in.Cost.TotalCostUSD,
		UpdatedAt:   now,
	}
	if r.Model == "" {
		r.Model = in.Model.ID
	}
	switch {
	case in.ContextWindow.UsedPercentage != nil:
		r.UsedPercent = *in.ContextWindow.UsedPercentage
	case r.WindowSize > 0:
		r.UsedPercent = 100 * float64(r.InputTokens) / float64(r.WindowSize)
	}
	return r, nil
}

// AgentPID finds the agent process this statusline command runs under. The
// command is a child of the agent, possibly through a shell, so walk the
// parent chain until the command basename matches the agent binary. Falls
// back to the direct parent when nothing matches within a few hops.
func AgentPID(start int, agentBinary string) int {
	if agentBinary == "" {
		agentBinary = "claude"
	}
	pid := start
	for hop := 0; hop < 6 && pid > 1; hop++ {
		out, err := exec.Command("ps", "-o", "ppid=,command=", "-p", strconv.Itoa(pid)).Output()
		if err != nil {
			break
		}
		f := strings.Fields(string(out))
		if len(f) < 2 {
			break
		}
		if filepath.Base(f[1]) == agentBinary {
			return pid
		}
		ppid, err := strconv.Atoi(f[0])
		if err != nil {
			break
		}
		pid = ppid
	}
	return start
}

// Write stores the record as <pid>.json, atomically.
func Write(dir string, r Record) error {
	if r.PID <= 0 {
		return errors.New("record has no pid")
	}
	if err := os.MkdirAll(dir, 0o700); err != nil {
		return err
	}
	b, err := json.Marshal(r)
	if err != nil {
		return err
	}
	final := filepath.Join(dir, strconv.Itoa(r.PID)+".json")
	tmp := final + ".tmp"
	if err := os.WriteFile(tmp, b, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, final)
}

// Load reads every record, keyed by pid. A missing directory is empty, not
// an error; an unreadable file is skipped.
func Load(dir string) map[int]Record {
	out := map[int]Record{}
	entries, err := os.ReadDir(dir)
	if err != nil {
		return out
	}
	for _, e := range entries {
		if e.IsDir() || !strings.HasSuffix(e.Name(), ".json") {
			continue
		}
		b, err := os.ReadFile(filepath.Join(dir, e.Name()))
		if err != nil {
			continue
		}
		var r Record
		if json.Unmarshal(b, &r) != nil || r.PID <= 0 {
			continue
		}
		out[r.PID] = r
	}
	return out
}

// Prune deletes records whose pid is no longer an agent process. A record
// younger than grace is kept: it may belong to a process the caller sampled
// just before it appeared.
func Prune(dir string, alive map[int]bool, grace time.Duration, now time.Time) int {
	n := 0
	for pid, r := range Load(dir) {
		if alive[pid] || now.Sub(r.UpdatedAt) < grace {
			continue
		}
		if os.Remove(filepath.Join(dir, strconv.Itoa(pid)+".json")) == nil {
			n++
		}
	}
	return n
}

// Line is the text the statusline shows: model, context fill, persona and
// session when known. One line, no colour, so it reads the same everywhere.
func Line(r Record) string {
	var parts []string
	if r.Model != "" {
		parts = append(parts, r.Model)
	}
	if r.WindowSize > 0 {
		parts = append(parts, fmt.Sprintf("%s %d%% · %s/%s", bar(r.UsedPercent), int(r.UsedPercent+0.5), kilo(r.InputTokens), kilo(r.WindowSize)))
	} else {
		parts = append(parts, "context: no response yet")
	}
	if r.Persona != "" {
		if r.Cell != "" {
			parts = append(parts, r.Cell+"/"+r.Persona)
		} else {
			parts = append(parts, r.Persona)
		}
	}
	if r.Session != "" {
		parts = append(parts, r.Session)
	}
	return strings.Join(parts, "  ")
}

func bar(pct float64) string {
	filled := int(pct/10 + 0.5)
	if filled > 10 {
		filled = 10
	}
	if filled < 0 {
		filled = 0
	}
	return strings.Repeat("▓", filled) + strings.Repeat("░", 10-filled)
}

func kilo(n int) string {
	if n >= 1000 {
		return fmt.Sprintf("%dk", (n+500)/1000)
	}
	return strconv.Itoa(n)
}
