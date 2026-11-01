package model

import (
	"reflect"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

func TestMissingLaunchFields(t *testing.T) {
	full := Card{Spec: "docs/x.md#s", Gate: "go test ./...", Boundary: []string{"internal/"}}
	tests := []struct {
		name string
		card Card
		want string
	}{
		{"complete", full, ""},
		{"no spec", Card{Gate: full.Gate, Boundary: full.Boundary}, "spec"},
		{"blank spec", Card{Spec: "   ", Gate: full.Gate, Boundary: full.Boundary}, "spec"},
		{"no gate", Card{Spec: full.Spec, Boundary: full.Boundary}, "gate"},
		{"no boundary", Card{Spec: full.Spec, Gate: full.Gate}, "boundary"},
		{"empty boundary", Card{Spec: full.Spec, Gate: full.Gate, Boundary: []string{}}, "boundary"},
		{"nothing", Card{}, "spec,gate,boundary"},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := strings.Join(tt.card.MissingLaunchFields(), ",")
			if got != tt.want {
				t.Errorf("missing = %q, want %q", got, tt.want)
			}
		})
	}
}

// leftovers-53 FR-1, FR-1a: a list field written as one scalar is a one-item
// list, an empty scalar an empty list, null absent; spec and gate are one
// reference or several, Spec and Gate the first.
func TestCardListFieldsLenient(t *testing.T) {
	tests := []struct {
		name, yaml string
		want       Card
	}{
		{"lists", "repos: [a, b]\nboundary: [x/, y/]\nthreads: [T1]\ndepends_on: [c]\nspec: s.md\ngate: g",
			Card{Repos: []string{"a", "b"}, Boundary: []string{"x/", "y/"}, Threads: []string{"T1"}, DependsOn: []string{"c"},
				Spec: "s.md", SpecRefs: []string{"s.md"}, Gate: "g", GateRefs: []string{"g"}}},
		{"scalars", "repos: a\nboundary: \"only x/, nothing else\"\nthreads: T1\ndepends_on: c",
			Card{Repos: []string{"a"}, Boundary: []string{"only x/, nothing else"}, Threads: []string{"T1"}, DependsOn: []string{"c"}}},
		{"empty scalars", "repos: \"\"\nboundary: ''\nspec: \"\"",
			Card{Repos: []string{}, Boundary: []string{}, SpecRefs: []string{}}},
		{"null", "repos:\nboundary: ~", Card{}},
		{"spec and gate lists", "spec: [a.md#goals, decisions 0002]\ngate: [g1, g2]",
			Card{Spec: "a.md#goals", SpecRefs: []string{"a.md#goals", "decisions 0002"}, Gate: "g1", GateRefs: []string{"g1", "g2"}}},
		{"folded prose", "boundary: >-\n  internal/ and\n  its tests",
			Card{Boundary: []string{"internal/ and its tests"}}},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var c Card
			if err := yaml.Unmarshal([]byte(tt.yaml), &c); err != nil {
				t.Fatal(err)
			}
			if !reflect.DeepEqual(c, tt.want) {
				t.Errorf("got %+v\nwant %+v", c, tt.want)
			}
		})
	}
	var c Card
	if err := yaml.Unmarshal([]byte("spec: [a.md, b.md]\ngate: g\nboundary: x/"), &c); err != nil {
		t.Fatal(err)
	}
	if m := c.MissingLaunchFields(); len(m) != 0 {
		t.Errorf("a spec list is launchable, missing %v", m)
	}
}

func TestDecisionAndStageListsLenient(t *testing.T) {
	var d Decision
	if err := yaml.Unmarshal([]byte("options: only one\ncards: c1\nthreads: T\nsupersedes: \"0001\"\naffects: cell-a"), &d); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(d.Options, []string{"only one"}) || !reflect.DeepEqual(d.Cards, []string{"c1"}) ||
		!reflect.DeepEqual(d.Threads, []string{"T"}) || !reflect.DeepEqual(d.Supersedes, []string{"0001"}) {
		t.Errorf("decision lists %+v", d)
	}
	var doc struct {
		Stages []Stage `yaml:"stages"`
	}
	if err := yaml.Unmarshal([]byte("stages:\n  - id: a\n    gates: \"0004\"\n    exit: [one]\n"), &doc); err != nil {
		t.Fatal(err)
	}
	if len(doc.Stages) != 1 || !reflect.DeepEqual(doc.Stages[0].Gates, []string{"0004"}) || doc.Stages[0].Exit[0].Text != "one" {
		t.Errorf("stage %+v", doc.Stages)
	}
}
