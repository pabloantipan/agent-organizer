package service

import (
	"fmt"
	"os"
)

// HelpKey is the config key that names the Help's file.
const HelpKey = "help_doc"

// HelpDoc is what the Help shows: the file's text, or, when it cannot be
// read, Problem naming the path tried and the key that sets it.
type HelpDoc struct {
	Path    string `json:"path"`
	Key     string `json:"key"`
	Text    string `json:"text"`
	Problem string `json:"problem"`
}

// Help reads help_doc now. The file is never copied or cached: every call
// reads it again, so the Help cannot drift from it.
func (s *Service) Help() HelpDoc {
	path := s.Config().HelpDocPath()
	doc := HelpDoc{Path: path, Key: HelpKey}
	b, err := os.ReadFile(path)
	if err != nil {
		reason := "cannot be read"
		if os.IsNotExist(err) {
			reason = "does not exist"
		}
		doc.Problem = fmt.Sprintf("The Help file %s %s. Set %s in the organizer config to the file to show.", path, reason, HelpKey)
		return doc
	}
	doc.Text = string(b)
	return doc
}
