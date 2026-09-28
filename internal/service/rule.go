package service

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strings"

	"organizer/internal/model"
)

// RuleDecision writes the owner's ruling into a `proposed` decision record and
// commits that one file (FR-13, 0019). It is the only path by which the
// organizer writes a record, and it writes nothing but the four fields and the
// Ruling section: the record is edited as text, so every other byte survives.
//
// It refuses a record that is not proposed, a chosen value that is not one of
// the record's options, and empty words. It also refuses, before touching the
// file, a record with no owner (`ruled_by` is the owner, A4) and a record
// outside a git repository (the commit could not happen). A refusal writes
// nothing and commits nothing.
func (s *Service) RuleDecision(initiativeID, number, chosen, words string) error {
	words = strings.TrimSpace(words)
	if words == "" {
		return fmt.Errorf("a ruling needs the owner's words")
	}
	si, err := s.initiative(initiativeID)
	if err != nil {
		return err
	}
	number = padNumber(number)
	i := slices.IndexFunc(si.Decisions, func(d model.Decision) bool { return d.Number == number })
	if i < 0 {
		return fmt.Errorf("initiative %s has no decision %s", initiativeID, number)
	}
	d := si.Decisions[i]
	if d.Status != model.DecisionProposed {
		return fmt.Errorf("decision %s is %s, not proposed; only a proposed record can be ruled", d.Number, d.Status)
	}
	if !slices.Contains(d.Options, chosen) {
		return fmt.Errorf("chosen %q is not one of decision %s's options (%s)", chosen, d.Number, strings.Join(d.Options, ", "))
	}
	if strings.TrimSpace(d.Owner) == "" {
		return fmt.Errorf("decision %s names no owner, and the ruling is signed by the owner", d.Number)
	}
	dir := filepath.Dir(d.Path)
	if out, err := exec.Command("git", "-C", dir, "rev-parse", "--git-dir").CombinedOutput(); err != nil {
		return fmt.Errorf("%s is not in a git repository, so the ruling cannot be committed: %s", dir, strings.TrimSpace(string(out)))
	}
	src, err := os.ReadFile(d.Path)
	if err != nil {
		return err
	}
	cfg := s.Config()
	ruled := s.now().Format("2006-01-02")
	out, err := writeRuling(string(src), ruled, d.Owner, chosen, words, cfg.Machine)
	if err != nil {
		return fmt.Errorf("%s: %w", filepath.Base(d.Path), err)
	}
	perm := os.FileMode(0o644)
	if st, err := os.Stat(d.Path); err == nil {
		perm = st.Mode().Perm()
	}
	if err := os.WriteFile(d.Path, []byte(out), perm); err != nil {
		return err
	}
	name := filepath.Base(d.Path)
	msg := fmt.Sprintf("docs(decisions): rule %s %s (%s)", d.Number, d.Slug, chosen)
	if out, err := exec.Command("git", "-C", dir, "add", "--", name).CombinedOutput(); err != nil {
		return fmt.Errorf("git add %s: %s", name, strings.TrimSpace(string(out)))
	}
	if out, err := exec.Command("git", "-C", dir, "commit", "-m", msg, "--", name).CombinedOutput(); err != nil {
		return fmt.Errorf("git commit %s: %s", name, strings.TrimSpace(string(out)))
	}
	s.Scan(false)
	return nil
}

// padNumber accepts `19` for `0019`; the record's number is four digits.
func padNumber(n string) string {
	n = strings.TrimSpace(n)
	if len(n) >= 4 || n == "" || strings.ContainsFunc(n, func(r rune) bool { return r < '0' || r > '9' }) {
		return n
	}
	return strings.Repeat("0", 4-len(n)) + n
}

const rulingHeading = "## Ruling"

// writeRuling returns the record with `status`, `ruled`, `ruled_by` and
// `chosen` set and the words under `## Ruling`, and nothing else changed. The
// file is edited line by line rather than re-serialised so comments, key
// order, blank lines and every other section stay exactly as they were.
func writeRuling(src, ruled, owner, chosen, words, machine string) (string, error) {
	lines := strings.Split(src, "\n")
	end := frontmatterEnd(lines)
	if end < 0 {
		return "", fmt.Errorf("no frontmatter to write the ruling into")
	}
	set := [][2]string{
		{"status", model.DecisionRuled},
		{"ruled", ruled},
		{"ruled_by", owner},
		{"chosen", chosen},
	}
	for _, kv := range set {
		lines, end = setFrontmatterKey(lines, end, kv[0], kv[1])
	}
	return strings.Join(insertRuling(lines, end, rulingLines(ruled, owner, words, machine)), "\n"), nil
}

// frontmatterEnd is the index of the `---` that closes the frontmatter, or -1.
func frontmatterEnd(lines []string) int {
	if len(lines) == 0 || strings.TrimSpace(lines[0]) != "---" {
		return -1
	}
	for i := 1; i < len(lines); i++ {
		if strings.TrimSpace(lines[i]) == "---" {
			return i
		}
	}
	return -1
}

// setFrontmatterKey replaces the key's line in place, or inserts it before the
// closing `---` when the record does not carry the key. It returns the lines
// and the (possibly moved) index of that closing `---`.
func setFrontmatterKey(lines []string, end int, key, value string) ([]string, int) {
	line := key + ": " + yamlScalar(value)
	for i := 1; i < end; i++ {
		if strings.HasPrefix(lines[i], key+":") {
			lines[i] = line
			return lines, end
		}
	}
	return slices.Insert(lines, end, line), end + 1
}

// yamlScalar quotes a value only where a plain scalar would not read back as
// itself; the records in the wild are unquoted (`chosen: write it`).
func yamlScalar(v string) string {
	if v == "" {
		return v
	}
	plain := !strings.ContainsAny(v, ":#\n\"'") &&
		!strings.HasPrefix(v, " ") && !strings.HasSuffix(v, " ") &&
		!strings.ContainsAny(v[:1], "[]{}>|*&!%@`,?-")
	if plain {
		return v
	}
	return fmt.Sprintf("%q", v)
}

// rulingLines is the ruling as it is written under the heading: who ruled,
// when, and where it was said (A4), then the words.
func rulingLines(ruled, owner, words, machine string) []string {
	where := "in the organizer"
	if strings.TrimSpace(machine) != "" {
		where += " on " + machine
	}
	said := strings.Split(words, "\n")
	out := []string{fmt.Sprintf("%s, %s, %s: %s", owner, ruled, where, said[0])}
	return append(out, said[1:]...)
}

// insertRuling puts the ruling under the record's `## Ruling` heading. An empty
// section is filled; a section that already holds text keeps it, with the
// ruling above it; a record without the heading gets one at the end.
func insertRuling(lines []string, end int, ruling []string) []string {
	at := -1
	for i := end + 1; i < len(lines); i++ {
		if strings.TrimRight(lines[i], " \t") == rulingHeading {
			at = i
			break
		}
	}
	if at < 0 {
		for len(lines) > 0 && strings.TrimSpace(lines[len(lines)-1]) == "" {
			lines = lines[:len(lines)-1]
		}
		lines = append(lines, "", rulingHeading, "")
		return append(append(lines, ruling...), "")
	}
	stop := len(lines)
	for i := at + 1; i < len(lines); i++ {
		if strings.HasPrefix(lines[i], "## ") {
			stop = i
			break
		}
	}
	body := append([]string{""}, ruling...)
	body = append(body, "")
	if kept := lines[at+1 : stop]; !blank(kept) {
		for len(kept) > 0 && strings.TrimSpace(kept[0]) == "" {
			kept = kept[1:]
		}
		body = append(body, kept...)
	}
	return slices.Concat(lines[:at+1], body, lines[stop:])
}

func blank(lines []string) bool {
	for _, l := range lines {
		if strings.TrimSpace(l) != "" {
			return false
		}
	}
	return true
}
