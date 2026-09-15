package discuss

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestClientRoundTrips(t *testing.T) {
	dir := t.TempDir()
	os.WriteFile(filepath.Join(dir, "tokens.json"), []byte(`{"tokens":{"tok-p":{"project":"camp","agent":"pablo"}}}`), 0o600)
	var posted PostRequest
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer tok-p" {
			w.WriteHeader(401)
			return
		}
		switch {
		case r.Method == "GET" && r.URL.Path == "/projects/camp/threads/t1":
			w.Write([]byte(`{"id":"t1","subject":"a-06: frozen?","status":"open","since_decision":2,"messages":[{"id":"m1","thread_id":"t1","from":"po_andrea","to":"tech_lead_nicolas","kind":"question","body":"hi","created_at":1}]}`))
		case r.Method == "POST" && r.URL.Path == "/projects/camp/messages":
			json.NewDecoder(r.Body).Decode(&posted)
			w.WriteHeader(201)
			w.Write([]byte(`{"id":"m2","thread_id":"t1","created_at":2,"stalled":false}`))
		case r.Method == "POST" && r.URL.Path == "/projects/camp/threads/t1/status":
			w.WriteHeader(409)
			w.Write([]byte(`{"error":"thread is not open"}`))
		case r.Method == "POST" && r.URL.Path == "/projects/camp/agents/pablo/drain":
			w.Write([]byte(`{"block":true,"reason":"x","delivered_ids":["m1","m2"]}`))
		case r.URL.Path == "/projects/camp/threads":
			w.Write([]byte(`{"threads":[{"ID":"t9","Subject":"old","Status":"closed","SinceDecision":0,"CreatedAt":5}]}`))
		case r.URL.Path == "/projects/camp/search":
			if r.URL.Query().Get("q") != "frozen" || r.URL.Query().Get("kind") != "question" {
				w.WriteHeader(400)
				return
			}
			w.Write([]byte(`{"messages":[{"id":"m1","thread_id":"t1","from":"po_andrea","kind":"question","body":"frozen"}]}`))
		default:
			w.WriteHeader(404)
		}
	}))
	defer srv.Close()
	t.Setenv("DISCUSS_BIND", strings.TrimPrefix(srv.URL, "http://"))

	c, err := Connect(dir, "camp", "pablo")
	if err != nil {
		t.Fatal(err)
	}
	ctx := context.Background()
	th, err := c.Thread(ctx, "t1")
	if err != nil || th.Subject != "a-06: frozen?" || len(th.Messages) != 1 || th.Messages[0].Kind != "question" {
		t.Fatalf("thread %+v %v", th, err)
	}
	res, err := c.Post(ctx, PostRequest{ThreadID: "t1", Kind: "answer", Body: "yes"})
	if err != nil || res.ID != "m2" || posted.Kind != "answer" || posted.ThreadID != "t1" {
		t.Fatalf("post %+v %+v %v", res, posted, err)
	}
	if err := c.SetStatus(ctx, "t1", "closed"); err == nil || !strings.Contains(err.Error(), "thread is not open") {
		t.Errorf("409 should surface the server's sentence, got %v", err)
	}
	heads, err := c.ThreadsByStatus(ctx, "closed")
	if err != nil || len(heads) != 1 || heads[0].ID != "t9" {
		t.Errorf("closed %+v %v", heads, err)
	}
	hits, err := c.Search(ctx, "frozen", SearchFilter{Kind: "question"})
	if err != nil || len(hits) != 1 {
		t.Errorf("search %+v %v", hits, err)
	}
	if n, err := c.PickUp(ctx); err != nil || n != 2 {
		t.Errorf("pickup %d %v", n, err)
	}
	if _, err := Connect(dir, "camp", "nobody"); err == nil {
		t.Error("unknown identity must fail to connect")
	}
}

func TestSubjectSlug(t *testing.T) {
	for in, want := range map[string]string{
		"readiness-endpoint: freeze accepted?": "readiness-endpoint",
		"a-06 — is ReadinessRow frozen":        "a-06",
		"Is ReadinessRow frozen, and what":     "",
		"Ready: go":                            "",
		"":                                     "",
	} {
		if got := SubjectSlug(in); got != want {
			t.Errorf("%q -> %q want %q", in, got, want)
		}
	}
}
