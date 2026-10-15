package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"organizer/internal/config"
	"organizer/internal/record"
	"organizer/internal/session"
	"organizer/internal/usage"
)

// The usage post (docs/specs/usage-post.md): after each ledger pass the
// organizer sends the ledger lines that changed since the record last
// accepted them to <record_url>/v1/usage, off the caller's path, one post
// at a time. No retry loop and no timer: the next ledger pass is the retry.

// usagePostFile is the changed-row state, beside the ledger in the data dir.
const usagePostFile = "usage-post.json"

// usagePostTimeout bounds one pass of posts so a record that never answers
// cannot keep the next pass skipping forever.
const usagePostTimeout = 2 * time.Minute

var (
	// usagePosting is set while a post runs; a pass that finds it set skips
	// its own (FR-6). Package-wide because the app and the CLI each hold one
	// Service and the state file is per data dir, not per Service.
	usagePosting atomic.Bool
	// usagePosts lets tests wait for the post a pass started.
	usagePosts sync.WaitGroup
)

// usagePostState is what usage-post.json holds: the hash of each
// (session_id, day) row as the record last accepted it, and the last post's
// outcome for `organizer doctor`.
type usagePostState struct {
	Accepted map[string]string `json:"accepted"`
	Last     *usagePostOutcome `json:"last,omitempty"`
}

type usagePostOutcome struct {
	At     time.Time `json:"at"`
	OK     bool      `json:"ok"`
	Rows   int       `json:"rows"`
	Reason string    `json:"reason,omitempty"`
}

// usagePostTarget is where a post goes, or why it does not go anywhere.
type usagePostTarget struct {
	url, key, factory string
}

// usagePostOff resolves the record, the key and the factory id; a non-empty
// why means no request is made (FR-5).
func usagePostOff(cfg config.Config) (usagePostTarget, string) {
	if strings.TrimSpace(cfg.RecordURL) == "" {
		return usagePostTarget{}, "no record_url"
	}
	dir := discussStateDir(cfg)
	key, err := record.ReadKey(dir)
	if err != nil {
		return usagePostTarget{}, "no factory key"
	}
	factory, err := record.Factory(dir)
	if err != nil {
		return usagePostTarget{}, "no factory id"
	}
	return usagePostTarget{url: cfg.RecordURL, key: key, factory: factory}, ""
}

// startUsagePost runs one post of the ledger's changed rows in the
// background, unless one is already running or the post is off.
func startUsagePost(cfg config.Config, dataDir, ledgerPath string, now func() time.Time) {
	t, off := usagePostOff(cfg)
	if off != "" {
		return
	}
	if !usagePosting.CompareAndSwap(false, true) {
		return
	}
	usagePosts.Add(1)
	go func() {
		defer usagePosts.Done()
		defer usagePosting.Store(false)
		ctx, cancel := context.WithTimeout(context.Background(), usagePostTimeout)
		defer cancel()
		postUsage(ctx, t, dataDir, usage.LoadLedger(ledgerPath), now)
	}()
}

// postUsage sends the rows whose hash differs from the one last accepted,
// in batches of record.MaxUsageRows, and records each accepted batch. The
// first batch not accepted ends the pass: its rows and the rest stay unsent
// for the next pass, and the failure is one line in organizer.log.
func postUsage(ctx context.Context, t usagePostTarget, dataDir string, lines []usage.Line, now func() time.Time) {
	path := filepath.Join(dataDir, usagePostFile)
	st := loadUsagePostState(path)

	type pending struct {
		key, hash string
		row       record.UsageRow
	}
	var todo []pending
	for _, l := range lines {
		row := usageRow(l)
		h := rowHash(row)
		k := l.SessionID + "|" + l.Day
		if st.Accepted[k] != h {
			todo = append(todo, pending{k, h, row})
		}
	}
	if len(todo) == 0 {
		return
	}

	rc := record.New(t.url)
	sent := 0
	for len(todo) > 0 {
		n := min(len(todo), record.MaxUsageRows)
		batch := make([]record.UsageRow, n)
		for i, p := range todo[:n] {
			batch[i] = p.row
		}
		if err := rc.PostUsage(ctx, t.key, t.factory, batch); err != nil {
			reason := usagePostReason(err, t.key)
			st.Last = &usagePostOutcome{At: now(), Reason: reason}
			_ = saveUsagePostState(path, st)
			logUsagePost(dataDir, now(), fmt.Sprintf("usage post failed: %s (%d rows unsent)", reason, len(todo)))
			return
		}
		for _, p := range todo[:n] {
			st.Accepted[p.key] = p.hash
		}
		sent += n
		todo = todo[n:]
		st.Last = &usagePostOutcome{At: now(), OK: true, Rows: sent}
		_ = saveUsagePostState(path, st)
	}
}

// usageRow is a ledger line in the contract's shape (FR-2, FR-3): a line
// with no initiative goes as "unattributed" with no task and no seat.
func usageRow(l usage.Line) record.UsageRow {
	r := record.UsageRow{
		SessionID:  l.SessionID,
		Day:        l.Day,
		Initiative: l.Initiative,
		Role:       l.Role,
		UsageKinds: kindsOf(l.Kinds),
		Models:     map[string]record.UsageKinds{},
		Messages:   l.Messages,
		First:      l.First.Format(time.RFC3339),
		Last:       l.Last.Format(time.RFC3339),
		Cost:       l.Cost,
	}
	for m, k := range l.Models {
		r.Models[m] = kindsOf(k)
	}
	if l.CostFrom != "" {
		from := l.CostFrom
		r.CostFrom = &from
	}
	if r.Initiative == "" {
		r.Initiative = "unattributed"
		return r
	}
	task, seat := l.Task, l.Name
	r.Task, r.Seat = &task, &seat
	return r
}

func kindsOf(k usage.Kinds) record.UsageKinds {
	return record.UsageKinds{Input: k.Input, Output: k.Output, CacheRead: k.CacheRead, CacheWrite: k.CacheWrite}
}

// rowHash is the sha256 of the row as it would be sent, so a ledger field
// the contract does not carry never makes a row "changed".
func rowHash(r record.UsageRow) string {
	b, _ := json.Marshal(r)
	sum := sha256.Sum256(b)
	return hex.EncodeToString(sum[:])
}

// usagePostReason is the failure in a few words: the record's status and
// error text, or the transport's error. The key is cut out whatever the
// error says.
func usagePostReason(err error, key string) string {
	var re *record.Error
	s := err.Error()
	if errors.As(err, &re) {
		s = fmt.Sprintf("HTTP %d", re.Status)
		if re.Message != "" {
			s += ": " + re.Message
		}
	}
	s = strings.TrimPrefix(s, "record: ")
	if key != "" {
		s = strings.ReplaceAll(s, key, "<key>")
	}
	return s
}

func loadUsagePostState(path string) usagePostState {
	var st usagePostState
	if b, err := os.ReadFile(path); err == nil {
		_ = json.Unmarshal(b, &st)
	}
	if st.Accepted == nil {
		st.Accepted = map[string]string{}
	}
	return st
}

// saveUsagePostState writes the state through a temp file and a rename, so
// a crash leaves the old state, never half of one.
func saveUsagePostState(path string, st usagePostState) error {
	b, err := json.Marshal(st)
	if err != nil {
		return err
	}
	if err := os.MkdirAll(filepath.Dir(path), 0o700); err != nil {
		return err
	}
	tmp := path + ".tmp"
	if err := os.WriteFile(tmp, b, 0o600); err != nil {
		return err
	}
	return os.Rename(tmp, path)
}

// logUsagePost appends one line to organizer.log in the data dir, the file
// the app's logger writes.
func logUsagePost(dataDir string, at time.Time, msg string) {
	f, err := os.OpenFile(filepath.Join(dataDir, "organizer.log"), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0o644)
	if err != nil {
		return
	}
	defer f.Close()
	fmt.Fprintf(f, "%s ERR | %s\n", at.Format(time.RFC3339), msg)
}

// UsagePostStatus is `organizer doctor`'s line after "usage post: " (FR-5):
// "off: <why>" when no request would be made, else the last post's outcome,
// "ok <time>, <n> rows" or "failed <time>: <reason>".
func UsagePostStatus(cfg config.Config) string {
	dataDir := filepath.Dir(session.Dir())
	if _, off := usagePostOff(cfg); off != "" {
		return "off: " + off
	}
	st := loadUsagePostState(filepath.Join(dataDir, usagePostFile))
	switch {
	case st.Last == nil:
		return "nothing posted yet"
	case st.Last.OK:
		return fmt.Sprintf("ok %s, %d rows", st.Last.At.Format(time.RFC3339), st.Last.Rows)
	default:
		return fmt.Sprintf("failed %s: %s", st.Last.At.Format(time.RFC3339), st.Last.Reason)
	}
}

// WaitUsagePost blocks until the post a ledger pass started has finished,
// for a caller that exits right after the pass (the CLI's `organizer usage`
// prints first, then waits).
func WaitUsagePost() { usagePosts.Wait() }
