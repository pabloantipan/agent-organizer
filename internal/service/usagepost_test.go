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

// usageSample is the record's own sample of POST /v1/usage
// (~/agent-slack/specs/contracts/usage-batch.json, contract H3), the shape
// both sides test against (leftovers-53 FR-5).
type usageSample struct {
	BatchKeys []string  `json:"batch_keys"`
	RowKeys   []string  `json:"row_keys"`
	ModelKeys []string  `json:"model_keys"`
	CostFrom  []*string `json:"cost_from"`
	Valid     []struct {
		Name string         `json:"name"`
		Row  map[string]any `json:"row"`
	} `json:"valid"`
}

// loadUsageSample reads the sample by path, $CONTRACTS_DIR else
// ~/agent-slack/specs/contracts; a missing sample fails, never skips
// (contracts/README.md, rules 2 and 3).
func loadUsageSample(t *testing.T) usageSample {
	t.Helper()
	dir := os.Getenv("CONTRACTS_DIR")
	if dir == "" {
		home, err := os.UserHomeDir()
		if err != nil {
			t.Fatalf("no home for the contracts dir: %v", err)
		}
		dir = filepath.Join(home, "agent-slack", "specs", "contracts")
	}
	path := filepath.Join(dir, "usage-batch.json")
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("the usage contract sample is missing: %v", err)
	}
	var s usageSample
	if err := json.Unmarshal(b, &s); err != nil {
		t.Fatalf("%s: %v", path, err)
	}
	if len(s.RowKeys) == 0 || len(s.CostFrom) == 0 || len(s.Valid) == 0 {
		t.Fatalf("%s has no row_keys, cost_from or valid cases", path)
	}
	return s
}

// sampleCase is the sample's valid row with that name.
func (s usageSample) sampleCase(t *testing.T, name string) map[string]any {
	t.Helper()
	for _, v := range s.Valid {
		if v.Name == name {
			return v.Row
		}
	}
	t.Fatalf("usage-batch.json has no valid case %q", name)
	return nil
}

// lineOf is the ledger line usageRow turns into the sample row r.
func lineOf(t *testing.T, r map[string]any) usage.Line {
	t.Helper()
	num := func(k string) int64 { f, _ := r[k].(float64); return int64(f) }
	kinds := func(m map[string]any) usage.Kinds {
		f := func(k string) int64 { v, _ := m[k].(float64); return int64(v) }
		return usage.Kinds{Input: f("input"), Output: f("output"), CacheRead: f("cache_read"), CacheWrite: f("cache_write")}
	}
	at := func(k string) time.Time {
		v, err := time.Parse(time.RFC3339, r[k].(string))
		if err != nil {
			t.Fatalf("%s: %v", k, err)
		}
		return v
	}
	str := func(k string) string { v, _ := r[k].(string); return v }
	l := usage.Line{
		SessionID: str("session_id"),
		Day:       str("day"),
		Attribution: usage.Attribution{
			Name: str("seat"), Initiative: str("initiative"), Role: str("role"), Task: str("task"),
		},
		Kinds:    kinds(r),
		Models:   map[string]usage.Kinds{},
		Messages: int(num("messages")),
		First:    at("first"),
		Last:     at("last"),
		CostFrom: str("cost_from"),
	}
	if l.Initiative == "unattributed" {
		l.Initiative = ""
	}
	for m, k := range r["models"].(map[string]any) {
		l.Models[m] = kinds(k.(map[string]any))
	}
	if c, ok := r["cost"].(float64); ok {
		l.Cost = &c
	}
	return l
}

// rowJSON is a row as the record reads it.
func rowJSON(t *testing.T, r record.UsageRow) map[string]any {
	t.Helper()
	b, err := json.Marshal(r)
	if err != nil {
		t.Fatal(err)
	}
	var m map[string]any
	if err := json.Unmarshal(b, &m); err != nil {
		t.Fatal(err)
	}
	return m
}

// leftovers-53 U1 (FR-5): every cost source the ledger can give a line
// (costOf: record, transcript, priced, a reset session's record or its
// priced tokens, none) goes through usageRow as the sample's own row for
// that cost_from: the same keys, model keys and values, and a cost_from in
// the sample's enum. Reset is the ledger's and is not sent.
func TestUsageRowsMatchTheSample(t *testing.T) {
	s := loadUsageSample(t)
	enum := map[string]bool{}
	var enumWords []string
	for _, v := range s.CostFrom {
		w := "null"
		if v != nil {
			w = *v
		}
		enum[w] = true
		enumWords = append(enumWords, w)
	}
	rowKeys := append([]string(nil), s.RowKeys...)
	sort.Strings(rowKeys)
	modelKeys := append([]string(nil), s.ModelKeys...)
	sort.Strings(modelKeys)

	paths := []struct {
		name, sample string
		reset        bool
	}{
		{"record", "cost_from record", false},
		{"record, reset", "cost_from record", true},
		{"transcript", "cost_from transcript", false},
		{"priced", "cost_from priced", false},
		{"reset and priced", "cost_from priced", true},
		{"null", "cost_from null, no cost", false},
		{"unattributed", "unattributed, no task or seat", false},
	}
	for _, p := range paths {
		t.Run(p.name, func(t *testing.T) {
			want := s.sampleCase(t, p.sample)
			l := lineOf(t, want)
			l.Reset = p.reset
			got := rowJSON(t, usageRow(l))

			keys := rowKeys
			if l.Initiative == "" {
				keys = keysOf(want) // the sample's unattributed row: no task, no seat
			}
			if !reflect.DeepEqual(keysOf(got), keys) {
				t.Errorf("row keys %v, want %v", keysOf(got), keys)
			}
			for m, k := range got["models"].(map[string]any) {
				if mk := keysOf(k.(map[string]any)); !reflect.DeepEqual(mk, modelKeys) {
					t.Errorf("model %s keys %v, want %v", m, mk, modelKeys)
				}
			}
			from := "null"
			if v, ok := got["cost_from"].(string); ok {
				from = v
			}
			if !enum[from] {
				t.Errorf("cost_from %q is not in the sample's enum %v", from, enumWords)
			}
			if !reflect.DeepEqual(got, want) {
				t.Errorf("row differs from the sample's %q:\n got %v\nwant %v", p.sample, got, want)
			}
		})
	}
}

// usage-post U1: one pass over three lines is one POST to /v1/usage, Bearer
// the test key, factory the test id, the sample's batch keys, and three
// rows with exactly the sample's row keys.
func TestU1PostsThreeRowsWithContractKeys(t *testing.T) {
	s := loadUsageSample(t)
	batchKeys := append([]string(nil), s.BatchKeys...)
	sort.Strings(batchKeys)
	rowKeys := append([]string(nil), s.RowKeys...)
	sort.Strings(rowKeys)
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
	if p.body["factory"] != "testfactory" || !reflect.DeepEqual(keysOf(p.body), batchKeys) {
		t.Errorf("body keys %v factory %v", keysOf(p.body), p.body["factory"])
	}
	if len(p.rows) != 3 {
		t.Fatalf("rows = %d, want 3", len(p.rows))
	}
	for _, r := range p.rows {
		if got := keysOf(r); !reflect.DeepEqual(got, rowKeys) {
			t.Errorf("row keys %v, want %v", got, rowKeys)
		}
		if r["seat"] != "organizer-probe-up-build" || r["task"] != "usage-post" || r["first"] != "2026-10-05T10:00:00Z" || r["cost_from"] != "record" || r["cost"] != 0.25 {
			t.Errorf("row values %v", r)
		}
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

// leftovers-53 U2 (FR-6): three batches, the record refuses the second.
// The first and third are accepted; the second's rows stay unsent and are
// the only rows the next pass sends; the state and organizer.log name the
// refusal. The state is read as JSON so this compiles against any version.
func TestRefusedBatchDoesNotEndThePass(t *testing.T) {
	f := newUsageRecord(t, http.StatusOK, http.StatusBadRequest, http.StatusOK)
	dir := t.TempDir()
	ls := usageLines(1203)
	postUsage(context.Background(), usageTarget(f), dir, ls, fixedNow)

	posts := f.got()
	var sizes []int
	for _, p := range posts {
		sizes = append(sizes, len(p.rows))
	}
	if !reflect.DeepEqual(sizes, []int{500, 500, 203}) {
		t.Fatalf("batch sizes %v, want [500 500 203]: a refused batch ended the pass", sizes)
	}
	refused := map[string]bool{}
	for _, r := range posts[1].rows {
		refused[r["session_id"].(string)+"|"+r["day"].(string)] = true
	}

	b, err := os.ReadFile(filepath.Join(dir, usagePostFile))
	if err != nil {
		t.Fatal(err)
	}
	var st struct {
		Accepted map[string]string `json:"accepted"`
		Last     map[string]any    `json:"last"`
	}
	if err := json.Unmarshal(b, &st); err != nil {
		t.Fatal(err)
	}
	if len(st.Accepted) != 703 {
		t.Errorf("accepted rows %d, want 703 (batches 1 and 3)", len(st.Accepted))
	}
	for k := range refused {
		if _, ok := st.Accepted[k]; ok {
			t.Errorf("refused row %s marked accepted", k)
		}
	}
	if st.Last["ok"] != false || st.Last["rows"] != float64(703) {
		t.Errorf("last outcome %v, want not ok with 703 rows", st.Last)
	}
	rs, _ := st.Last["refused"].([]any)
	if len(rs) != 1 {
		t.Fatalf("state names %d refusals, want 1: %s", len(rs), b)
	}
	r := rs[0].(map[string]any)
	if r["batch"] != float64(2) || r["of"] != float64(3) || r["rows"] != float64(500) || !strings.Contains(r["reason"].(string), "HTTP 400") {
		t.Errorf("refusal %v", r)
	}
	if strings.Contains(string(b), testKey) {
		t.Error("state carries the key")
	}

	lb, _ := os.ReadFile(filepath.Join(dir, "organizer.log"))
	log := strings.TrimSpace(string(lb))
	if n := len(strings.Split(log, "\n")); log == "" || n != 1 {
		t.Fatalf("organizer.log has %d lines, want 1:\n%s", n, log)
	}
	if !strings.Contains(log, "refused batch 2 of 3") || !strings.Contains(log, "HTTP 400") || !strings.Contains(log, "500 rows unsent") || strings.Contains(log, testKey) {
		t.Errorf("log line: %s", log)
	}

	// The next pass resends exactly the refused rows.
	postUsage(context.Background(), usageTarget(f), dir, ls, fixedNow)
	posts = f.got()
	if len(posts) != 4 || len(posts[3].rows) != 500 {
		t.Fatalf("retry: %d posts, last %d rows; want 4 and 500", len(posts), len(posts[len(posts)-1].rows))
	}
	for _, r := range posts[3].rows {
		if !refused[r["session_id"].(string)+"|"+r["day"].(string)] {
			t.Errorf("retry sent %v, not a refused row", r["session_id"])
		}
	}
}

// Doctor's line after a pass with a refused batch says how many were
// refused, what still went, and the record's answer.
func TestUsagePostStatusNamesRefusals(t *testing.T) {
	dataDir := usageHome(t)
	f := newUsageRecord(t, http.StatusOK, http.StatusBadRequest, http.StatusOK)
	postUsage(context.Background(), usageTarget(f), dataDir, usageLines(1203), fixedNow)
	got := UsagePostStatus(config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, true)})
	want := "failed " + postNow.Format(time.RFC3339) + ": 1 of 3 batches refused, 703 rows posted: HTTP 400: store down"
	if !strings.HasPrefix(got, want) || strings.Contains(got, testKey) {
		t.Errorf("status %q, want prefix %q", got, want)
	}
}

// A batch that gets no answer ends the pass: every later batch would wait
// out the same timeout, and all its rows stay unsent.
func TestUnansweredBatchEndsThePass(t *testing.T) {
	closed := httptest.NewServer(http.NotFoundHandler())
	url := closed.URL
	closed.Close()
	dir := t.TempDir()
	postUsage(context.Background(), usagePostTarget{url: url, key: testKey, factory: "testfactory"}, dir, usageLines(1203), fixedNow)
	st := loadUsagePostState(filepath.Join(dir, usagePostFile))
	if len(st.Accepted) != 0 || st.Last == nil || st.Last.OK || len(st.Last.Refused) != 0 {
		t.Errorf("state %+v", st)
	}
	lb, _ := os.ReadFile(filepath.Join(dir, "organizer.log"))
	if log := strings.TrimSpace(string(lb)); !strings.Contains(log, "1203 rows unsent") || strings.Count(log, "\n") != 0 {
		t.Errorf("log: %s", log)
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

// Amendment 1: the CLI's wait for the post is bounded; a record that holds
// the request longer than the bound does not hold the waiter.
func TestWaitUsagePostIsBounded(t *testing.T) {
	usageHome(t)
	f := newUsageRecord(t)
	f.hold = 2 * time.Second
	s := usageService(t, config.Config{RecordURL: f.srv.URL, DiscussStateDir: usageStateDir(t, true)})
	if _, err := s.Usage(""); err != nil {
		t.Fatal(err)
	}
	start := time.Now()
	if waitUsagePost(300 * time.Millisecond) {
		t.Error("wait reported done while the record still held the post")
	}
	if took := time.Since(start); took > time.Second {
		t.Errorf("bounded wait took %s", took)
	}
	if !waitUsagePost(5 * time.Second) {
		t.Error("post did not finish after the record answered")
	}
}
