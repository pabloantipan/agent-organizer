package service

import (
	"bufio"
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
)

// The map reader (docs/specs/leftovers-58.md FR-1 to FR-3, 0174): an
// initiative's C4 base map as c4-map gen writes it, docs/architecture/
// map.json (agent-mailbox-specs contracts/c4-map/, c4-map/1) plus, per
// level, the first mermaid block of its page. Deltagos computes nothing
// from it and draws a map whole or not at all.

// MapSchema is the one map.json schema this Deltagos reads.
const MapSchema = "c4-map/1"

// The three states a MapResult is in. The lens switches on State.
const (
	MapDrawn   = "drawn"   // Index and Levels are set
	MapEmpty   = "empty"   // no docs/architecture/map.json
	MapRefused = "refused" // Refused is the one line the lens shows
)

// MapResult is what App.Map returns: exactly one of a drawn map, the empty
// state or a refusal. A refused or empty result carries no Index and no
// Levels, never part of a map.
type MapResult struct {
	State string `json:"state"`
	// Refused is the whole line, "Map not drawn: <reason>"; set only when
	// State is refused.
	Refused string `json:"refused,omitempty"`
	// Index is map.json as given; set only when State is drawn.
	Index *C4Map `json:"index,omitempty"`
	// Levels is one entry per Index.Levels, same order; set only when drawn.
	Levels []MapLevelSource `json:"levels,omitempty"`
}

// MapLevelSource is one level's mermaid source: the first ```mermaid block
// of its page, the lines between the fences, unchanged.
type MapLevelSource struct {
	Level     string `json:"level"`
	Page      string `json:"page"`
	Container string `json:"container,omitempty"`
	Source    string `json:"source"`
}

// C4Map is map.json, c4-map/1, every field of the contract one for one, so
// encoding it again gives the file's content back. Nullable fields are
// pointers; optional ones omitempty.
type C4Map struct {
	Schema     string             `json:"schema"`
	Initiative string             `json:"initiative"`
	System     string             `json:"system"`
	Inputs     map[string]*string `json:"inputs" ts_type:"Record<string, string | null>"`
	Levels     []C4Level          `json:"levels"`
	Nodes      []C4Node           `json:"nodes"`
	Edges      []C4Edge           `json:"edges"`
}

// C4Level is one level diagram: context, containers, or modules of one
// container.
type C4Level struct {
	Level     string `json:"level"`
	Page      string `json:"page"`
	Svg       string `json:"svg"`
	Container string `json:"container,omitempty"`
}

// C4Node is one drawn node. Kind and Status are null for a node with no
// grounding row; an empty Grounding is an ungrounded node.
type C4Node struct {
	ID        string       `json:"id"`
	Label     string       `json:"label"`
	Level     string       `json:"level"`
	Kind      *string      `json:"kind" ts_type:"string | null"`
	Parent    *string      `json:"parent" ts_type:"string | null"`
	Status    *string      `json:"status" ts_type:"string | null"`
	Grounding []C4Evidence `json:"grounding"`
}

// C4Edge is one drawn edge.
type C4Edge struct {
	From     string       `json:"from"`
	To       string       `json:"to"`
	Level    string       `json:"level"`
	Evidence []C4Evidence `json:"evidence"`
}

// C4Evidence is one grounding entry: kind repo, deploy, pipeline, cluster,
// external, record or curated, and its reference.
type C4Evidence struct {
	Kind string `json:"kind"`
	Ref  string `json:"ref"`
}

// mapRefused is the refusal line.
func mapRefused(format string, args ...any) MapResult {
	return MapResult{State: MapRefused, Refused: "Map not drawn: " + fmt.Sprintf(format, args...)}
}

// Map reads the initiative's base map. An initiative known only from
// another machine's snapshot is refused before anything is read (FR-3); an
// unknown one is an error.
func (s *Service) Map(initiative string) (MapResult, error) {
	root, machine, err := s.mapRoot(initiative)
	if err != nil {
		return MapResult{}, err
	}
	if machine != "" {
		return mapRefused("the map is read on %s", machine), nil
	}
	return ReadMap(root), nil
}

// mapRoot is the local initiative's root, or the machine whose snapshot is
// the only one that knows it. Local wins.
func (s *Service) mapRoot(id string) (root, machine string, err error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, si := range s.state.Local.Initiatives {
		if si.ID == id {
			return si.Path, "", nil
		}
	}
	for _, snap := range s.state.Remote {
		for _, ri := range snap.Initiatives {
			if ri.ID == id {
				return "", snap.Machine, nil
			}
		}
	}
	return "", "", fmt.Errorf("no initiative %s on this machine", id)
}

// ReadMap reads <root>/docs/architecture/map.json and its level pages
// (FR-1, FR-2).
func ReadMap(root string) MapResult {
	dir := filepath.Join(root, "docs", "architecture")
	b, err := os.ReadFile(filepath.Join(dir, "map.json"))
	if errors.Is(err, fs.ErrNotExist) {
		return MapResult{State: MapEmpty}
	}
	if err != nil {
		return mapRefused("map.json cannot be read: %v", err)
	}
	// The schema first, alone: another major may change every other field.
	var head struct {
		Schema *string `json:"schema"`
	}
	if err := json.Unmarshal(b, &head); err != nil {
		return mapRefused("map.json is not JSON: %v", err)
	}
	switch {
	case head.Schema == nil:
		return mapRefused("map.json has no schema; this Deltagos reads %s", MapSchema)
	case *head.Schema != MapSchema:
		return mapRefused("map.json is %s; this Deltagos reads %s", *head.Schema, MapSchema)
	}
	var m C4Map
	dec := json.NewDecoder(bytes.NewReader(b))
	dec.DisallowUnknownFields() // a field the contract lacks would be lost
	if err := dec.Decode(&m); err != nil {
		return mapRefused("map.json does not match %s: %v", MapSchema, err)
	}
	if len(m.Levels) == 0 {
		return mapRefused("map.json has no levels")
	}
	levels := make([]MapLevelSource, 0, len(m.Levels))
	for _, l := range m.Levels {
		if l.Page == "" || filepath.IsAbs(l.Page) || !filepath.IsLocal(l.Page) {
			return mapRefused("the %s level's page %q is not a path under docs/architecture/", l.Level, l.Page)
		}
		page, err := os.ReadFile(filepath.Join(dir, l.Page))
		if errors.Is(err, fs.ErrNotExist) {
			return mapRefused("%s is missing (the %s level)", l.Page, l.Level)
		}
		if err != nil {
			return mapRefused("%s cannot be read: %v", l.Page, err)
		}
		src, ok := firstMermaid(page)
		if !ok {
			return mapRefused("%s has no mermaid block (the %s level)", l.Page, l.Level)
		}
		levels = append(levels, MapLevelSource{Level: l.Level, Page: l.Page, Container: l.Container, Source: src})
	}
	return MapResult{State: MapDrawn, Index: &m, Levels: levels}
}

// firstMermaid is the first ```mermaid block of a page: the lines between
// its opening fence and the next closing fence, joined with "\n" and
// ending in one. A block that is opened and never closed is not a block.
func firstMermaid(page []byte) (string, bool) {
	sc := bufio.NewScanner(bytes.NewReader(page))
	sc.Buffer(make([]byte, 0, 64*1024), len(page)+1)
	in := false
	var b strings.Builder
	for sc.Scan() {
		line := strings.TrimSuffix(sc.Text(), "\r")
		t := strings.TrimSpace(line)
		if !in {
			if strings.HasPrefix(t, "```") && strings.TrimSpace(strings.TrimPrefix(t, "```")) == "mermaid" {
				in = true
			}
			continue
		}
		if strings.HasPrefix(t, "```") && strings.Trim(t, "`") == "" {
			return b.String(), true
		}
		b.WriteString(line)
		b.WriteByte('\n')
	}
	return "", false
}
