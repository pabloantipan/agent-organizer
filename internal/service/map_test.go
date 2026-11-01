package service

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"organizer/internal/cache"
	"organizer/internal/model"
)

// The map reader's gate rows (docs/specs/leftovers-58.md R1, R2). The
// fixture is testdata/fixture-map/ (its README names the contract pin);
// R1 also reads $CONTRACTS_DIR/c4-map/ and skips, saying so, when it is
// unset. X0 sets it.

func fixtureMapDir(t *testing.T, name string) string {
	t.Helper()
	p, err := filepath.Abs(filepath.Join("..", "..", "testdata", "fixture-map", name))
	if err != nil {
		t.Fatal(err)
	}
	return p
}

// mapContractDir is $CONTRACTS_DIR/c4-map, or a skip naming the variable.
func mapContractDir(t *testing.T) string {
	t.Helper()
	d := os.Getenv("CONTRACTS_DIR")
	if d == "" {
		t.Skip("CONTRACTS_DIR is unset: set it to a checkout of agent-mailbox-specs/contracts at 54cf10d or later to read contracts/c4-map/ (X0 sets it)")
	}
	return filepath.Join(d, "c4-map")
}

// sameJSON says whether two JSON documents hold the same values, key order
// aside (a Go map encodes its keys sorted; map.json's inputs are in
// initiative.yaml's order).
func sameJSON(t *testing.T, a, b []byte) bool {
	t.Helper()
	var x, y any
	if err := json.Unmarshal(a, &x); err != nil {
		t.Fatalf("decode: %v", err)
	}
	if err := json.Unmarshal(b, &y); err != nil {
		t.Fatalf("decode: %v", err)
	}
	return reflect.DeepEqual(x, y)
}

// wantDrawn checks R1's expectation for one root: the index equals
// map.json, and each level's source is its page's mermaid block, the
// block in mermaidOf.
func wantDrawn(t *testing.T, root string, mermaidOf map[string]string) {
	t.Helper()
	r := ReadMap(root)
	if r.State != MapDrawn || r.Refused != "" {
		t.Fatalf("state %q refused %q, want drawn", r.State, r.Refused)
	}
	file, err := os.ReadFile(filepath.Join(root, "docs", "architecture", "map.json"))
	if err != nil {
		t.Fatal(err)
	}
	again, err := json.Marshal(r.Index)
	if err != nil {
		t.Fatal(err)
	}
	if !sameJSON(t, file, again) {
		t.Fatalf("the index encoded again is not map.json:\n%s", again)
	}
	if len(r.Levels) != len(r.Index.Levels) {
		t.Fatalf("%d level sources for %d levels", len(r.Levels), len(r.Index.Levels))
	}
	for i, l := range r.Index.Levels {
		got := r.Levels[i]
		if got.Level != l.Level || got.Page != l.Page || got.Container != l.Container {
			t.Errorf("level %d is %+v, index says %+v", i, got, l)
		}
		want, ok := mermaidOf[l.Page]
		if !ok {
			t.Fatalf("no expected block for %s", l.Page)
		}
		if got.Source != want {
			t.Errorf("%s source:\n%q\nwant\n%q", l.Page, got.Source, want)
		}
	}
}

// The blocks as the pages hold them, written out by hand so the test does
// not trust the extractor it checks.
const (
	harborContextBlock    = "flowchart LR\n    %% c4: context\n    clerk[\"Clerk\"]\n    traveller[\"Traveller\"]\n    harbor[\"Harbor<br/>ferry-ticket shop\"]\n    card_gateway[\"Card gateway\"]\n    mail_relay[\"Mail relay\"]\n    clerk --> harbor\n    traveller --> harbor\n    harbor --> card_gateway\n    harbor --> mail_relay\n"
	harborContainersBlock = "---\nconfig:\n  layout: elk\n---\nflowchart LR\n    %% c4: containers\n    subgraph harbor[\"Harbor ferry-ticket shop\"]\n        harbor_api[\"harbor-api\"]\n        harbor_db[(\"harbor_db\")]\n        ledger[\"harbor-ledger\"]\n        web[\"harbor-web\"]\n    end\n    card_gateway([\"Card gateway\"])\n    mail_relay([\"Mail relay\"])\n    harbor_api --> card_gateway\n    harbor_api --> harbor_db\n    harbor_api --> ledger\n    web --> harbor_api\n"
	harborModulesBlock    = "flowchart LR\n    %% c4: modules harbor_api\n    subgraph harbor_api[\"harbor-api\"]\n        harbor_api__booking[\"booking\"]\n        harbor_api__pricing[\"pricing\"]\n    end\n"
)

var harborBlocks = map[string]string{
	"context.md":    harborContextBlock,
	"containers.md": harborContainersBlock,
	"modules.md":    harborModulesBlock,
}

// R1 over the fixture: harbor and the two drawn variants.
func TestMapFixture(t *testing.T) {
	for _, name := range []string{"harbor", "harbor-ruled", "harbor-ungrounded"} {
		t.Run(name, func(t *testing.T) { wantDrawn(t, fixtureMapDir(t, name), harborBlocks) })
	}
}

// R1's variants hold what the lens's rows need: a ruled node whose record
// exists, a retiring node, and an ungrounded node with status null.
func TestMapFixtureVariants(t *testing.T) {
	node := func(r MapResult, id, level string) C4Node {
		for _, n := range r.Index.Nodes {
			if n.ID == id && n.Level == level {
				return n
			}
		}
		t.Fatalf("no node %s at %s", id, level)
		return C4Node{}
	}
	ruledRoot := fixtureMapDir(t, "harbor-ruled")
	r := ReadMap(ruledRoot)
	ledger := node(r, "ledger", "containers")
	if ledger.Status == nil || *ledger.Status != "ruled" || len(ledger.Grounding) != 1 || ledger.Grounding[0] != (C4Evidence{Kind: "record", Ref: "0002"}) {
		t.Errorf("ledger = %+v, want ruled by record 0002", ledger)
	}
	recs, _ := filepath.Glob(filepath.Join(ruledRoot, "working-on", "decisions", "0002-*.md"))
	if len(recs) != 1 {
		t.Errorf("record 0002 files: %v, want one", recs)
	}
	if web := node(r, "web", "containers"); web.Status == nil || *web.Status != "retiring" {
		t.Errorf("web = %+v, want retiring", web)
	}
	u := ReadMap(fixtureMapDir(t, "harbor-ungrounded"))
	mr := node(u, "mail_relay", "containers")
	if mr.Status != nil || mr.Kind != nil || mr.Grounding == nil || len(mr.Grounding) != 0 {
		t.Errorf("mail_relay = %+v, want status and kind null, grounding []", mr)
	}
	b, _ := json.Marshal(mr)
	if !bytes.Contains(b, []byte(`"status":null`)) || !bytes.Contains(b, []byte(`"grounding":[]`)) {
		t.Errorf("mail_relay encodes as %s, want status null and grounding []", b)
	}
}

// R1 over the contract: expected.json is the index as given, the expected
// pages' blocks the sources. The contract has no context page among its
// outputs, so the fixture's (claudecode 92890ed) stands beside them.
func TestMapContract(t *testing.T) {
	c := mapContractDir(t)
	root := t.TempDir()
	dir := filepath.Join(root, "docs", "architecture")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	for src, dst := range map[string]string{
		filepath.Join(c, "expected.json"):                                               "map.json",
		filepath.Join(c, "expected-containers.md"):                                      "containers.md",
		filepath.Join(c, "expected-modules.md"):                                         "modules.md",
		filepath.Join(fixtureMapDir(t, "harbor"), "docs", "architecture", "context.md"): "context.md",
	} {
		b, err := os.ReadFile(src)
		if err != nil {
			t.Fatalf("contract file %s is missing: %v (CONTRACTS_DIR at agent-mailbox-specs 54cf10d or later)", src, err)
		}
		if err := os.WriteFile(filepath.Join(dir, dst), b, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	wantDrawn(t, root, harborBlocks)
	// The fixture's harbor is the contract's, byte for byte.
	for src, dst := range map[string]string{"expected.json": "map.json", "expected-containers.md": "containers.md", "expected-modules.md": "modules.md"} {
		a, _ := os.ReadFile(filepath.Join(c, src))
		b, _ := os.ReadFile(filepath.Join(fixtureMapDir(t, "harbor"), "docs", "architecture", dst))
		if !bytes.Equal(a, b) {
			t.Errorf("testdata/fixture-map/harbor/docs/architecture/%s differs from the contract's %s", dst, src)
		}
	}
}

// copyTree copies the fixture root into a temp dir so a case can break it.
func copyTree(t *testing.T, src string) string {
	t.Helper()
	dst := t.TempDir()
	err := filepath.Walk(src, func(p string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		rel, _ := filepath.Rel(src, p)
		out := filepath.Join(dst, rel)
		if info.IsDir() {
			return os.MkdirAll(out, 0o755)
		}
		b, err := os.ReadFile(p)
		if err != nil {
			return err
		}
		return os.WriteFile(out, b, 0o644)
	})
	if err != nil {
		t.Fatal(err)
	}
	return dst
}

// wantRefused checks R2: the one line, and nothing of a map beside it.
func wantRefused(t *testing.T, r MapResult, line string) {
	t.Helper()
	if r.State != MapRefused || r.Refused != line {
		t.Errorf("got state %q line %q, want refused %q", r.State, r.Refused, line)
	}
	if r.Index != nil || r.Levels != nil {
		t.Errorf("a refusal carries part of a map: index %v, levels %v", r.Index, r.Levels)
	}
}

// R2: every way a map is not drawn, each with its line and no partial map.
func TestMapRefuses(t *testing.T) {
	arch := func(root string) string { return filepath.Join(root, "docs", "architecture") }
	write := func(t *testing.T, p, s string) {
		t.Helper()
		if err := os.WriteFile(p, []byte(s), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	t.Run("c4-map/2", func(t *testing.T) {
		wantRefused(t, ReadMap(fixtureMapDir(t, "harbor-v2")), "Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1")
	})
	t.Run("missing is the empty state", func(t *testing.T) {
		r := ReadMap(fixtureMapDir(t, "harbor-nomap"))
		if r.State != MapEmpty || r.Refused != "" || r.Index != nil || r.Levels != nil {
			t.Errorf("got %+v, want only state empty", r)
		}
		b, _ := json.Marshal(r)
		if string(b) != `{"state":"empty"}` {
			t.Errorf("empty encodes as %s", b)
		}
	})
	t.Run("not JSON", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		write(t, filepath.Join(arch(root), "map.json"), "schema: c4-map/1\n")
		r := ReadMap(root)
		if !strings.HasPrefix(r.Refused, "Map not drawn: map.json is not JSON: ") {
			t.Errorf("line %q", r.Refused)
		}
		wantRefused(t, r, r.Refused)
	})
	t.Run("truncated JSON", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		b, _ := os.ReadFile(filepath.Join(arch(root), "map.json"))
		write(t, filepath.Join(arch(root), "map.json"), string(b[:len(b)/2]))
		r := ReadMap(root)
		if !strings.HasPrefix(r.Refused, "Map not drawn: map.json is not JSON: ") {
			t.Errorf("line %q", r.Refused)
		}
		wantRefused(t, r, r.Refused)
	})
	t.Run("a page with no block", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		write(t, filepath.Join(arch(root), "modules.md"), "# harbor: modules\n\n```\nflowchart LR\n```\n\nNo mermaid here.\n")
		wantRefused(t, ReadMap(root), "Map not drawn: modules.md has no mermaid block (the modules level)")
	})
	t.Run("a block never closed", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		write(t, filepath.Join(arch(root), "context.md"), "# context\n\n```mermaid\nflowchart LR\n    a --> b\n")
		wantRefused(t, ReadMap(root), "Map not drawn: context.md has no mermaid block (the context level)")
	})
	t.Run("a page missing", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		if err := os.Remove(filepath.Join(arch(root), "context.md")); err != nil {
			t.Fatal(err)
		}
		wantRefused(t, ReadMap(root), "Map not drawn: context.md is missing (the context level)")
	})
	t.Run("a page outside docs/architecture", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		b, _ := os.ReadFile(filepath.Join(arch(root), "map.json"))
		write(t, filepath.Join(arch(root), "map.json"), strings.Replace(string(b), `"page": "modules.md"`, `"page": "../../working-on/initiative.yaml"`, 1))
		wantRefused(t, ReadMap(root), `Map not drawn: the modules level's page "../../working-on/initiative.yaml" is not a path under docs/architecture/`)
	})
	t.Run("no schema", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		write(t, filepath.Join(arch(root), "map.json"), `{"initiative":"harbor"}`)
		wantRefused(t, ReadMap(root), "Map not drawn: map.json has no schema; this Deltagos reads c4-map/1")
	})
	t.Run("a field c4-map/1 lacks", func(t *testing.T) {
		root := copyTree(t, fixtureMapDir(t, "harbor"))
		b, _ := os.ReadFile(filepath.Join(arch(root), "map.json"))
		write(t, filepath.Join(arch(root), "map.json"), strings.Replace(string(b), `"system": "harbor",`, `"system": "harbor", "extra": 1,`, 1))
		wantRefused(t, ReadMap(root), `Map not drawn: map.json does not match c4-map/1: json: unknown field "extra"`)
	})
}

// R2's FR-3, and the service's lookup: local wins, a remote-only initiative
// is refused with nothing read, an unknown one is an error.
func TestMapRemote(t *testing.T) {
	remote := model.ScannedInitiative{}
	remote.ID = "harbor"
	// A path that would fail loudly if it were read.
	remote.Path = filepath.Join(t.TempDir(), "never-read")
	s := &Service{state: cache.State{
		Local:  model.Snapshot{Machine: "lodestar"},
		Remote: []model.Snapshot{{Machine: "odyssey", Initiatives: []model.ScannedInitiative{remote}}},
	}}
	r, err := s.Map("harbor")
	if err != nil {
		t.Fatal(err)
	}
	wantRefused(t, r, "Map not drawn: the map is read on odyssey")

	local := model.ScannedInitiative{}
	local.ID = "harbor"
	local.Path = fixtureMapDir(t, "harbor")
	s.state.Local.Initiatives = []model.ScannedInitiative{local}
	r, err = s.Map("harbor")
	if err != nil || r.State != MapDrawn {
		t.Errorf("local harbor: %+v, %v; want drawn", r.State, err)
	}

	if _, err := s.Map("nowhere"); err == nil || err.Error() != "no initiative nowhere on this machine" {
		t.Errorf("unknown initiative: %v", err)
	}
}

// The extractor on its own: the first block only, CRLF, indented fences.
func TestFirstMermaid(t *testing.T) {
	for _, tc := range []struct {
		name, page, want string
		ok               bool
	}{
		{"empty page", "", "", false},
		{"first of two", "```mermaid\na\n```\n```mermaid\nb\n```\n", "a\n", true},
		{"skips other fences", "```go\nx\n```\n```mermaid\nb\n```\n", "b\n", true},
		{"crlf", "```mermaid\r\nflowchart LR\r\n```\r\n", "flowchart LR\n", true},
		{"spaces around the info string", "   ```  mermaid  \nx\n   ```\n", "x\n", true},
		{"empty block", "```mermaid\n```\n", "", true},
		{"mermaidx is another language", "```mermaidx\nx\n```\n", "", false},
	} {
		t.Run(tc.name, func(t *testing.T) {
			got, ok := firstMermaid([]byte(tc.page))
			if got != tc.want || ok != tc.ok {
				t.Errorf("got %q %v, want %q %v", got, ok, tc.want, tc.ok)
			}
		})
	}
}
