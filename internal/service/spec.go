package service

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

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
// Only the files the scan resolved under the initiative's specs: and the
// paths its cards' spec: fields name are read; any other path is refused
// before the disk is touched. A `#section` on the path is ignored.
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
	if !ok || !allowed[rel] {
		return SpecDoc{}, fmt.Errorf("%q: %w %s; only the files under specs: or a card's spec: are read", path, ErrSpecRefused, initiativeID)
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
