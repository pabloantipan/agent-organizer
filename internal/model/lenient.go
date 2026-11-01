package model

import "gopkg.in/yaml.v3"

// The list fields the working-on skill writes as lists (contracts
// working-on/expected.json, accepted_reading.list_fields; leftovers-53 FR-1).
// Each also reads one scalar as a one-item list, so `boundary: "<prose>"` is
// one boundary entry rather than a card the scan cannot read. footprint on a
// card and affects on a record are not read here, and an unknown key never
// fails a file. spec and gate ride along (FR-1a): one reference or several.
var (
	cardLists     = []string{"repos", "depends_on", "boundary", "footprint", "threads", "spec", "gate"}
	decisionLists = []string{"options", "cards", "threads", "affects", "supersedes"}
	stageLists    = []string{"gates"}
)

// listify rewrites, in the mapping n, the value of each named key that is a
// scalar into a sequence: a non-empty scalar becomes its one item, an empty
// string an empty list. A null stays null (an absent list) and anything that
// is not a scalar is left for the decoder to accept or refuse.
func listify(n *yaml.Node, keys []string) {
	if n.Kind != yaml.MappingNode {
		return
	}
	want := map[string]bool{}
	for _, k := range keys {
		want[k] = true
	}
	for i := 0; i+1 < len(n.Content); i += 2 {
		k, v := n.Content[i], n.Content[i+1]
		if !want[k.Value] || v.Kind != yaml.ScalarNode || v.Tag == "!!null" {
			continue
		}
		seq := &yaml.Node{Kind: yaml.SequenceNode, Tag: "!!seq", Line: v.Line, Column: v.Column}
		if v.Value != "" {
			item := *v
			seq.Content = []*yaml.Node{&item}
		}
		n.Content[i+1] = seq
	}
}

// first is a reference list's first item, the one a builder is launched
// against, or empty.
func first(refs []string) string {
	if len(refs) == 0 {
		return ""
	}
	return refs[0]
}

// UnmarshalYAML reads a card's front-matter with its list fields lenient
// (FR-1) and its spec and gate as one reference or several (FR-1a): Spec and
// Gate are the first of SpecRefs and GateRefs.
func (c *Card) UnmarshalYAML(n *yaml.Node) error {
	listify(n, cardLists)
	type plain Card
	if err := n.Decode((*plain)(c)); err != nil {
		return err
	}
	c.Spec, c.Gate = first(c.SpecRefs), first(c.GateRefs)
	return nil
}

// UnmarshalYAML reads a decision record's front-matter with its list fields
// lenient (FR-1).
func (d *Decision) UnmarshalYAML(n *yaml.Node) error {
	listify(n, decisionLists)
	type plain Decision
	return n.Decode((*plain)(d))
}

// UnmarshalYAML reads a roadmap stage with gates lenient (FR-1): `gates:
// "0004"` is one gate.
func (s *Stage) UnmarshalYAML(n *yaml.Node) error {
	listify(n, stageLists)
	type plain Stage
	return n.Decode((*plain)(s))
}
