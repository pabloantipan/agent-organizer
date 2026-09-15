package discuss

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"time"
)

// Client reads and writes one project's mailbox as one identity. The token is
// resolved once from the registry; every request carries it. Writes are the
// human's: the organizer posts as the cell's human seat and never as a persona.
type Client struct {
	http    *http.Client
	base    string
	project string
	Agent   string
	token   string
}

// Connect resolves the identity's token and returns a client for the project.
func Connect(stateDir, project, agent string) (*Client, error) {
	token, err := Token(stateDir, project, agent)
	if err != nil {
		return nil, err
	}
	hc, base := newClient(bindFor(stateDir))
	hc.Timeout = 5 * time.Second
	return &Client{http: hc, base: base, project: project, Agent: agent, token: token}, nil
}

// Message is one row of a thread, in the API's wire shape.
type Message struct {
	ID        string `json:"id"`
	ThreadID  string `json:"thread_id"`
	ParentID  string `json:"parent_id"`
	From      string `json:"from"`
	To        string `json:"to"`
	Kind      string `json:"kind"`
	Subject   string `json:"subject"`
	Body      string `json:"body"`
	CreatedAt int64  `json:"created_at"` // unix millis
}

// ThreadDetail is GET /threads/{id}: the head and every message.
type ThreadDetail struct {
	ID            string    `json:"id"`
	Subject       string    `json:"subject"`
	Status        string    `json:"status"`
	SinceDecision int       `json:"since_decision"`
	Messages      []Message `json:"messages"`
}

// ThreadHead is one row of GET /threads?status=: what the archive lists.
type ThreadHead struct {
	ID            string `json:"ID"`
	Subject       string `json:"Subject"`
	Status        string `json:"Status"`
	SinceDecision int    `json:"SinceDecision"`
	CreatedAt     int64  `json:"CreatedAt"`
}

// PostRequest is what a human writes. From and project come from the token.
type PostRequest struct {
	To       string `json:"to,omitempty"`
	ThreadID string `json:"thread_id,omitempty"`
	ParentID string `json:"parent_id,omitempty"`
	Kind     string `json:"kind"`
	Subject  string `json:"subject,omitempty"`
	Body     string `json:"body"`
}

// PostResult is the API's answer to a post.
type PostResult struct {
	ID        string `json:"id"`
	ThreadID  string `json:"thread_id"`
	CreatedAt int64  `json:"created_at"`
	Stalled   bool   `json:"stalled"`
}

// SearchFilter narrows a search; every field is optional.
type SearchFilter struct {
	From, To, Kind, Thread string
	Limit                  int
}

func (c *Client) do(ctx context.Context, method, path string, body, out any) error {
	var rd io.Reader
	if body != nil {
		raw, err := json.Marshal(body)
		if err != nil {
			return err
		}
		rd = bytes.NewReader(raw)
	}
	req, err := http.NewRequestWithContext(ctx, method, c.base+path, rd)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+c.token)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	res, err := c.http.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode >= 300 {
		// The server's own sentence matters: a 409 says the subject is frozen
		// and the right next move differs from any other failure.
		var detail struct {
			Error string `json:"error"`
		}
		_ = json.NewDecoder(res.Body).Decode(&detail)
		if detail.Error != "" {
			return fmt.Errorf("discuss: %s", detail.Error)
		}
		return fmt.Errorf("discuss: HTTP %d on %s %s", res.StatusCode, method, path)
	}
	if out == nil {
		return nil
	}
	return json.NewDecoder(res.Body).Decode(out)
}

func (c *Client) projectPath(rest string) string {
	return "/projects/" + url.PathEscape(c.project) + rest
}

// Thread fetches one thread with its messages.
func (c *Client) Thread(ctx context.Context, id string) (ThreadDetail, error) {
	var t ThreadDetail
	err := c.do(ctx, "GET", c.projectPath("/threads/"+url.PathEscape(id)), nil, &t)
	return t, err
}

// Post writes one message; an empty ThreadID opens a thread.
func (c *Client) Post(ctx context.Context, req PostRequest) (PostResult, error) {
	var res PostResult
	err := c.do(ctx, "POST", c.projectPath("/messages"), req, &res)
	return res, err
}

// SetStatus sets open, escalated or closed. Stalled is the server's alone.
func (c *Client) SetStatus(ctx context.Context, id, status string) error {
	return c.do(ctx, "POST", c.projectPath("/threads/"+url.PathEscape(id)+"/status"), map[string]string{"status": status}, nil)
}

// ThreadsByStatus lists thread heads in one status, oldest first. The API
// lists one status per call; closed is how the archive is reached.
func (c *Client) ThreadsByStatus(ctx context.Context, status string) ([]ThreadHead, error) {
	var doc struct {
		Threads []ThreadHead `json:"threads"`
	}
	err := c.do(ctx, "GET", c.projectPath("/threads?status="+url.QueryEscape(status)), nil, &doc)
	return doc.Threads, err
}

// Search finds messages whose subject or body contains q, newest first.
func (c *Client) Search(ctx context.Context, q string, f SearchFilter) ([]Message, error) {
	v := url.Values{}
	v.Set("q", q)
	for k, val := range map[string]string{"from": f.From, "to": f.To, "kind": f.Kind, "thread": f.Thread} {
		if val != "" {
			v.Set(k, val)
		}
	}
	if f.Limit > 0 {
		v.Set("limit", fmt.Sprint(f.Limit))
	}
	var doc struct {
		Messages []Message `json:"messages"`
	}
	err := c.do(ctx, "GET", c.projectPath("/search?"+v.Encode()), nil, &doc)
	return doc.Messages, err
}

// Health fetches the roster and live threads through this client.
func (c *Client) Health(ctx context.Context) (Snapshot, error) {
	return fetchHealth(ctx, c.http, c.base, c.project, c.token)
}

// SubjectSlug is the card slug a subject names by convention: "<slug>: ..."
// or "<slug> — ...". Empty when the subject has no such prefix.
func SubjectSlug(subject string) string {
	s := strings.TrimSpace(subject)
	for _, sep := range []string{": ", " — ", " - "} {
		if i := strings.Index(s, sep); i > 0 {
			head := s[:i]
			if isSlug(head) {
				return head
			}
		}
	}
	return ""
}

func isSlug(s string) bool {
	if s == "" || len(s) > 60 {
		return false
	}
	for _, r := range s {
		if !(r >= 'a' && r <= 'z' || r >= '0' && r <= '9' || r == '-') {
			return false
		}
	}
	return true
}

// PickUp marks everything addressed to this identity as delivered: the
// human read the mailbox. No session id on purpose: the drain ceiling
// exists to end a hook loop, and a person reading a screen has no loop.
// Returns how many messages were picked up.
func (c *Client) PickUp(ctx context.Context) (int, error) {
	var res struct {
		Delivered []string `json:"delivered_ids"`
	}
	err := c.do(ctx, "POST", c.projectPath("/agents/"+url.PathEscape(c.Agent)+"/drain"), map[string]any{"session_id": "", "stop_hook_active": false}, &res)
	return len(res.Delivered), err
}
