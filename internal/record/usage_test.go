package record

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

// A batch over the contract's 500 rows is refused before any request.
func TestPostUsageRefusesOver500(t *testing.T) {
	calls := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { calls++ }))
	defer srv.Close()
	_, err := New(srv.URL).PostUsage(context.Background(), "k", "f", make([]UsageRow, MaxUsageRows+1))
	if err == nil || !strings.Contains(err.Error(), "at most 500") || calls != 0 {
		t.Fatalf("err %v, calls %d", err, calls)
	}
}

// A non-2xx is an *Error with the record's status and message.
func TestPostUsageNon2xx(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusBadRequest)
		_, _ = w.Write([]byte(`{"error":"unknown field cwd"}`))
	}))
	defer srv.Close()
	_, err := New(srv.URL).PostUsage(context.Background(), "k", "f", []UsageRow{{SessionID: "s"}})
	re, ok := err.(*Error)
	if !ok || re.Status != 400 || re.Message != "unknown field cwd" {
		t.Fatalf("err %v", err)
	}
}

// leftovers-54 FR-3: a 200 with rejected rows is returned whole, read the
// way the contract's own response example is written (usage-batch.json
// `response`, at $CONTRACTS_DIR, else ~/agent-slack/specs/contracts).
func TestPostUsageReturnsTheResponse(t *testing.T) {
	dir := os.Getenv("CONTRACTS_DIR")
	if dir == "" {
		home, _ := os.UserHomeDir()
		dir = filepath.Join(home, "agent-slack", "specs", "contracts")
	}
	b, err := os.ReadFile(filepath.Join(dir, "usage-batch.json"))
	if err != nil {
		t.Fatalf("the usage contract sample is missing: %v", err)
	}
	var sample struct {
		Response struct {
			Status       int             `json:"status"`
			Keys         []string        `json:"keys"`
			RejectedKeys []string        `json:"rejected_keys"`
			Example      json.RawMessage `json:"example"`
		} `json:"response"`
	}
	if err := json.Unmarshal(b, &sample); err != nil {
		t.Fatal(err)
	}
	if sample.Response.Status != 200 || len(sample.Response.Example) == 0 {
		t.Fatalf("usage-batch.json has no 200 response example: %+v", sample.Response)
	}
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(sample.Response.Status)
		_, _ = w.Write(sample.Response.Example)
	}))
	defer srv.Close()
	got, err := New(srv.URL).PostUsage(context.Background(), "k", "f", []UsageRow{{SessionID: "s-ok"}, {SessionID: "s-negative"}})
	if err != nil {
		t.Fatal(err)
	}
	var want UsageResult
	if err := json.Unmarshal(sample.Response.Example, &want); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(got, want) || len(got.Rejected) != 1 || got.Rejected[0].Reason == "" || got.Rejected[0].SessionID == "" || got.Rejected[0].Day == "" {
		t.Errorf("result %+v, want the sample's %+v", got, want)
	}
	// Every key the contract names has a field here.
	var asMap map[string]any
	rb, _ := json.Marshal(got)
	_ = json.Unmarshal(rb, &asMap)
	for _, k := range sample.Response.Keys {
		if _, ok := asMap[k]; !ok {
			t.Errorf("UsageResult has no %q", k)
		}
	}
	rj, _ := json.Marshal(got.Rejected[0])
	var rm map[string]any
	_ = json.Unmarshal(rj, &rm)
	for _, k := range sample.Response.RejectedKeys {
		if _, ok := rm[k]; !ok {
			t.Errorf("UsageRejected has no %q", k)
		}
	}
}
