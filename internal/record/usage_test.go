package record

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// A batch over the contract's 500 rows is refused before any request.
func TestPostUsageRefusesOver500(t *testing.T) {
	calls := 0
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) { calls++ }))
	defer srv.Close()
	err := New(srv.URL).PostUsage(context.Background(), "k", "f", make([]UsageRow, MaxUsageRows+1))
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
	err := New(srv.URL).PostUsage(context.Background(), "k", "f", []UsageRow{{SessionID: "s"}})
	re, ok := err.(*Error)
	if !ok || re.Status != 400 || re.Message != "unknown field cwd" {
		t.Fatalf("err %v", err)
	}
}
