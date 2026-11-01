package usage

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"gopkg.in/yaml.v3"
)

// LoadRoles fills what attribution reads beyond the scan's cards
// (leftovers-56 FR-2, FR-3; Amendment 1): each card's reviewer: from its
// file under <root>/working-on (done/ included), and the decision records
// under <root>/working-on/decisions whose supervisor: names a session. A
// file that does not read or parse is skipped: it is the scan's problem to
// report, not the ledger's. Initiatives without a Root are left as given.
func LoadRoles(inits []Initiative) []Initiative {
	out := make([]Initiative, len(inits))
	for i, in := range inits {
		out[i] = in
		if in.Root == "" {
			continue
		}
		out[i].Cards = append([]Card(nil), in.Cards...)
		wo := filepath.Join(in.Root, "working-on")
		reviewers := map[string][]string{}
		for _, dir := range []string{wo, filepath.Join(wo, "done")} {
			files, _ := filepath.Glob(filepath.Join(dir, "*.md"))
			for _, f := range files {
				var fm struct {
					Reviewer yaml.Node `yaml:"reviewer"`
				}
				if !readFront(f, &fm) {
					continue
				}
				if names := names(&fm.Reviewer); len(names) > 0 {
					reviewers[strings.TrimSuffix(filepath.Base(f), ".md")] = names
				}
			}
		}
		for j := range out[i].Cards {
			c := &out[i].Cards[j]
			if len(c.Reviewers) == 0 {
				c.Reviewers = reviewers[c.Slug]
			}
		}
		files, _ := filepath.Glob(filepath.Join(wo, "decisions", "*.md"))
		for _, f := range files {
			var fm struct {
				Supervisor string   `yaml:"supervisor"`
				Cards      []string `yaml:"cards"`
			}
			if !readFront(f, &fm) || strings.TrimSpace(fm.Supervisor) == "" {
				continue
			}
			num := recordNum.FindString(filepath.Base(f))
			out[i].Records = append(out[i].Records, Record{Number: num, Supervisor: strings.TrimSpace(fm.Supervisor), Cards: fm.Cards})
		}
	}
	return out
}

var recordNum = regexp.MustCompile(`^\d+`)

// readFront decodes a markdown file's frontmatter into out; false when the
// file has none or it does not parse.
func readFront(path string, out any) bool {
	b, err := os.ReadFile(path)
	if err != nil {
		return false
	}
	s := strings.ReplaceAll(string(b), "\r\n", "\n")
	if !strings.HasPrefix(s, "---\n") {
		return false
	}
	end := strings.Index(s[4:], "\n---")
	if end < 0 {
		return false
	}
	return yaml.Unmarshal([]byte(s[4:4+end]), out) == nil
}

// names is a reviewer: field as seat names: one string, "a, b", or a YAML
// list. A token that is not a seat (a date, prose) matches no session.
func names(n *yaml.Node) []string {
	var raw []string
	switch n.Kind {
	case yaml.ScalarNode:
		raw = strings.Split(n.Value, ",")
	case yaml.SequenceNode:
		for _, c := range n.Content {
			if c.Kind == yaml.ScalarNode {
				raw = append(raw, strings.Split(c.Value, ",")...)
			}
		}
	}
	var out []string
	for _, r := range raw {
		if r = strings.ToLower(strings.TrimSpace(r)); r != "" {
			out = append(out, r)
		}
	}
	return out
}
