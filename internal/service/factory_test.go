package service

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"organizer/internal/auth"
	"organizer/internal/config"
	"organizer/internal/record"
)

// fakeRecord stands in for discuss-record, which does not exist yet. It
// issues numbered keys and remembers every call in order, so a test can
// check that a rotation issues before it revokes.
type fakeRecord struct {
	issued int
	calls  []string
	bodies []map[string]any
	cells  int // status for POST .../cells, 0 = 204
}

func (f *fakeRecord) serve(t *testing.T) *httptest.Server {
	return httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw, _ := io.ReadAll(r.Body)
		var body map[string]any
		_ = json.Unmarshal(raw, &body)
		f.calls = append(f.calls, r.Method+" "+r.URL.Path+" as "+strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer "))
		f.bodies = append(f.bodies, body)
		switch {
		case r.URL.Path == "/v1/factories/keys":
			if r.Header.Get("Authorization") != "Bearer dev-id-token" {
				w.WriteHeader(401)
				w.Write([]byte(`{"error":"who are you"}`))
				return
			}
			f.issued++
			w.WriteHeader(201)
			json.NewEncoder(w).Encode(map[string]any{"key": strings.Repeat("k", f.issued), "factory": body["factory"]})
		case strings.HasSuffix(r.URL.Path, "/keys/revoke"):
			w.WriteHeader(204)
		case strings.HasSuffix(r.URL.Path, "/cells"):
			if f.cells != 0 {
				w.WriteHeader(f.cells)
				return
			}
			w.WriteHeader(204)
		default:
			t.Errorf("unexpected %s %s", r.Method, r.URL.Path)
			w.WriteHeader(404)
		}
	}))
}

func devToken(ctx context.Context) (string, error) { return "dev-id-token", nil }

func TestFactoryKeyIssuesThenRotates(t *testing.T) {
	f := &fakeRecord{}
	srv := f.serve(t)
	defer srv.Close()
	dir := filepath.Join(t.TempDir(), "discuss")
	cfg := config.Config{Machine: "lodestar", RecordURL: srv.URL, DiscussStateDir: dir}
	ctx := context.Background()

	if _, err := factoryKey(ctx, cfg, devToken, true); err == nil || !strings.Contains(err.Error(), "no key to rotate") {
		t.Errorf("rotate without a key: %v", err)
	}
	if len(f.calls) != 0 {
		t.Fatalf("nothing should reach the record before a key exists to rotate: %v", f.calls)
	}

	factory, err := factoryKey(ctx, cfg, devToken, false)
	if err != nil || factory != "lodestar" {
		t.Fatalf("issue: %q %v", factory, err)
	}
	if got, _ := record.Factory(dir); got != "lodestar" {
		t.Errorf("factory file should be written once from the machine name: %q", got)
	}
	if k, _ := record.ReadKey(dir); k != "k" {
		t.Errorf("key file %q", k)
	}
	st, _ := os.Stat(filepath.Join(dir, record.KeyFile))
	if st.Mode().Perm() != 0o600 {
		t.Errorf("key mode %o", st.Mode().Perm())
	}
	if f.bodies[0]["factory"] != "lodestar" {
		t.Errorf("issue body %v", f.bodies[0])
	}

	// Rotate: issue, write, then revoke the old hash — in that order.
	if _, err := factoryKey(ctx, cfg, devToken, true); err != nil {
		t.Fatal(err)
	}
	if k, _ := record.ReadKey(dir); k != "kk" {
		t.Errorf("rotated key file %q", k)
	}
	want := []string{
		"POST /v1/factories/keys as dev-id-token",
		"POST /v1/factories/keys as dev-id-token",
		"POST /v1/factories/lodestar/keys/revoke as dev-id-token",
	}
	if strings.Join(f.calls, "\n") != strings.Join(want, "\n") {
		t.Errorf("calls:\n%s\nwant:\n%s", strings.Join(f.calls, "\n"), strings.Join(want, "\n"))
	}
	if f.bodies[2]["key_hash"] != record.KeyHash("k") {
		t.Errorf("revoke should name the old key's hash, got %v", f.bodies[2])
	}
	// The key itself never crosses the wire except as the issue answer, and
	// never in a revoke body.
	for _, b := range f.bodies {
		if b["key"] != nil {
			t.Errorf("a request carried the key: %v", b)
		}
	}

	// Guard rails: no record, no session.
	if _, err := factoryKey(ctx, config.Config{DiscussStateDir: dir}, devToken, false); err == nil || !strings.Contains(err.Error(), "record_url") {
		t.Errorf("record_url unset: %v", err)
	}
	signedOut := func(context.Context) (string, error) { return "", auth.ErrSignedOut }
	if _, err := factoryKey(ctx, cfg, signedOut, false); !errors.Is(err, ErrNotSignedIn) {
		t.Errorf("signed out: %v", err)
	}
	bad := func(context.Context) (string, error) { return "stale", nil }
	if _, err := factoryKey(ctx, cfg, bad, false); err == nil || !strings.Contains(err.Error(), "401") {
		t.Errorf("a refused token should surface the record's answer: %v", err)
	}
	if k, _ := record.ReadKey(dir); k != "kk" {
		t.Error("a failed issue must leave the current key alone")
	}
}

func TestRegisterCellWritesPushAndRegistersWhenAFactory(t *testing.T) {
	f := &fakeRecord{}
	srv := f.serve(t)
	defer srv.Close()
	dir := filepath.Join(t.TempDir(), "discuss")
	root := t.TempDir()
	os.MkdirAll(filepath.Join(root, "agents"), 0o755)
	os.WriteFile(filepath.Join(root, "agents", "cell.json"), []byte(`{"project":"camp","agents":["po_andrea"],"push":true}`), 0o644)
	// bootstrap.sh already wrote another cell; it must survive.
	os.MkdirAll(dir, 0o700)
	os.WriteFile(filepath.Join(dir, record.ProjectsFile), []byte(`{"plv-auth":{"push":false}}`), 0o644)

	cell := record.Cell{Cell: "camp", Initiative: "ccint-camp", Title: "Camp", Client: "acme"}
	cfg := config.Config{Machine: "lodestar", RecordURL: srv.URL, DiscussStateDir: dir}
	ctx := context.Background()

	// Not a factory yet (no key): the flag is written, nothing is sent.
	if err := registerCell(ctx, cfg, root, cell); err != nil {
		t.Fatal(err)
	}
	var projects map[string]map[string]any
	b, _ := os.ReadFile(filepath.Join(dir, record.ProjectsFile))
	json.Unmarshal(b, &projects)
	if projects["camp"]["push"] != true || projects["plv-auth"]["push"] != false {
		t.Errorf("projects.json %s", b)
	}
	if len(f.calls) != 0 {
		t.Errorf("no key, no registration: %v", f.calls)
	}

	// With a key: registered with the initiative's id, title and client.
	record.WriteKey(dir, "fk-1")
	record.WriteFactory(dir, "lodestar")
	if err := registerCell(ctx, cfg, root, cell); err != nil {
		t.Fatal(err)
	}
	if len(f.calls) != 1 || f.calls[0] != "POST /v1/factories/lodestar/cells as fk-1" {
		t.Fatalf("calls %v", f.calls)
	}
	body := f.bodies[0]
	if body["cell"] != "camp" || body["initiative"] != "ccint-camp" || body["title"] != "Camp" || body["client"] != "acme" {
		t.Errorf("registration body %v", body)
	}
	// Idempotent: a second run, and a conflict, both read as registered.
	f.cells = 409
	if err := registerCell(ctx, cfg, root, cell); err != nil {
		t.Errorf("409 should count as registered: %v", err)
	}
	// The record refusing the key is a stop, not a skip.
	f.cells = 403
	if err := registerCell(ctx, cfg, root, cell); err == nil || !strings.Contains(err.Error(), "403") {
		t.Errorf("403 should stop the crew: %v", err)
	}
	f.cells = 0
	// No record configured: the local flag only, whatever files exist.
	f.calls = nil
	if err := registerCell(ctx, config.Config{DiscussStateDir: dir}, root, cell); err != nil || len(f.calls) != 0 {
		t.Errorf("record_url unset: %v %v", err, f.calls)
	}
	// An initiative with no cell.json is a caller error, not a silent skip.
	if err := registerCell(ctx, cfg, t.TempDir(), cell); err == nil {
		t.Error("missing cell.json should surface")
	}
}
