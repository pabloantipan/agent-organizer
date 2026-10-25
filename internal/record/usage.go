package record

import (
	"context"
	"fmt"
)

// MaxUsageRows is the most rows one POST /v1/usage may carry (hestia
// docs/specs/usage-rows.md, Contract; 501 is a 413).
const MaxUsageRows = 500

// UsageKinds are the four token kinds of a row and of each of its models.
type UsageKinds struct {
	Input      int64 `json:"input"`
	Output     int64 `json:"output"`
	CacheRead  int64 `json:"cache_read"`
	CacheWrite int64 `json:"cache_write"`
}

// UsageRow is one session on one local day as the record takes it, with
// exactly the contract's keys: the record refuses any other with a 400, so
// cwd, task_title, reason and cards have no field here. Task and Seat are
// nil, and so absent, on an unattributed row (usage-post FR-3).
type UsageRow struct {
	SessionID  string  `json:"session_id"`
	Day        string  `json:"day"`
	Initiative string  `json:"initiative"`
	Role       string  `json:"role"`
	Task       *string `json:"task,omitempty"`
	Seat       *string `json:"seat,omitempty"`
	UsageKinds
	Models   map[string]UsageKinds `json:"models"`
	Messages int                   `json:"messages"`
	First    string                `json:"first"` // RFC 3339
	Last     string                `json:"last"`  // RFC 3339
	Cost     *float64              `json:"cost"`
	CostFrom *string               `json:"cost_from"` // record, transcript, priced or null
}

// usageBatch is the body of POST /v1/usage.
type usageBatch struct {
	Factory string     `json:"factory"`
	Rows    []UsageRow `json:"rows"`
}

// PostUsage sends one batch of at most MaxUsageRows rows with the factory
// key. Nil means the record accepted it (a 2xx); anything else is an *Error
// with the record's message, or the transport's error.
func (c *Client) PostUsage(ctx context.Context, factoryKey, factory string, rows []UsageRow) error {
	if len(rows) > MaxUsageRows {
		return fmt.Errorf("record: %d usage rows, at most %d per post", len(rows), MaxUsageRows)
	}
	_, err := c.post(ctx, factoryKey, "/v1/usage", usageBatch{Factory: factory, Rows: rows}, nil)
	return err
}
