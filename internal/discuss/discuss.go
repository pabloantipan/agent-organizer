// Package discuss is a read-only client for the discuss cell mailbox: it
// fetches the per-persona health of a project so the Agents view can show
// whether each seat is being woken. Identity is a bearer token from the
// registry file the discuss API itself writes; nothing here can post.
package discuss

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// AgentHealth is one roster row of GET /projects/{project}/health.
type AgentHealth struct {
	Agent            string `json:"agent"`
	Watcher          string `json:"watcher"` // alive | stale | never
	SecondsSinceWait int64  `json:"seconds_since_wait"`
	Undelivered      int    `json:"undelivered"`
	Deaf             bool   `json:"deaf"`
}

// Thread is one live-thread row of the same payload. The endpoint has always
// sent these next to the roster; nothing read them until cards began naming
// the thread they wait on.
type Thread struct {
	ID            string   `json:"id"`
	Subject       string   `json:"subject"`
	Status        string   `json:"status"` // open | stalled | escalated | closed
	Kind          string   `json:"kind"`   // conversation | journal
	Participants  []string `json:"participants"`
	Messages      int      `json:"messages"`
	SinceDecision int      `json:"since_decision"`
	QuietSeconds  int64    `json:"quiet_seconds"`
	AgeSeconds    int64    `json:"age_seconds"`
}

// Snapshot is one read of the health endpoint: who is reachable, and what is
// still being talked about.
type Snapshot struct {
	Agents  map[string]AgentHealth
	Threads []Thread
}

// Thread returns the live thread with this id, if the cell still has it. A
// closed thread is absent from the payload, which reads the same as a card
// naming an id that never existed — both mean "nothing to wait for".
func (s Snapshot) Thread(id string) (Thread, bool) {
	for _, t := range s.Threads {
		if t.ID == id {
			return t, true
		}
	}
	return Thread{}, false
}

// DefaultStateDir is where discuss keeps its socket and token registry.
func DefaultStateDir() string {
	if d := os.Getenv("DISCUSS_STATE_DIR"); d != "" {
		return d
	}
	home, _ := os.UserHomeDir()
	return filepath.Join(home, ".local", "state", "discuss")
}

// Available reports whether the API answers. The mailbox listens on
// localhost TCP since 2026-09-05 (127.0.0.1:9494 unless DISCUSS_BIND says
// otherwise); a unix: bind is still honoured by checking the socket file.
func Available(stateDir string) bool {
	bind := bindFor(stateDir)
	if path, ok := strings.CutPrefix(bind, "unix:"); ok {
		st, err := os.Stat(path)
		return err == nil && st.Mode()&os.ModeSocket != 0
	}
	client := &http.Client{Timeout: 300 * time.Millisecond}
	res, err := client.Get("http://" + bind + "/healthz")
	if err != nil {
		return false
	}
	res.Body.Close()
	return res.StatusCode == http.StatusOK
}

// bindFor is DISCUSS_BIND, else the mailbox's own default.
func bindFor(stateDir string) string {
	if b := os.Getenv("DISCUSS_BIND"); b != "" {
		return b
	}
	return "127.0.0.1:9494"
}

type tokenFile struct {
	Tokens map[string]struct {
		Project string `json:"project"`
		Agent   string `json:"agent"`
	} `json:"tokens"`
}

// Token returns the bearer token of one identity from tokens.json. The file
// is 0600 and owned by the same user; the token never leaves this process.
func Token(stateDir, project, agent string) (string, error) {
	b, err := os.ReadFile(filepath.Join(stateDir, "tokens.json"))
	if err != nil {
		return "", err
	}
	var tf tokenFile
	if err := json.Unmarshal(b, &tf); err != nil {
		return "", fmt.Errorf("tokens.json: %w", err)
	}
	for tok, id := range tf.Tokens {
		if id.Project == project && id.Agent == agent {
			return tok, nil
		}
	}
	return "", fmt.Errorf("no discuss token for %s/%s", project, agent)
}

// Health fetches one snapshot of a project as the given identity.
func Health(ctx context.Context, stateDir, project, agent string) (Snapshot, error) {
	token, err := Token(stateDir, project, agent)
	if err != nil {
		return Snapshot{}, err
	}
	bind := bindFor(stateDir)
	client, base := newClient(bind)
	return fetchHealth(ctx, client, base, project, token)
}

func newClient(bind string) (*http.Client, string) {
	if path, ok := strings.CutPrefix(bind, "unix:"); ok {
		return &http.Client{Transport: &http.Transport{
			DialContext: func(ctx context.Context, _, _ string) (net.Conn, error) {
				return (&net.Dialer{}).DialContext(ctx, "unix", path)
			},
		}}, "http://discuss"
	}
	return &http.Client{}, "http://" + bind
}

func fetchHealth(ctx context.Context, client *http.Client, base, project, token string) (Snapshot, error) {
	ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
	defer cancel()
	req, err := http.NewRequestWithContext(ctx, "GET", base+"/projects/"+project+"/health", nil)
	if err != nil {
		return Snapshot{}, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	res, err := client.Do(req)
	if err != nil {
		return Snapshot{}, err
	}
	defer res.Body.Close()
	if res.StatusCode != http.StatusOK {
		return Snapshot{}, fmt.Errorf("discuss health: HTTP %d", res.StatusCode)
	}
	var doc struct {
		Agents  []AgentHealth `json:"agents"`
		Threads []Thread      `json:"threads"`
	}
	if err := json.NewDecoder(res.Body).Decode(&doc); err != nil {
		return Snapshot{}, fmt.Errorf("discuss health: %w", err)
	}
	if doc.Agents == nil {
		return Snapshot{}, errors.New("discuss health: no agents field")
	}
	snap := Snapshot{Agents: make(map[string]AgentHealth, len(doc.Agents)), Threads: doc.Threads}
	for _, a := range doc.Agents {
		snap.Agents[a.Agent] = a
	}
	return snap, nil
}
