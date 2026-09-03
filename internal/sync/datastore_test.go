package sync

import (
	"context"
	"testing"
	"time"

	"cloud.google.com/go/datastore"

	"organizer/internal/model"
)

// fakeClient stores entities by key name and answers the two query shapes
// this package issues. It does not evaluate filters generically.
type fakeClient struct {
	ents  map[string]*snapshotEntity
	order *orderEntity
}

func newFake() *fakeClient { return &fakeClient{ents: map[string]*snapshotEntity{}} }

func (f *fakeClient) PutMulti(_ context.Context, keys []*datastore.Key, src any) ([]*datastore.Key, error) {
	switch ents := src.(type) {
	case []*snapshotEntity:
		for i, k := range keys {
			cp := *ents[i]
			f.ents[k.Name] = &cp
		}
	case []*orderEntity:
		cp := *ents[0]
		f.order = &cp
	}
	return keys, nil
}

func (f *fakeClient) GetAll(_ context.Context, q *datastore.Query, dst any) ([]*datastore.Key, error) {
	switch out := dst.(type) {
	case *[]*snapshotEntity:
		for _, e := range f.ents {
			cp := *e
			*out = append(*out, &cp)
		}
	case *[]*orderEntity:
		if f.order != nil {
			cp := *f.order
			*out = append(*out, &cp)
		}
	}
	return nil, nil
}

func (f *fakeClient) Close() error { return nil }

func snap(machine string, at time.Time, ids ...string) model.Snapshot {
	s := model.Snapshot{Machine: machine, ScannedAt: at}
	for _, id := range ids {
		si := model.ScannedInitiative{ScannedAt: at}
		si.ID = id
		si.Client = "c"
		si.Cards = []model.Card{{Slug: "x", Status: model.StatusNow, Updated: "2026-09-01", Next: "go"}}
		s.Initiatives = append(s.Initiatives, si)
	}
	return s
}

func TestPushThenRetire(t *testing.T) {
	f := newFake()
	st := newWith(f, "test")
	ctx := context.Background()
	t0 := time.Date(2026, 9, 2, 10, 0, 0, 0, time.UTC)

	pushed, retired, err := st.Push(ctx, snap("m1", t0, "a", "b"))
	if err != nil || pushed != 2 || retired != 0 {
		t.Fatalf("first push: pushed=%d retired=%d err=%v", pushed, retired, err)
	}
	pushed, retired, err = st.Push(ctx, snap("m1", t0.Add(time.Hour), "a"))
	if err != nil || pushed != 1 || retired != 1 {
		t.Fatalf("second push: pushed=%d retired=%d err=%v", pushed, retired, err)
	}
	if f.ents["m1/b"].Present {
		t.Error("b should be retired")
	}
	if !f.ents["m1/a"].Present || f.ents["m1/a"].UpdatedAt.Format("2006-01-02") != "2026-09-01" {
		t.Errorf("a: %+v", f.ents["m1/a"])
	}
}

func TestPushRequiresMachine(t *testing.T) {
	st := newWith(newFake(), "test")
	if _, _, err := st.Push(context.Background(), model.Snapshot{}); err == nil {
		t.Fatal("expected error")
	}
}

func TestPullGroupsByMachine(t *testing.T) {
	f := newFake()
	st := newWith(f, "test")
	ctx := context.Background()
	t0 := time.Date(2026, 9, 2, 10, 0, 0, 0, time.UTC)
	if _, _, err := st.Push(ctx, snap("m2", t0, "z")); err != nil {
		t.Fatal(err)
	}
	if _, _, err := st.Push(ctx, snap("m1", t0.Add(time.Minute), "a", "b")); err != nil {
		t.Fatal(err)
	}
	// Fake ignores the present filter; a retired entity must still be handled upstream,
	// so keep everything present in this test.
	snaps, err := st.Pull(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(snaps) != 2 || snaps[0].Machine != "m1" || snaps[1].Machine != "m2" {
		t.Fatalf("snaps=%+v", snaps)
	}
	if len(snaps[0].Initiatives) != 2 || snaps[0].Initiatives[0].ID != "a" || snaps[0].Initiatives[0].Cards[0].Next != "go" {
		t.Errorf("m1 payload: %+v", snaps[0].Initiatives)
	}
	if !snaps[0].ScannedAt.Equal(t0.Add(time.Minute)) {
		t.Errorf("m1 scannedAt=%s", snaps[0].ScannedAt)
	}
}

func TestOrderRoundTrip(t *testing.T) {
	st := newWith(newFake(), "test")
	ctx := context.Background()
	if o, err := st.PullOrder(ctx); err != nil || len(o.Initiatives) != 0 {
		t.Fatalf("empty pull: %+v %v", o, err)
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
