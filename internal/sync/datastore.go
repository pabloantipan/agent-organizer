// Package sync pushes this machine's snapshot to Datastore and pulls every
// machine's. Each machine writes only its own keys, so there is nothing to
// merge at write time.
package sync

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"time"

	"cloud.google.com/go/datastore"

	"organizer/internal/model"
)

const (
	KindSnapshot  = "Snapshot"
	schemaVersion = 1
	putBatch      = 400
)

// ErrNoProject is returned when sync is attempted without a configured project.
var ErrNoProject = errors.New("gcp_project is not set in the config; sync is disabled")

// snapshotEntity is one initiative as seen by one machine.
type snapshotEntity struct {
	Machine      string    `datastore:"machine"`
	InitiativeID string    `datastore:"initiativeId"`
	Client       string    `datastore:"client"`
	Status       string    `datastore:"status"`
	ScannedAt    time.Time `datastore:"scannedAt"`
	UpdatedAt    time.Time `datastore:"updatedAt"`
	Present      bool      `datastore:"present"`
	Version      int       `datastore:"version"`
	Payload      []byte    `datastore:"payload,noindex"`
}

type Store struct {
	c         dsClient
	namespace string
	project   string
}

// Open connects with Application Default Credentials. The emulator is picked
// up transparently through DATASTORE_EMULATOR_HOST.
func Open(ctx context.Context, project, namespace string) (*Store, error) {
	if project == "" {
		return nil, ErrNoProject
	}
	c, err := datastore.NewClient(ctx, project)
	if err != nil {
		return nil, fmt.Errorf("datastore client: %w", err)
	}
	return &Store{c: c, namespace: namespace, project: project}, nil
}

func newWith(c dsClient, namespace string) *Store { return &Store{c: c, namespace: namespace} }

func (s *Store) Close() error { return s.c.Close() }

func (s *Store) key(machine, id string) *datastore.Key {
	k := datastore.NameKey(KindSnapshot, machine+"/"+id, nil)
	k.Namespace = s.namespace
	return k
}

// Push upserts every initiative in snap under this machine's keys and marks
// initiatives that this machine used to report, but no longer does, as absent.
func (s *Store) Push(ctx context.Context, snap model.Snapshot) (pushed int, retired int, err error) {
	if snap.Machine == "" {
		return 0, 0, errors.New("snapshot has no machine name")
	}
	existing, err := s.entitiesFor(ctx, snap.Machine)
	if err != nil {
		return 0, 0, err
	}
	current := map[string]bool{}
	var keys []*datastore.Key
	var ents []*snapshotEntity
	for _, si := range snap.Initiatives {
		current[si.ID] = true
		payload, err := json.Marshal(si)
		if err != nil {
			return 0, 0, err
		}
		keys = append(keys, s.key(snap.Machine, si.ID))
		ents = append(ents, &snapshotEntity{
			Machine:      snap.Machine,
			InitiativeID: si.ID,
			Client:       si.Client,
			Status:       si.Status,
			ScannedAt:    snap.ScannedAt,
			UpdatedAt:    si.LastUpdated(),
			Present:      true,
			Version:      schemaVersion,
			Payload:      payload,
		})
	}
	pushed = len(keys)
	for _, e := range existing {
		if e.Present && !current[e.InitiativeID] {
			e.Present = false
			e.ScannedAt = snap.ScannedAt
			keys = append(keys, s.key(e.Machine, e.InitiativeID))
			ents = append(ents, e)
			retired++
		}
	}
	for i := 0; i < len(keys); i += putBatch {
		j := min(i+putBatch, len(keys))
		if _, err := s.c.PutMulti(ctx, keys[i:j], ents[i:j]); err != nil {
			return 0, 0, fmt.Errorf("put: %w", err)
		}
	}
	return pushed, retired, nil
}

func (s *Store) entitiesFor(ctx context.Context, machine string) ([]*snapshotEntity, error) {
	q := datastore.NewQuery(KindSnapshot).Namespace(s.namespace).FilterField("machine", "=", machine)
	var out []*snapshotEntity
	if _, err := s.c.GetAll(ctx, q, &out); err != nil {
		return nil, fmt.Errorf("query: %w", err)
	}
	return out, nil
}

// Pull returns one Snapshot per machine, present initiatives only, machines
// sorted by name. Payloads that fail to decode are skipped with a Problem.
func (s *Store) Pull(ctx context.Context) ([]model.Snapshot, error) {
	q := datastore.NewQuery(KindSnapshot).Namespace(s.namespace).FilterField("present", "=", true)
	var ents []*snapshotEntity
	if _, err := s.c.GetAll(ctx, q, &ents); err != nil {
		return nil, fmt.Errorf("query: %w", err)
	}
	byMachine := map[string]*model.Snapshot{}
	for _, e := range ents {
		snap := byMachine[e.Machine]
		if snap == nil {
			snap = &model.Snapshot{Machine: e.Machine}
			byMachine[e.Machine] = snap
		}
		if e.ScannedAt.After(snap.ScannedAt) {
			snap.ScannedAt = e.ScannedAt
		}
		var si model.ScannedInitiative
		if err := json.Unmarshal(e.Payload, &si); err != nil {
			si = model.ScannedInitiative{Initiative: model.Initiative{ID: e.InitiativeID, Client: e.Client, Status: e.Status}}
			si.Problems = []model.Problem{{Path: e.Machine + "/" + e.InitiativeID, Msg: "remote payload undecodable: " + err.Error()}}
		}
		if si.ScannedAt.IsZero() {
			si.ScannedAt = e.ScannedAt
		}
		snap.Initiatives = append(snap.Initiatives, si)
	}
	out := make([]model.Snapshot, 0, len(byMachine))
	for _, snap := range byMachine {
		sort.Slice(snap.Initiatives, func(i, j int) bool { return snap.Initiatives[i].ID < snap.Initiatives[j].ID })
		out = append(out, *snap)
	}
	sort.Slice(out, func(i, j int) bool { return out[i].Machine < out[j].Machine })
	return out, nil
}

const KindOrder = "Order"

type orderEntity struct {
	UpdatedAt time.Time `datastore:"updatedAt"`
	Payload   []byte    `datastore:"payload,noindex"`
}

func (s *Store) orderKey() *datastore.Key {
	k := datastore.NameKey(KindOrder, "global", nil)
	k.Namespace = s.namespace
	return k
}

// PushOrder writes the manual order. Single user: last writer wins.
func (s *Store) PushOrder(ctx context.Context, o model.Order) error {
	if o.UpdatedAt.IsZero() {
		return nil
	}
	payload, err := json.Marshal(o)
	if err != nil {
		return err
	}
	_, err = s.c.PutMulti(ctx, []*datastore.Key{s.orderKey()}, []*orderEntity{{UpdatedAt: o.UpdatedAt, Payload: payload}})
	return err
}

// PullOrder returns the remote order, or a zero Order when none exists.
func (s *Store) PullOrder(ctx context.Context) (model.Order, error) {
	q := datastore.NewQuery(KindOrder).Namespace(s.namespace)
	var ents []*orderEntity
	if _, err := s.c.GetAll(ctx, q, &ents); err != nil {
		return model.Order{}, fmt.Errorf("query order: %w", err)
	}
	var o model.Order
	for _, e := range ents {
		if err := json.Unmarshal(e.Payload, &o); err != nil {
			return model.Order{}, err
		}
	}
	return o, nil
}
