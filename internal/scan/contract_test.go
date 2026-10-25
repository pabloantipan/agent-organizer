package scan

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"

	"organizer/internal/model"
	"organizer/internal/specpath"
)

// The working-on format's shared sample (contracts README, F2; leftovers-53
// FR-4): sample/ is an initiative root, expected.json what a reader must make
// of it. Both readers, the record and this scan, test against the same tree;
// neither keeps a copy. A missing sample fails, it never skips.

// contractsDir is ${CONTRACTS_DIR:-~/agent-slack/specs/contracts}.
func contractsDir(t *testing.T) string {
	t.Helper()
	if d := os.Getenv("CONTRACTS_DIR"); d != "" {
		return d
	}
	home, err := os.UserHomeDir()
	if err != nil {
		t.Fatalf("contracts dir: no CONTRACTS_DIR and no home: %v", err)
	}
	return filepath.Join(home, "agent-slack", "specs", "contracts")
}

type contractCard struct {
	Slug       string   `json:"slug"`
	Path       string   `json:"path"`
	Status     string   `json:"status"`
	Seat       *string  `json:"seat"`
	Stage      *string  `json:"stage"`
	Repos      []string `json:"repos"`
	DependsOn  []string `json:"depends_on"`
	Boundary   []string `json:"boundary"`
	Threads    []string `json:"threads"`
	Spec       []string `json:"spec"`
	DoneFolder bool     `json:"done_folder"`
}

type contractDecision struct {
	Number        string   `json:"number"`
	Status        string   `json:"status"`
	Class         string   `json:"class"`
	SupersededBy  *string  `json:"superseded_by"`
	Stage         *string  `json:"stage"`
	Cards         []string `json:"cards"`
	Supersedes    []string `json:"supersedes"`
	RuledByIsMode bool     `json:"ruled_by_is_mode"`
}

type contractStage struct {
	ID       string           `json:"id"`
	Phase    string           `json:"phase"`
	Done     string           `json:"done"`
	Gates    []string         `json:"gates"`
	Appetite string           `json:"appetite"`
	Exit     []model.ExitItem `json:"exit"`
}

type contract struct {
	Root     string `json:"root"`
	Accepted struct {
		DecisionStatuses map[string]any `json:"decision_statuses"`
		RuledByModes     []string       `json:"ruled_by_modes"`
		Ledgers          struct {
			Names []string `json:"names"`
		} `json:"ledgers"`
	} `json:"accepted_reading"`
	Initiative struct {
		ID     string `json:"id"`
		Title  string `json:"title"`
		Status string `json:"status"`
	} `json:"initiative"`
	Cards        []contractCard     `json:"cards"`
	Decisions    []contractDecision `json:"decisions"`
	Stages       []contractStage    `json:"stages"`
	CurrentStage string             `json:"current_stage"`
	Specs        []struct {
		Path string `json:"path"`
	} `json:"specs"`
	Skipped  []string `json:"skipped_silently"`
	Problems []struct {
		Path   string `json:"path"`
		Unread bool   `json:"unread"`
		Reason string `json:"reason"`
	} `json:"problems"`
}

// loadContract reads <dir>/working-on/expected.json and checks its sample
// root exists. Either missing is an error naming it (F4).
func loadContract(dir string) (contract, string, error) {
	var c contract
	wo := filepath.Join(dir, "working-on")
	b, err := os.ReadFile(filepath.Join(wo, "expected.json"))
	if err != nil {
		return c, "", fmt.Errorf("working-on contract sample missing: %w (set CONTRACTS_DIR or check out ~/agent-slack/specs)", err)
	}
	if err := json.Unmarshal(b, &c); err != nil {
		return c, "", fmt.Errorf("working-on contract expected.json: %w", err)
	}
	root := filepath.Join(wo, c.Root)
	if st, err := os.Stat(filepath.Join(root, "working-on")); err != nil || !st.IsDir() {
		return c, "", fmt.Errorf("working-on contract sample missing: no %s", filepath.Join(root, "working-on"))
	}
	return c, root, nil
}

func TestLoadContractMissingFails(t *testing.T) {
	_, _, err := loadContract(t.TempDir())
	if err == nil || !strings.Contains(err.Error(), "working-on contract sample missing") {
		t.Fatalf("an empty contracts dir must be an error naming the missing sample, got %v", err)
	}
}

// TestWorkingOnContract is F1-F3: the scan's reading of the shared sample,
// field by field against expected.json. With CONTRACTS_DIR pointing at an
// empty dir it fails naming the sample (F4).
func TestWorkingOnContract(t *testing.T) {
	want, root, err := loadContract(contractsDir(t))
	if err != nil {
		t.Fatal(err)
	}
	si := ReadInitiative(root, Options{})
	rel := func(p string) string {
		r, err := filepath.Rel(root, p)
		if err != nil {
			return p
		}
		return filepath.ToSlash(r)
	}

	if si.ID != want.Initiative.ID || si.Title != want.Initiative.Title || si.Status != want.Initiative.Status {
		t.Errorf("initiative = %q %q %q, want %+v", si.ID, si.Title, si.Status, want.Initiative)
	}

	unread := map[string]bool{}
	for _, p := range si.Problems {
		if p.Unread {
			unread[rel(p.Path)] = true
		}
	}

	t.Run("cards", func(t *testing.T) {
		got := map[string]model.Card{}
		for _, c := range si.Cards {
			if !unread[rel(c.Path)] { // an unread file contributes nothing else
				got[rel(c.Path)] = c
			}
		}
		var paths []string
		for _, w := range want.Cards {
			paths = append(paths, w.Path)
			c, ok := got[w.Path]
			if !ok {
				t.Errorf("%s: not read (unread: %v)", w.Path, unread[w.Path])
				continue
			}
			eq := func(field string, got, want any) {
				if !reflect.DeepEqual(got, want) {
					t.Errorf("%s %s = %#v, want %#v", w.Path, field, got, want)
				}
			}
			eq("slug", c.Slug, w.Slug)
			eq("status", c.Status, w.Status)
			eq("done folder", c.Archived, w.DoneFolder)
			if w.Seat != nil {
				eq("seat", c.Seat, *w.Seat)
			}
			if w.Stage != nil {
				eq("stage", c.Stage, *w.Stage)
			}
			for _, l := range []struct {
				name      string
				got, want []string
			}{
				{"repos", c.Repos, w.Repos}, {"depends_on", c.DependsOn, w.DependsOn},
				{"boundary", c.Boundary, w.Boundary}, {"threads", c.Threads, w.Threads},
				{"spec", c.SpecRefs, w.Spec},
			} {
				if l.want != nil {
					eq(l.name, l.got, l.want)
				}
			}
			if len(w.Spec) > 0 {
				eq("spec launched against", c.Spec, w.Spec[0])
			}
		}
		for p := range got {
			if !slices.Contains(paths, p) {
				t.Errorf("%s read as a card; expected.json has no such card", p)
			}
		}
	})

	t.Run("decisions", func(t *testing.T) {
		if len(si.Decisions) != len(want.Decisions) {
			t.Fatalf("%d decisions read, want %d", len(si.Decisions), len(want.Decisions))
		}
		for i, w := range want.Decisions {
			d := si.Decisions[i]
			if d.Number != w.Number || d.Status != w.Status {
				t.Errorf("decision %d = %s %q, want %s %q", i, d.Number, d.Status, w.Number, w.Status)
				continue
			}
			class := "closed"
			if d.Open() {
				class = "open"
			} else if d.Decided() {
				class = "decided"
			}
			if class != w.Class {
				t.Errorf("%s (%s) class %s, want %s", d.Number, d.Status, class, w.Class)
			}
			if d.Open() && d.Decided() {
				t.Errorf("%s is both open and decided", d.Number)
			}
			if w.SupersededBy != nil && d.SupersededBy != *w.SupersededBy {
				t.Errorf("%s superseded_by %q, want %q", d.Number, d.SupersededBy, *w.SupersededBy)
			}
			if w.Stage != nil && d.Stage != *w.Stage {
				t.Errorf("%s stage %q, want %q", d.Number, d.Stage, *w.Stage)
			}
			if w.Cards != nil && !reflect.DeepEqual(d.Cards, w.Cards) {
				t.Errorf("%s cards %v, want %v", d.Number, d.Cards, w.Cards)
			}
			if w.Supersedes != nil && !reflect.DeepEqual(d.Supersedes, w.Supersedes) {
				t.Errorf("%s supersedes %v, want %v", d.Number, d.Supersedes, w.Supersedes)
			}
			if w.RuledByIsMode {
				if !slices.Contains(want.Accepted.RuledByModes, d.RuledBy) {
					t.Errorf("%s ruled_by %q is not shown as written (modes %v)", d.Number, d.RuledBy, want.Accepted.RuledByModes)
				}
				if d.Ruler() != "" {
					t.Errorf("%s: the mode %q counted as ruler %q", d.Number, d.RuledBy, d.Ruler())
				}
			} else if d.RuledBy != "" && d.Ruler() != d.RuledBy {
				t.Errorf("%s: ruler %q, want %q", d.Number, d.Ruler(), d.RuledBy)
			}
		}
		// Every status the contract lists reads the way it classes it.
		for class, v := range want.Accepted.DecisionStatuses {
			list, ok := v.([]any)
			if !ok {
				continue // the note
			}
			for _, s := range list {
				st := s.(string)
				if !model.ValidDecisionStatus(st) {
					t.Errorf("decision status %q (%s) is not valid", st, class)
				}
				if got := model.DecisionOpen(st); got != (class == "open") {
					t.Errorf("decision status %q open = %v, contract class %s", st, got, class)
				}
				if got := model.DecisionDecided(st); got != (class == "decided") {
					t.Errorf("decision status %q decided = %v, contract class %s", st, got, class)
				}
			}
		}
		if !reflect.DeepEqual(model.RuledByModes, want.Accepted.RuledByModes) {
			t.Errorf("model.RuledByModes = %q, contract %q", model.RuledByModes, want.Accepted.RuledByModes)
		}
	})

	t.Run("stages", func(t *testing.T) {
		if len(si.Stages) != len(want.Stages) {
			t.Fatalf("%d stages read, want %d", len(si.Stages), len(want.Stages))
		}
		for i, w := range want.Stages {
			s := si.Stages[i]
			if s.ID != w.ID || s.Phase != w.Phase || s.Done != w.Done || s.Appetite != w.Appetite {
				t.Errorf("stage %d = %q %q %q %q, want %+v", i, s.ID, s.Phase, s.Done, s.Appetite, w)
			}
			if w.Gates != nil && !reflect.DeepEqual(s.Gates, w.Gates) {
				t.Errorf("stage %s gates %v, want %v", s.ID, s.Gates, w.Gates)
			}
			if !reflect.DeepEqual(s.Exit, w.Exit) {
				t.Errorf("stage %s exit %+v, want %+v", s.ID, s.Exit, w.Exit)
			}
		}
		if cur, ok := model.CurrentStage(si.Stages); !ok || cur.ID != want.CurrentStage {
			t.Errorf("current stage %+v (%v), want %s", cur, ok, want.CurrentStage)
		}
	})

	t.Run("specs", func(t *testing.T) {
		// The scan resolves a spec through the cards that name it (their
		// first reference, as the spec reader does); its title and status
		// are the reader's (service.ReadSpec), not the scan's.
		named := map[string]bool{}
		for _, c := range si.Cards {
			if p, ok := specpath.Card(c.Spec); ok {
				named[p] = true
			}
		}
		for _, w := range want.Specs {
			if !named[w.Path] {
				t.Errorf("spec %s is named by no card read", w.Path)
			}
			if _, err := os.Stat(filepath.Join(root, filepath.FromSlash(w.Path))); err != nil {
				t.Errorf("spec %s: %v", w.Path, err)
			}
		}
	})

	t.Run("ledgers", func(t *testing.T) {
		for _, name := range want.Accepted.Ledgers.Names {
			if !isLedger(filepath.Join(root, "working-on", name)) {
				t.Errorf("%s is not a ledger", name)
			}
		}
		for _, p := range want.Skipped {
			for _, c := range si.Cards {
				if rel(c.Path) == p {
					t.Errorf("%s read as a card; it is a ledger", p)
				}
			}
			for _, pr := range si.Problems {
				if rel(pr.Path) == p {
					t.Errorf("%s: problem %q; a ledger is skipped silently", p, pr.Msg)
				}
			}
		}
	})

	t.Run("problems", func(t *testing.T) {
		got := map[string][]model.Problem{}
		for _, p := range si.Problems {
			got[rel(p.Path)] = append(got[rel(p.Path)], p)
		}
		for _, w := range want.Problems {
			ps := got[w.Path]
			delete(got, w.Path)
			if len(ps) != 1 {
				t.Errorf("%s: %d problems %+v, want one: %s", w.Path, len(ps), ps, w.Reason)
				continue
			}
			if ps[0].Unread != w.Unread {
				t.Errorf("%s: unread %v, want %v (%s)", w.Path, ps[0].Unread, w.Unread, ps[0].Msg)
			}
			// An unread problem's reason is the parser's words; expected.json
			// describes it in prose. A reported one is the scan's own words.
			if !w.Unread && ps[0].Msg != w.Reason {
				t.Errorf("%s: problem %q, want %q", w.Path, ps[0].Msg, w.Reason)
			}
		}
		for p, ps := range got {
			for _, pr := range ps {
				t.Errorf("%s: unexpected problem %q (unread %v)", p, pr.Msg, pr.Unread)
			}
		}
	})
}
