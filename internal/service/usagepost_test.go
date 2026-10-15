package service

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strings"
	"sync"
	"testing"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/record"
	"organizer/internal/usage"
)

// The usage post's gate (docs/specs/usage-post.md, U1 to U7). Every request
// goes to an httptest record; every path is a temp dir; the key is a test
// key.

const testKey = "fk_test_usage_post_key_9f2c"

var postNow = time.Date(2026, 10, 6, 9, 0, 0, 0, time.Local)

// usageRecord is an httptest record of POST /v1/usage that keeps every
// request and answers with the next status in its script (200 once the
// script runs out).
type usageRecord struct {
	mu       sync.Mutex
	srv      *httptest.Server
	statuses []int
	hold     time.Duration
	posts    []fakePost
}

type fakePost struct {
	path, auth string
	body       map[string]any
	rows       []map[string]any
}

func newUsageRecord(t *testing.T, statuses ...int) *usageRecord {
	f := &usageRecord{statuses: statuses}
	f.srv = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		var body map[string]any
		_ = json.Unmarshal(raw, &body)
		p := fakePost{path: r.URL.Path, auth: r.Header.Get("Authorization"), body: body}
		if rows, ok := body["rows"].([]any); ok {
			for _, x := range rows {
				p.rows = append(p.rows, x.(map[string]any))
			}
		}
		f.mu.Lock()
		f.posts = append(f.posts, p)
		status := http.StatusOK
		if len(f.statuses) > 0 {
			status, f.statuses = f.statuses[0], f.statuses[1:]
		}
		hold := f.hold
		f.mu.Unlock()
		if hold > 0 {
			select {
			case <-time.After(hold):
			case <-r.Context().Done():
			}
		}
		w.WriteHeader(status)
		if status >= 300 {
			// A record that echoes the bearer back proves the log cuts it.
			fmt.Fprintf(w, `{"error":"store down (saw %s)"}`, p.auth)
			return
		}
		fmt.Fprintf(w, `{"upserted":%d,"unchanged":0}`, len(p.rows))
	}))
	t.Cleanup(f.srv.Close)
	return f
}

func (f *usageRecord) got() []fakePost {
	f.mu.Lock()
	defer f.mu.Unlock()
	return append([]fakePost(nil), f.posts...)
}

// stateDir is a discuss state dir with a test key and factory id.
func usageStateDir(t *testing.T, withKey bool) string {
	dir := t.TempDir()
	if withKey {
		if err := record.WriteKey(dir, testKey); err != nil {
			t.Fatal(err)
		}
	}
	if err := record.WriteFactory(dir, "testfactory"); err != nil {
		t.Fatal(err)
	}
	return dir
}

func usageTarget(f *usageRecord) usagePostTarget {
	return usagePostTarget{url: f.srv.URL, key: testKey, factory: "testfactory"}
}

func fixedNow() time.Time { return postNow }

func usageLine(i int) usage.Line {
	cost := 0.25
	return usage.Line{
		SessionID: fmt.Sprintf("s-%04d", i),
		Day:       "2026-10-05",
		Attribution: usage.Attribution{
			Name: "organizer-probe-up-build", Cwd: "/secret/cwd", Initiative: "organizer",
			Role: "builder", Task: "usage-post", TaskTitle: "a title", Cards: []string{"a", "b"}, Reason: "why",
		},
		Kinds:    usage.Kinds{Input: 10, Output: 20, CacheRead: 30, CacheWrite: 40},
		Models:   map[string]usage.Kinds{"claude-opus-5-5": {Input: 10, Output: 20, CacheRead: 30, CacheWrite: 40}},
		Messages: 3,
		First:    time.Date(2026, 10, 5, 10, 0, 0, 0, time.UTC),
		Last:     time.Date(2026, 10, 5, 11, 0, 0, 0, time.UTC),
		Cost:     &cost,
		CostFrom: "record",
	}
}

func usageLines(n int) []usage.Line {
	out := make([]usage.Line, n)
	for i := range out {
		out[i] = usageLine(i)
	}
	return out
}

func keysOf(m map[string]any) []string {
	var ks []string
	for k := range m {
		ks = append(ks, k)
	}
	sort.Strings(ks)
	return ks
}

var contractKeys = []string{"cache_read", "cache_write", "cost", "cost_from", "day", "first", "initiative", "input", "last", "messages", "models", "output", "role", "seat", "session_id", "task"}

// U1: one pass over three lines is one POST to /v1/usage, Bearer the test
// key, factory the test id, three rows with exactly the contract's keys.
func TestU1PostsThreeRowsWithContractKeys(t *testing.T) {
	f := newUsageRecord(t)
	postUsage(context.Background(), usageTarget(f), t.TempDir(), usageLines(3), fixedNow)

	posts := f.got()
	if len(posts) != 1 {
		t.Fatalf("posts = %d, want 1", len(posts))
	}
	p := posts[0]
	if p.path != "/v1/usage" || p.auth != "Bearer "+testKey {
		t.Errorf("path %q auth %q", p.path, p.auth)
	}
	if p.body["factory"] != "testfactory" || !reflect.DeepEqual(keysOf(p.body), []string{"factory", "rows"}) {
		t.Errorf("body keys %v factory %v", keysOf(p.body), p.body["factory"])
	}
	if len(p.rows) != 3 {
		t.Fatalf("rows = %d, want 3", len(p.rows))
	}
	for _, r := range p.rows {
		if got := keysOf(r); !reflect.DeepEqual(got, contractKeys) {
			t.Errorf("row keys %v, want %v", got, contractKeys)
		}
		if r["seat"] != "organizer-probe-up-build" || r["task"] != "usage-post" || r["first"] != "2026-10-05T10:00:00Z" || r["cost_from"] != "record" || r["cost"] != 0.25 {
			t.Errorf("row values %v", r)
		}
		if m, ok := r["models"].(map[string]any)["claude-opus-5-5"].(map[string]any); !ok || !reflect.DeepEqual(keysOf(m), []string{"cache_read", "cache_write", "input", "output"}) {
			t.Errorf("models %v", r["models"])
		}
	}
	// A line with no cost goes as null, with cost_from null.
	l := usageLine(9)
	l.Cost, l.CostFrom = nil, ""
	b, _ := json.Marshal(usageRow(l))
	if !strings.Contains(string(b), `"cost":null`) || !strings.Contains(string(b), `"cost_from":null`) {
		t.Errorf("no-cost row %s", b)
	}
}

// U2: 1,203 lines never accepted are three posts of 500, 500 and 203.
func TestU2BatchesOf500(t *testing.T) {
	f := newUsageRecord(t)
	postUsage(context.Background(), usageTarget(f), t.TempDir(), usageLines(1203), fixedNow)
	var sizes []int
	seen := map[string]bool{}
	for _, p := range f.got() {
		sizes = append(sizes, len(p.rows))
		for _, r := range p.rows {
			seen[r["session_id"].(string)] = true
		}
	}
	if !reflect.DeepEqual(sizes, []int{500, 500, 203}) {
		t.Errorf("batch sizes %v, want [500 500 203]", sizes)
	}
	if len(seen) != 1203 {
		t.Errorf("distinct rows sent %d, want 1203", len(seen))
	}
}

// U3: a second pass with nothing changed posts nothing; then one line's
// tokens grow and one post carries that one row.
func TestU3OnlyChangedRows(t *testing.T) {
	f := newUsageRecord(t)
	dir := t.TempDir()
	ls := usageLines(3)
	postUsage(context.Background(), usageTarget(f), dir, ls, fixedNow)
	if n := len(f.got()); n != 1 {
		t.Fatalf("first pass posts %d, want 1", n)
	}
	// Fields the contract does not carry do not make a row changed.
	ls[0].Cwd, ls[0].Reason = "/elsewhere", "moved"
	postUsage(context.Background(), usageTarget(f), dir, ls, fixedNow)
	if n := len(f.got()); n != 1 {
		t.Fatalf("unchanged pass posted: %d posts, want still 1", n)
	}
	ls[1].Output += 500
	ls[1].Models["claude-opus-5-5"] = usage.Kinds{Input: 10, Output: 520, CacheRead: 30, CacheWrite: 40}
	postUsage(context.Background(), usageTarget(f), dir, ls, fixedNow)
	posts := f.got()
	if len(posts) != 2 || len(posts[1].rows) != 1 || posts[1].rows[0]["session_id"] != "s-0001" || posts[1].rows[0]["output"] != float64(520) {
		t.Fatalf("grown pass: %d posts, last %v", len(posts), posts[len(posts)-1].rows)
	}
}

// U5: a line with no initiative goes as "unattributed", with no task and
// no seat keys, even when it has a session name.
func TestU5Unattributed(t *testing.T) {
	f := newUsageRecord(t)
	l := usageLine(0)
	l.Initiative, l.Task, l.Role = "", "", ""
	l.Name = "some-session"
	postUsage(context.Background(), usageTarget(f), t.TempDir(), []usage.Line{l}, fixedNow)
	r := f.got()[0].rows[0]
	if r["initiative"] != "unattributed" {
		t.Errorf("initiative %v", r["initiative"])
	}
	if _, ok := r["task"]; ok {
		t.Error("task key present")
	}
	if _, ok := r["seat"]; ok {
		t.Error("seat key present")
	}
	for _, k := range []string{"cwd", "task_title", "reason", "cards", "name"} {
		if _, ok := r[k]; ok {
			t.Errorf("%s key present", k)
		}
	}
}

// usageHome is a temp home for Service.Usage: data dir, transcripts copied
// from the ledger's fixture, no initiative roots.
func usageHome(t *testing.T) string {
	data := t.TempDir()
	t.Setenv("XDG_DATA_HOME", data)
	claude := t.TempDir()
	t.Setenv("CLAUDE_CONFIG_DIR", claude)
	src := filepath.Join("..", "usage", "testdata", "projects")
	err := filepath.WalkDir(src, func(p string, d os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		dst := filepath.Join(claude, "projects", rel)
		if d.IsDir() {
			return os.MkdirAll(dst, 0o755)
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(dst, b, 0o644)
	})
	if err != nil {
		t.Fatal(err)
	}
	return filepath.Join(data, "organizer")
}

func usageService(t *testing.T, cfg config.Config) *Service {
	cfg.Machine = "lodestar"
	cfg.Roots = []string{t.TempDir()}
	cfg.MaxDepth = 2
	return NewWith(cfg, cache.State{}, fixedNow)
}

// U4: the record answers 500, then 200 on the next pass: the first pass's
// rows are resent in the second, the view is the same in both, and the
// failure is one log line without the key.
func TestU4FailedBatchResent(t *testing.T) {
	dataDir := usageHome(t)
	f := newUsageRecord(t, http.StatusInternalServerError)
	s := usageService(t, config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, true)})

	v1, err := s.Usage("")
	if err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()
	v2, err := s.Usage("")
	if err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()

	posts := f.got()
	if len(posts) != 2 {
		t.Fatalf("posts %d, want 2", len(posts))
	}
	ids := func(p fakePost) []string {
		var out []string
		for _, r := range p.rows {
			out = append(out, r["session_id"].(string)+"|"+r["day"].(string))
		}
		sort.Strings(out)
		return out
	}
	if len(posts[0].rows) == 0 || !reflect.DeepEqual(ids(posts[0]), ids(posts[1])) {
		t.Errorf("second pass sent %v, want the first's %v", ids(posts[1]), ids(posts[0]))
	}
	// The view does not depend on the post: only the ledger pass's own
	// read counters differ (the second pass reads nothing new).
	v1.Stats, v2.Stats = usage.Stats{}, usage.Stats{}
	if !reflect.DeepEqual(v1, v2) {
		t.Errorf("views differ:\n%+v\n%+v", v1, v2)
	}
	if v1.FirstDay == "" || len(v1.Sessions) == 0 {
		t.Errorf("empty view; the fixture did not ingest: %+v", v1)
	}

	b, _ := os.ReadFile(filepath.Join(dataDir, "organizer.log"))
	log := strings.TrimSpace(string(b))
	if n := len(strings.Split(log, "\n")); log == "" || n != 1 {
		t.Fatalf("organizer.log has %d lines, want 1:\n%s", n, log)
	}
	if !strings.Contains(log, "HTTP 500") || !strings.Contains(log, "store down") {
		t.Errorf("log line lacks status or the record's text: %s", log)
	}
	if strings.Contains(log, testKey) {
		t.Errorf("log line carries the key: %s", log)
	}
	if got := UsagePostStatus(s.Config()); !strings.HasPrefix(got, "ok ") || !strings.HasSuffix(got, fmt.Sprintf(", %d rows", len(posts[1].rows))) {
		t.Errorf("status after the 200: %q", got)
	}
}

// U6: no record_url and no key file make no request; an unreachable record
// returns the view and records failed; the status reads FR-5's words.
func TestU6OffAndUnreachable(t *testing.T) {
	usageHome(t)
	f := newUsageRecord(t)

	s := usageService(t, config.Config{DiscussStateDir: usageStateDir(t, true)})
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()
	if got := UsagePostStatus(s.Config()); got != "off: no record_url" {
		t.Errorf("no record_url: %q", got)
	}

	s = usageService(t, config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, false)})
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()
	if got := UsagePostStatus(s.Config()); got != "off: no factory key" {
		t.Errorf("no key: %q", got)
	}
	if n := len(f.got()); n != 0 {
		t.Errorf("requests with the post off: %d", n)
	}

	closed := httptest.NewServer(http.NotFoundHandler())
	url := closed.URL
	closed.Close()
	s = usageService(t, config.Config{RecordURL: url, DiscussStateDir: usageStateDir(t, true)})
	v, err := s.Usage("")
	if err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()
	if v.Machine != "lodestar" {
		t.Errorf("view not returned: %+v", v)
	}
	got := UsagePostStatus(s.Config())
	want := "failed " + postNow.Format(time.RFC3339) + ": "
	if !strings.HasPrefix(got, want) || !strings.Contains(got, "connection refused") || strings.Contains(got, testKey) {
		t.Errorf("unreachable: %q, want prefix %q", got, want)
	}
}

// U7: a record that holds the request 2 s does not hold Service.Usage.
func TestU7PostDoesNotDelayUsage(t *testing.T) {
	usageHome(t)
	f := newUsageRecord(t)
	f.hold = 2 * time.Second
	s := usageService(t, config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, true)})

	start := time.Now()
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	took := time.Since(start)
	// A second pass while the first post is held skips its own.
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	usagePosts.Wait()
	if took >= 200*time.Millisecond {
		t.Errorf("Service.Usage took %s with the record holding 2 s, want < 200ms", took)
	}
	if n := len(f.got()); n != 1 {
		t.Errorf("posts %d, want 1 (the second pass skips while one runs)", n)
	}
}
