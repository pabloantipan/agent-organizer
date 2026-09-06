package discuss

import (
	"context"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestTokenAndHealthOverUnixSocket(t *testing.T) {
	dir := t.TempDir()
	if err := os.WriteFile(filepath.Join(dir, "tokens.json"), []byte(`{"tokens":{"secret-1":{"project":"camp","agent":"pablo"},"secret-2":{"project":"camp","agent":"po_andrea"}}}`), 0o600); err != nil {
		t.Fatal(err)
	}
	tok, err := Token(dir, "camp", "pablo")
	if err != nil || tok != "secret-1" {
		t.Fatalf("token %q %v", tok, err)
	}
	if _, err := Token(dir, "camp", "nobody"); err == nil {
		t.Error("unknown identity should fail")
	}

	// macOS caps unix socket paths at 104 bytes; t.TempDir() is longer.
	short, err := os.MkdirTemp("/tmp", "org-discuss-")
	if err != nil {
		t.Fatal(err)
	}
	defer os.RemoveAll(short)
	t.Setenv("DISCUSS_BIND", "unix:"+filepath.Join(short, "discuss.sock"))
	ln, err := net.Listen("unix", filepath.Join(short, "discuss.sock"))
	if err != nil {
		t.Fatal(err)
	}
	srv := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/projects/camp/health" || r.Header.Get("Authorization") != "Bearer secret-1" {
			w.WriteHeader(http.StatusUnauthorized)
			return
		}
		w.Write([]byte(`{"agents":[{"agent":"po_andrea","watcher":"alive","seconds_since_wait":12,"undelivered":0,"deaf":false},{"agent":"tech_lead_nicolas","watcher":"never","undelivered":2,"deaf":true}],"threads":[{"id":"01M1N893SRYKX2F6H6G9WCCCMA","subject":"A-06","status":"open","kind":"conversation","participants":["po_andrea","tech_lead_nicolas"],"messages":2,"since_decision":2}]}`))
	}))
	srv.Listener = ln
	srv.Start()
	defer srv.Close()

	// Available follows the bind, not the state dir: a unix: bind is a socket
	// file to stat; a TCP bind is a /healthz to answer.
	if !Available(short) {
		t.Error("Available should see the unix socket the bind names")
	}
	t.Setenv("DISCUSS_BIND", "127.0.0.1:1")
	if Available(short) {
		t.Error("Available should be false when nothing answers the TCP bind")
	}
	tcp := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/healthz" {
			w.WriteHeader(http.StatusOK)
			return
		}
		w.WriteHeader(http.StatusNotFound)
	}))
	defer tcp.Close()
	t.Setenv("DISCUSS_BIND", strings.TrimPrefix(tcp.URL, "http://"))
	if !Available(short) {
		t.Error("Available should be true when /healthz answers on the TCP bind")
	}
	t.Setenv("DISCUSS_BIND", "unix:"+filepath.Join(short, "discuss.sock"))
	got, err := Health(context.Background(), dir, "camp", "pablo")
	if err != nil {
		t.Fatal(err)
	}
	if got.Agents["po_andrea"].Watcher != "alive" || !got.Agents["tech_lead_nicolas"].Deaf || got.Agents["tech_lead_nicolas"].Undelivered != 2 {
		t.Errorf("health %+v", got.Agents)
	}
	// The endpoint has always sent threads beside the roster; dropping them was
	// the reason a card could not say what it was waiting on.
	if len(got.Threads) != 1 || got.Threads[0].Subject != "A-06" || got.Threads[0].SinceDecision != 2 {
		t.Errorf("threads %+v", got.Threads)
	}
	if _, ok := got.Thread("01M1N893SRYKX2F6H6G9WCCCMA"); !ok {
		t.Error("Thread should find the thread by id")
	}
	if _, ok := got.Thread("nope"); ok {
		t.Error("Thread should miss an unknown id")
	}
	if _, err := Health(context.Background(), dir, "camp", "po_andrea"); err == nil {
		t.Error("wrong token should be a 401 error")
	}
}
