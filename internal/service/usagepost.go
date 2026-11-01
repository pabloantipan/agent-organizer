package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
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

// usagePostRequest bounds one request, and WaitUsagePost waits no longer
// than it, so an unreachable record holds the CLI at most 10 s (Amendment 1).
const usagePostRequest = 10 * time.Second

var (
	// usagePosting is set while a post runs; a pass that finds it set skips
	// its own (FR-6). Package-wide because the app and the CLI each hold one
	// Service and the state file is per data dir, not per Service.
	usagePosting atomic.Bool
	// usagePosts lets tests wait for the post a pass started.
	usagePosts sync.WaitGroup
)

// usagePostState is what usage-post.json holds: the hash of each
// (session_id, day) row as the record last accepted it, each row the record
// answered in `rejected` with the hash it was rejected at and the reason
// (leftovers-54 FR-3), and the last post's outcome for `organizer doctor`.
type usagePostState struct {
	Accepted map[string]string           `json:"accepted"`
	Rejected map[string]RejectedUsageRow `json:"rejected,omitempty"`
	Last     *usagePostOutcome           `json:"last,omitempty"`
}

// RejectedUsageRow is one row the record refused inside an accepted batch:
// its key, the record's reason, when, and the hash of the row as sent. It
// is not sent again until the row's hash differs (leftovers-54 FR-3), and
// `organizer usage` and doctor list it (FR-4).
type RejectedUsageRow struct {
	SessionID string    `json:"session_id"`
	Day       string    `json:"day"`
	Reason    string    `json:"reason"`
	Hash      string    `json:"hash"`
	At        time.Time `json:"at"`
}

type usagePostOutcome struct {
	At   time.Time `json:"at"`
	OK   bool      `json:"ok"`
	Rows int       `json:"rows"`
	// RejectedRows counts the rows the record answered in `rejected` in
	// this pass; they are not in Rows.
	RejectedRows int    `json:"rejected_rows,omitempty"`
	Reason       string `json:"reason,omitempty"`
	// Refused names each batch the record refused in the pass, in order;
	// Rows counts only the accepted ones (leftovers-53 FR-6).
	Refused []usageRefusal `json:"refused,omitempty"`
}

// usageRefusal is one refused batch: its place in the pass, its size and
// the record's answer.
type usageRefusal struct {
	Batch  int    `json:"batch"`
	Of     int    `json:"of"`
	Rows   int    `json:"rows"`
	Reason string `json:"reason"`
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

// postUsage sends the rows whose hash differs from the one last accepted
// and from the one last rejected, in batches of record.MaxUsageRows, and
// records each accepted batch: the rows the record answered in `rejected`
// are kept with their reason and logged once, the others are accepted
// (leftovers-54 FR-3). A
// batch the record refuses (it answered, not 2xx) does not end the pass
// (leftovers-53 FR-6): its rows stay unsent for the next pass, the later
// batches are still posted, and each refusal is one line in organizer.log
// and one entry in the state. A batch that gets no answer at all ends the
// pass, since every later one would wait out the same timeout.
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
		if st.Accepted[k] == h {
			continue
		}
		if r, ok := st.Rejected[k]; ok && r.Hash == h {
			continue // rejected as it is; resent only once it changes
		}
		todo = append(todo, pending{k, h, row})
	}
	if len(todo) == 0 {
		return
	}

	rc := record.New(t.url)
	rc.HTTP = &http.Client{Timeout: usagePostRequest}
	batches := (len(todo) + record.MaxUsageRows - 1) / record.MaxUsageRows
	out := usagePostOutcome{OK: true}
	st.Last = &out
	for b := 1; len(todo) > 0; b++ {
		n := min(len(todo), record.MaxUsageRows)
		batch := make([]record.UsageRow, n)
		for i, p := range todo[:n] {
			batch[i] = p.row
		}
		res, err := rc.PostUsage(ctx, t.key, t.factory, batch)
		if err != nil {
			reason := usagePostReason(err, t.key)
			out.OK = false
			if out.Reason == "" {
				out.Reason = reason
			}
			var re *record.Error
			if !errors.As(err, &re) {
				// No answer: this batch and the rest stay unsent.
				out.At = now()
				_ = saveUsagePostState(path, st)
				logUsagePost(dataDir, now(), fmt.Sprintf("usage post failed: %s (%d rows unsent)", reason, len(todo)))
				return
			}
			out.Refused = append(out.Refused, usageRefusal{Batch: b, Of: batches, Rows: n, Reason: reason})
			logUsagePost(dataDir, now(), fmt.Sprintf("usage post refused batch %d of %d: %s (%d rows unsent)", b, batches, reason, n))
		} else {
			rejected := rejectedIn(res.Rejected, batch)
			for i, p := range todo[:n] {
				why, refused := rejected[i]
				if !refused {
					st.Accepted[p.key] = p.hash
					delete(st.Rejected, p.key)
					out.Rows++
					continue
				}
				why = cutKey(why, t.key)
				delete(st.Accepted, p.key)
				if st.Rejected == nil {
					st.Rejected = map[string]RejectedUsageRow{}
				}
				st.Rejected[p.key] = RejectedUsageRow{SessionID: p.row.SessionID, Day: p.row.Day, Reason: why, Hash: p.hash, At: now()}
				out.RejectedRows++
				logUsagePost(dataDir, now(), fmt.Sprintf("usage post: the record rejected %s %s: %s (kept, not resent until it changes)", p.row.SessionID, p.row.Day, why))
			}
		}
		todo = todo[n:]
		out.At = now()
		_ = saveUsagePostState(path, st)
	}
}

// rejectedIn maps the record's rejected rows to their place in the batch
// sent: by index when the row there has the same session and day, else by
// session and day, since an index that does not match its key is not to be
// trusted. A rejection that names no row of the batch is dropped, and that
// row counts as landed, as the record says every row it does not name did.
func rejectedIn(rs []record.UsageRejected, batch []record.UsageRow) map[int]string {
	out := map[int]string{}
	for _, r := range rs {
		if r.Index >= 0 && r.Index < len(batch) && batch[r.Index].SessionID == r.SessionID && batch[r.Index].Day == r.Day {
			out[r.Index] = r.Reason
			continue
		}
		for i, row := range batch {
			if row.SessionID == r.SessionID && row.Day == r.Day {
				out[i] = r.Reason
				break
			}
		}
	}
	return out
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
		First:      rfc3339OrNull(l.First),
		Last:       rfc3339OrNull(l.Last),
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

// rfc3339OrNull is a time as the contract carries it: RFC 3339, or null
// when the ledger has none (leftovers-54 FR-5; the sample's "first and last
// null").
func rfc3339OrNull(t time.Time) *string {
	if t.IsZero() {
		return nil
	}
	s := t.Format(time.RFC3339)
	return &s
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
	return cutKey(strings.TrimPrefix(s, "record: "), key)
}

// cutKey replaces the factory key wherever a record's text echoes it.
func cutKey(s, key string) string {
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
	// A fresh data dir may not exist yet: the state's save makes it, but
	// a rejection is logged before the batch's state is saved.
	_ = os.MkdirAll(dataDir, 0o700)
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
	case st.Last.OK && st.Last.RejectedRows > 0:
		return fmt.Sprintf("ok %s, %d rows, %d rejected", st.Last.At.Format(time.RFC3339), st.Last.Rows, st.Last.RejectedRows)
	case st.Last.OK:
		return fmt.Sprintf("ok %s, %d rows", st.Last.At.Format(time.RFC3339), st.Last.Rows)
	case len(st.Last.Refused) > 0:
		return fmt.Sprintf("failed %s: %d of %d batches refused, %d rows posted: %s", st.Last.At.Format(time.RFC3339),
			len(st.Last.Refused), st.Last.Refused[0].Of, st.Last.Rows, st.Last.Reason)
	default:
		return fmt.Sprintf("failed %s: %s", st.Last.At.Format(time.RFC3339), st.Last.Reason)
	}
}

// UsageRejected is every row the record rejected and has not since taken,
// from the post state in the data dir, oldest day first (leftovers-54
// FR-4): what `organizer usage` and doctor list. It reads the state whether
// or not the post is on now, since the rows stay refused either way.
func UsageRejected() []RejectedUsageRow {
	st := loadUsagePostState(filepath.Join(filepath.Dir(session.Dir()), usagePostFile))
	out := make([]RejectedUsageRow, 0, len(st.Rejected))
	for _, r := range st.Rejected {
		out = append(out, r)
	}
	sort.Slice(out, func(i, j int) bool {
		if out[i].Day != out[j].Day {
			return out[i].Day < out[j].Day
		}
		return out[i].SessionID < out[j].SessionID
	})
	return out
}

// WaitUsagePost blocks until the post a ledger pass started has finished,
// or usagePostRequest has passed, for a caller that exits right after the
// pass (the CLI's `organizer usage` prints first, then waits; Amendment 1).
func WaitUsagePost() { waitUsagePost(usagePostRequest) }

func waitUsagePost(max time.Duration) bool {
	done := make(chan struct{})
	go func() {
		usagePosts.Wait()
		close(done)
	}()
	select {
	case <-done:
		return true
	case <-time.After(max):
		return false
	}
}
