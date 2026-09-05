// Package record is the organizer's write-only client for discuss-record,
// the central service a factory pushes its cell events to. The organizer
// has two jobs there and no more: issue the factory key this laptop pushes
// with, and register each cell it brings up. It reads nothing back.
//
// Spec authority: agent-slack specs/factory-push-spec.md §7–8 and
// specs/record-spec.md §4.
package record

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Client talks to one record over HTTPS. BaseURL is the record's origin,
// without /v1.
type Client struct {
	BaseURL string
	HTTP    *http.Client
}

// New returns a client with a bounded timeout.
func New(baseURL string) *Client {
	return &Client{BaseURL: strings.TrimRight(baseURL, "/"), HTTP: &http.Client{Timeout: 20 * time.Second}}
}

// Error is a non-2xx answer, with the record's {"error": "..."} message when
// it sent one.
type Error struct {
	Status  int
	Message string
}

func (e *Error) Error() string {
	if e.Message == "" {
		return fmt.Sprintf("record: HTTP %d", e.Status)
	}
	return fmt.Sprintf("record: HTTP %d: %s", e.Status, e.Message)
}

// Cell is the registration body of POST /v1/factories/{factory}/cells. Title
// and client are what the record's views show.
type Cell struct {
	Cell       string `json:"cell"`
	Initiative string `json:"initiative"`
	Title      string `json:"title,omitempty"`
	Client     string `json:"client,omitempty"`
}

// KeyHash is how the record identifies a key without storing it: sha256 hex.
func KeyHash(key string) string {
	sum := sha256.Sum256([]byte(key))
	return hex.EncodeToString(sum[:])
}

// IssueKey asks for a new factory key as the signed-in developer. The key is
// shown once by the record and returned once here; the caller writes it to
// the key file and nowhere else.
func (c *Client) IssueKey(ctx context.Context, devToken, factory string) (string, error) {
	var out struct {
		Key     string `json:"key"`
		Factory string `json:"factory"`
	}
	status, err := c.post(ctx, devToken, "/v1/factories/keys", map[string]string{"factory": factory}, &out)
	if err != nil {
		return "", err
	}
	if status != http.StatusCreated && status != http.StatusOK {
		return "", &Error{Status: status, Message: "unexpected status for a new key"}
	}
	if out.Key == "" {
		return "", errors.New("record: answer carried no key")
	}
	return out.Key, nil
}

// RevokeKey revokes one key of the factory by its hash, as the developer.
func (c *Client) RevokeKey(ctx context.Context, devToken, factory, keyHash string) error {
	_, err := c.post(ctx, devToken, "/v1/factories/"+factory+"/keys/revoke", map[string]string{"key_hash": keyHash}, nil)
	return err
}

// RegisterCell tells the record which initiative a cell belongs to, with the
// factory key. The record upserts on (factory, cell), so registering twice
// is fine; a 409 is read the same way, as already registered.
func (c *Client) RegisterCell(ctx context.Context, factoryKey, factory string, cell Cell) error {
	_, err := c.post(ctx, factoryKey, "/v1/factories/"+factory+"/cells", cell, nil)
	var re *Error
	if errors.As(err, &re) && re.Status == http.StatusConflict {
		return nil
	}
	return err
}

// post sends JSON with a bearer token and decodes a 2xx body into out when
// given. Anything else is an *Error carrying the record's message.
func (c *Client) post(ctx context.Context, bearer, path string, body, out any) (int, error) {
	b, err := json.Marshal(body)
	if err != nil {
		return 0, err
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.BaseURL+path, bytes.NewReader(b))
	if err != nil {
		return 0, err
	}
	req.Header.Set("Authorization", "Bearer "+bearer)
	req.Header.Set("Content-Type", "application/json")
	hc := c.HTTP
	if hc == nil {
		hc = http.DefaultClient
	}
	resp, err := hc.Do(req)
	if err != nil {
		return 0, fmt.Errorf("record: %w", err)
	}
	defer resp.Body.Close()
	raw, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode < 200 || resp.StatusCode > 299 {
		var e struct {
			Error string `json:"error"`
		}
		_ = json.Unmarshal(raw, &e)
		return resp.StatusCode, &Error{Status: resp.StatusCode, Message: e.Error}
	}
	if out != nil && len(raw) > 0 {
		if err := json.Unmarshal(raw, out); err != nil {
			return resp.StatusCode, fmt.Errorf("record: decode: %w", err)
		}
	}
	return resp.StatusCode, nil
}
