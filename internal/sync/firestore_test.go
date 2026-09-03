package sync

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

type fakeTS struct{}

func (fakeTS) Token(context.Context) (string, error) { return "tok", nil }
func (fakeTS) UID(context.Context) (string, error)   { return "u1", nil }

// fakeFirestore keeps documents by name and answers commit, list, runQuery,
// get and patch the way this package uses them.
type fakeFirestore struct{ docs map[string]document }

func (f *fakeFirestore) handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") != "Bearer tok" {
			w.WriteHeader(401)
			return
		}
		p := strings.TrimPrefix(r.URL.Path, "/v1/")
		switch {
		case strings.HasSuffix(p, ":commit"):
			var body struct {
				Writes []struct {
					Update     document `json:"update"`
					UpdateMask *struct {
						FieldPaths []string `json:"fieldPaths"`
					} `json:"updateMask"`
				} `json:"writes"`
			}
			_ = json.NewDecoder(r.Body).Decode(&body)
			for _, wr := range body.Writes {
				if wr.UpdateMask != nil {
					d := f.docs[wr.Update.Name]
					if d.Fields == nil {
						d.Fields = map[string]value{}
					}
					for _, k := range wr.UpdateMask.FieldPaths {
						d.Fields[k] = wr.Update.Fields[k]
					}
					d.Name = wr.Update.Name
					f.docs[wr.Update.Name] = d
				} else {
					f.docs[wr.Update.Name] = wr.Update
				}
			}
			_, _ = w.Write([]byte(`{}`))
		case strings.HasSuffix(p, ":runQuery"):
			prefix := strings.TrimSuffix(p, ":runQuery")
			var rows []map[string]any
			for name, d := range f.docs {
				if strings.HasPrefix(name, prefix+"/") && strings.Contains(name, "/initiatives/") && boolean(d.Fields, "present") {
					rows = append(rows, map[string]any{"document": d})
				}
			}
			_ = json.NewEncoder(w).Encode(rows)
		case r.Method == http.MethodGet && strings.HasSuffix(p, "/initiatives"):
			var docs []document
			for name, d := range f.docs {
				if strings.HasPrefix(name, p+"/") {
					docs = append(docs, d)
				}
			}
			_ = json.NewEncoder(w).Encode(map[string]any{"documents": docs})
		case r.Method == http.MethodGet:
			d, ok := f.docs[p]
			if !ok {
				w.WriteHeader(404)
				return
			}
			_ = json.NewEncoder(w).Encode(d)
		case r.Method == http.MethodPatch:
			var d document
			_ = json.NewDecoder(r.Body).Decode(&d)
			d.Name = p
			f.docs[p] = d
			_ = json.NewEncoder(w).Encode(d)
		default:
			w.WriteHeader(400)
		}
	})
}

func newStore(t *testing.T) (*Store, *fakeFirestore) {
	f := &fakeFirestore{docs: map[string]document{}}
	srv := httptest.NewServer(f.handler())
	t.Cleanup(srv.Close)
	BaseURL = srv.URL + "/v1"
	st, err := Open("p", "organizer", fakeTS{})
	if err != nil {
		t.Fatal(err)
	}
	return st, f
}

func snap(machine string, at time.Time, ids ...string) model.Snapshot {
	s := model.Snapshot{Machine: machine, ScannedAt: at}
	for _, id := range ids {
		si := model.ScannedInitiative{ScannedAt: at}
		si.ID, si.Client = id, "c"
		si.Cards = []model.Card{{Slug: "x", Status: model.StatusNow, Updated: "2026-09-01", Next: "go"}}
		s.Initiatives = append(s.Initiatives, si)
	}
	return s
}

func TestPushRetirePull(t *testing.T) {
	st, f := newStore(t)
	ctx := context.Background()
	t0 := time.Date(2026, 9, 2, 10, 0, 0, 0, time.UTC)

	pushed, retired, err := st.Push(ctx, snap("m1", t0, "a", "b"))
	if err != nil || pushed != 2 || retired != 0 {
		t.Fatalf("first push: %d %d %v", pushed, retired, err)
	}
	pushed, retired, err = st.Push(ctx, snap("m1", t0.Add(time.Hour), "a"))
	if err != nil || pushed != 1 || retired != 1 {
		t.Fatalf("second push: %d %d %v", pushed, retired, err)
	}
	if _, _, err := st.Push(ctx, snap("m2", t0, "z")); err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(firstKey(f), "projects/p/databases/organizer/documents/users/u1/machines/") {
		t.Errorf("documents must live under the user: %s", firstKey(f))
	}
	snaps, err := st.Pull(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(snaps) != 2 || snaps[0].Machine != "m1" || len(snaps[0].Initiatives) != 1 || snaps[0].Initiatives[0].ID != "a" {
		t.Fatalf("pull: %+v", snaps)
	}
	if snaps[0].Initiatives[0].Cards[0].Next != "go" {
		t.Error("payload round trip lost the card")
	}
}

func firstKey(f *fakeFirestore) string {
	for k := range f.docs {
		return k
	}
	return ""
}

func TestOrderRoundTrip(t *testing.T) {
	st, _ := newStore(t)
	ctx := context.Background()
	if o, err := st.PullOrder(ctx); err != nil || len(o.Initiatives) != 0 {
		t.Fatalf("empty: %+v %v", o, err)
	}
	in := model.Order{Initiatives: []string{"b", "a"}, Cards: map[string][]string{"a": {"x"}}, UpdatedAt: time.Now()}
	if err := st.PushOrder(ctx, in); err != nil {
		t.Fatal(err)
	}
	out, err := st.PullOrder(ctx)
	if err != nil || out.Initiatives[0] != "b" || out.Cards["a"][0] != "x" {
		t.Fatalf("round trip: %+v %v", out, err)
	}
}
