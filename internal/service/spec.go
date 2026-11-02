package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"

	"organizer/internal/model"
	"organizer/internal/specpath"
)

// SpecDoc is a spec file as the reader shows it (docs/specs/diagrams.md
// FR-6): its path relative to the initiative root, its text, and Missing
// when the scan resolved the path but the file is gone now.
type SpecDoc struct {
	Path    string `json:"path"`
	Text    string `json:"text"`
	Missing bool   `json:"missing"`
}

// ErrSpecRefused is a path the scan did not resolve as a spec of the
// initiative: nothing is read for it.
var ErrSpecRefused = errors.New("not a spec of this initiative")

// readSpecFile reads a spec; tests count its calls.
var readSpecFile = os.ReadFile

// ReadSpec returns a spec file's text by initiative and path (FR-6; G3).
// Only the files the scan resolved under the initiative's specs:, the
// paths its cards' spec: fields name, and the run records its waves were
// read from (leftovers-57 FR-18) are read, and under docs/architecture/
// the pages the initiative's map.json names (leftovers-58 FR-10); any
// other path is refused before the file is touched. A `#section` on the
// path is ignored.
func (s *Service) ReadSpec(initiativeID, path string) (SpecDoc, error) {
	si, err := s.initiative(initiativeID)
	if err != nil {
		return SpecDoc{}, err
	}
	rel, ok := specpath.Clean(path)
	allowed := map[string]bool{}
	for _, files := range si.SpecFiles {
		for _, f := range files {
			allowed[f] = true
		}
	}
	for _, c := range si.Cards {
		if p, ok := specpath.Card(c.Spec); ok {
			allowed[p] = true
		}
	}
	for _, p := range runRecords(si.Waves) {
		allowed[p] = true
	}
	if ok && !allowed[rel] && strings.HasPrefix(rel, mapDirRel+"/") {
		allowed = mapPages(si.Path)
	}
	if !ok || !allowed[rel] {
		return SpecDoc{}, fmt.Errorf("%q: %w %s; only the files under specs:, a card's spec:, a wave's run record or the map's pages are read", path, ErrSpecRefused, initiativeID)
	}
	doc := SpecDoc{Path: rel}
	b, err := readSpecFile(filepath.Join(si.Path, filepath.FromSlash(rel)))
	if errors.Is(err, os.ErrNotExist) {
		doc.Missing = true
		return doc, nil
	}
	if err != nil {
		return SpecDoc{}, err
	}
	doc.Text = string(b)
	return doc, nil
}

// runRecords are the run records the scan read the initiative's waves from,
// relative to its root (FR-18). The scan reads <root>/runs/ alone and keeps
// each wave's file name (`model.Wave.Record`), so the directory is the one
// it read, never guessed: a record the factory reads elsewhere (docs/runs/)
// is not one of these and stays refused.
func runRecords(waves []model.Wave) []string {
	var out []string
	for _, w := range waves {
		if w.Record != "" {
			out = append(out, runsDirRel+"/"+w.Record)
		}
	}
	return out
}

// runsDirRel is scan's runsDir (internal/scan/runs.go), the one directory
// it reads run records from.
const runsDirRel = "runs"

// mapDirRel is where an initiative's base map lives (leftovers-58 FR-1).
const mapDirRel = "docs/architecture"

// mapPages are the pages an initiative's map.json names, relative to its
// root (leftovers-58 FR-10): each level's page and each page a `curated`
// grounding entry names, resolved under docs/architecture/; a name that
// resolves outside it is not one. A map.json that is missing, not JSON
// or of another schema names none.
func mapPages(root string) map[string]bool {
	out := map[string]bool{}
	b, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(mapDirRel), "map.json"))
	if err != nil {
		return out
	}
	var m struct {
		Schema string `json:"schema"`
		Levels []struct {
			Page string `json:"page"`
		} `json:"levels"`
		Nodes []struct {
			Grounding []C4Evidence `json:"grounding"`
		} `json:"nodes"`
	}
	if json.Unmarshal(b, &m) != nil || m.Schema != MapSchema {
		return out
	}
	add := func(page string) {
		page = strings.TrimSpace(page)
		if page == "" || strings.HasPrefix(page, "/") {
			return
		}
		if rel := path.Join(mapDirRel, page); strings.HasPrefix(rel, mapDirRel+"/") {
			out[rel] = true
		}
	}
	for _, l := range m.Levels {
		add(l.Page)
	}
	for _, n := range m.Nodes {
		for _, g := range n.Grounding {
			if g.Kind == "curated" {
				add(g.Ref)
			}
		}
	}
	return out
}
