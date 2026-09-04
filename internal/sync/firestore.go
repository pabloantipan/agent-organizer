// Package sync pushes this machine's snapshot to Firestore (native mode, REST)
// under the signed-in user's tree and pulls every machine's. Each machine
// writes only its own subtree, so there is nothing to merge at write time.
//
//	users/{uid}/machines/{machine}                      scanned_at, updated_at
//	users/{uid}/machines/{machine}/initiatives/{id}     payload, present, client, status, scanned_at, updated_at
//	users/{uid}/meta/order                              initiatives, cards, updated_at
package sync

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"sort"
	"strings"
	"time"

	"organizer/internal/model"
)

// BaseURL is a variable so tests can point at an httptest server.
var BaseURL = "https://firestore.googleapis.com/v1"

// ErrSignedOut mirrors auth.ErrSignedOut without importing it.
var ErrSignedOut = errors.New("signed out")

// TokenSource yields a valid Firebase ID token and the uid it belongs to.
type TokenSource interface {
	Token(ctx context.Context) (string, error)
	UID(ctx context.Context) (string, error)
}

type Store struct {
	project, database string
	ts                TokenSource
	http              *http.Client
}

// Open prepares a client. Nothing is contacted until the first call.
func Open(project, database string, ts TokenSource) (*Store, error) {
	if project == "" {
		return nil, errors.New("gcp_project is not set in the config")
	}
	if database == "" {
		database = "organizer"
	}
	return &Store{project: project, database: database, ts: ts, http: &http.Client{Timeout: 30 * time.Second}}, nil
}

func (s *Store) Close() error { return nil }

func (s *Store) root() string {
	return fmt.Sprintf("projects/%s/databases/%s/documents", s.project, s.database)
}

func (s *Store) userPath(uid string) string { return s.root() + "/users/" + url.PathEscape(uid) }

// ---- REST plumbing ----

func (s *Store) do(ctx context.Context, method, path string, body any, out any) error {
	tok, err := s.ts.Token(ctx)
	if err != nil {
		return err
	}
	var rd io.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		rd = bytes.NewReader(b)
	}
	req, err := http.NewRequestWithContext(ctx, method, BaseURL+"/"+path, rd)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+tok)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	res, err := s.http.Do(req)
	if err != nil {
		return fmt.Errorf("firestore: %w", err)
	}
	defer res.Body.Close()
	data, _ := io.ReadAll(res.Body)
	if res.StatusCode == 404 && method == http.MethodGet {
		return errNotFound
	}
	if res.StatusCode >= 400 {
		var e struct {
			Error struct {
				Message string `json:"message"`
				Status  string `json:"status"`
			} `json:"error"`
		}
		trimmed := bytes.TrimSpace(data)
		if len(trimmed) > 0 && trimmed[0] == '[' { // runQuery streams: errors come wrapped in an array
			var arr []json.RawMessage
			if json.Unmarshal(trimmed, &arr) == nil && len(arr) > 0 {
				trimmed = arr[0]
			}
		}
		_ = json.Unmarshal(trimmed, &e)
		if e.Error.Message == "" {
			e.Error.Message = res.Status
		}
		return fmt.Errorf("firestore %s: %s", e.Error.Status, e.Error.Message)
	}
	if out != nil && len(data) > 0 {
		return json.Unmarshal(data, out)
	}
	return nil
}

var errNotFound = errors.New("not found")

// Firestore value encoding, only the shapes this package writes.
type value map[string]any

func vStr(s string) value     { return value{"stringValue": s} }
func vBool(b bool) value      { return value{"booleanValue": b} }
func vTime(t time.Time) value { return value{"timestampValue": t.UTC().Format(time.RFC3339Nano)} }
func vInt(i int) value        { return value{"integerValue": fmt.Sprint(i)} }

type document struct {
	Name   string           `json:"name,omitempty"`
	Fields map[string]value `json:"fields"`
}

func str(f map[string]value, k string) string {
	if v, ok := f[k]; ok {
		if s, ok := v["stringValue"].(string); ok {
			return s
		}
	}
	return ""
}

func boolean(f map[string]value, k string) bool {
	if v, ok := f[k]; ok {
		if b, ok := v["booleanValue"].(bool); ok {
			return b
		}
	}
	return false
}

func ts(f map[string]value, k string) time.Time {
	if v, ok := f[k]; ok {
		if s, ok := v["timestampValue"].(string); ok {
			t, _ := time.Parse(time.RFC3339Nano, s)
			return t
		}
	}
	return time.Time{}
}

// ---- snapshots ----

// Push upserts every initiative under machines/{machine} and marks the ones
// this machine used to report, but no longer does, as absent.
func (s *Store) Push(ctx context.Context, snap model.Snapshot) (pushed int, retired int, err error) {
	if snap.Machine == "" {
		return 0, 0, errors.New("snapshot has no machine name")
	}
	uid, err := s.ts.UID(ctx)
	if err != nil {
		return 0, 0, err
	}
	machinePath := s.userPath(uid) + "/machines/" + url.PathEscape(snap.Machine)
	existing, err := s.listInitiativeIDs(ctx, machinePath)
	if err != nil {
		return 0, 0, err
	}
	current := map[string]bool{}
	var writes []map[string]any
	for _, si := range snap.Initiatives {
		current[si.ID] = true
		payload, err := json.Marshal(si)
		if err != nil {
			return 0, 0, err
		}
		writes = append(writes, map[string]any{"update": document{
			Name: machinePath + "/initiatives/" + url.PathEscape(si.ID),
			Fields: map[string]value{
				"machine":       vStr(snap.Machine),
				"initiative_id": vStr(si.ID),
				"client":        vStr(si.Client),
				"status":        vStr(si.Status),
				"scanned_at":    vTime(snap.ScannedAt),
				"updated_at":    vTime(si.LastUpdated()),
				"present":       vBool(true),
				"version":       vInt(1),
				"payload":       vStr(string(payload)),
			},
		}})
		pushed++
	}
	for _, id := range existing {
		if !current[id] {
			writes = append(writes, map[string]any{
				"update": document{
					Name:   machinePath + "/initiatives/" + url.PathEscape(id),
					Fields: map[string]value{"present": vBool(false), "scanned_at": vTime(snap.ScannedAt)},
				},
				"updateMask": map[string]any{"fieldPaths": []string{"present", "scanned_at"}},
			})
			retired++
		}
	}
	writes = append(writes, map[string]any{"update": document{
		Name:   machinePath,
		Fields: map[string]value{"machine": vStr(snap.Machine), "scanned_at": vTime(snap.ScannedAt)},
	}})
	for i := 0; i < len(writes); i += 200 {
		j := min(i+200, len(writes))
		if err := s.do(ctx, http.MethodPost, s.root()+":commit", map[string]any{"writes": writes[i:j]}, nil); err != nil {
			return 0, 0, fmt.Errorf("commit: %w", err)
		}
	}
	return pushed, retired, nil
}

func (s *Store) listInitiativeIDs(ctx context.Context, machinePath string) ([]string, error) {
	docs, err := s.listDocuments(ctx, machinePath+"/initiatives", "present")
	if err != nil {
		return nil, err
	}
	ids := make([]string, 0, len(docs))
	for _, d := range docs {
		ids = append(ids, lastSegment(d.Name))
	}
	return ids, nil
}

// listDocuments pages through a collection. mask limits the fields returned
// (empty = all). A missing collection is an empty list.
func (s *Store) listDocuments(ctx context.Context, collection, mask string) ([]document, error) {
	var out []document
	pageToken := ""
	for {
		var res struct {
			Documents     []document `json:"documents"`
			NextPageToken string     `json:"nextPageToken"`
		}
		q := "?pageSize=300"
		if mask != "" {
			q += "&mask.fieldPaths=" + url.QueryEscape(mask)
		}
		if pageToken != "" {
			q += "&pageToken=" + url.QueryEscape(pageToken)
		}
		if err := s.do(ctx, http.MethodGet, collection+q, nil, &res); err != nil {
			if errors.Is(err, errNotFound) {
				return nil, nil
			}
			return nil, err
		}
		out = append(out, res.Documents...)
		if res.NextPageToken == "" {
			return out, nil
		}
		pageToken = res.NextPageToken
	}
}

func lastSegment(name string) string {
	i := strings.LastIndex(name, "/")
	s, _ := url.PathUnescape(name[i+1:])
	return s
}

// Pull returns one Snapshot per machine, present initiatives only.
func (s *Store) Pull(ctx context.Context) ([]model.Snapshot, error) {
	uid, err := s.ts.UID(ctx)
	if err != nil {
		return nil, err
	}
	machines, err := s.listDocuments(ctx, s.userPath(uid)+"/machines", "machine")
	if err != nil {
		return nil, fmt.Errorf("list machines: %w", err)
	}
	var docs []document
	for _, m := range machines {
		part, err := s.listDocuments(ctx, m.Name+"/initiatives", "")
		if err != nil {
			return nil, fmt.Errorf("list initiatives: %w", err)
		}
		docs = append(docs, part...)
	}
	byMachine := map[string]*model.Snapshot{}
	for _, d := range docs {
		if !boolean(d.Fields, "present") {
			continue
		}
		f := d.Fields
		machine := str(f, "machine")
		snap := byMachine[machine]
		if snap == nil {
			snap = &model.Snapshot{Machine: machine}
			byMachine[machine] = snap
		}
		if at := ts(f, "scanned_at"); at.After(snap.ScannedAt) {
			snap.ScannedAt = at
		}
		var si model.ScannedInitiative
		if err := json.Unmarshal([]byte(str(f, "payload")), &si); err != nil {
			si = model.ScannedInitiative{Initiative: model.Initiative{ID: str(f, "initiative_id"), Client: str(f, "client"), Status: str(f, "status")}}
			si.Problems = []model.Problem{{Path: machine + "/" + si.ID, Msg: "remote payload undecodable: " + err.Error()}}
		}
		if si.ScannedAt.IsZero() {
			si.ScannedAt = ts(f, "scanned_at")
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

// ---- manual order ----

func (s *Store) orderPath(uid string) string { return s.userPath(uid) + "/meta/order" }

// PushOrder writes the manual order. Single user: last writer wins.
func (s *Store) PushOrder(ctx context.Context, o model.Order) error {
	if o.UpdatedAt.IsZero() {
		return nil
	}
	uid, err := s.ts.UID(ctx)
	if err != nil {
		return err
	}
	payload, _ := json.Marshal(o)
	doc := document{Fields: map[string]value{"updated_at": vTime(o.UpdatedAt), "payload": vStr(string(payload))}}
	return s.do(ctx, http.MethodPatch, s.orderPath(uid), doc, nil)
}

// PullOrder returns the remote order, or a zero Order when none exists.
func (s *Store) PullOrder(ctx context.Context) (model.Order, error) {
	uid, err := s.ts.UID(ctx)
	if err != nil {
		return model.Order{}, err
	}
	var d document
	if err := s.do(ctx, http.MethodGet, s.orderPath(uid), nil, &d); err != nil {
		if errors.Is(err, errNotFound) {
			return model.Order{}, nil
		}
		return model.Order{}, fmt.Errorf("get order: %w", err)
	}
	var o model.Order
	if p := str(d.Fields, "payload"); p != "" {
		if err := json.Unmarshal([]byte(p), &o); err != nil {
			return model.Order{}, err
		}
	}
	return o, nil
}
