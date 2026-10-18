package specpath

import "testing"

func TestCard(t *testing.T) {
	for in, want := range map[string]string{
		"docs/specs/x.md (FR-1 to FR-3)":                               "docs/specs/x.md",
		"docs/specs/diagrams.md (FR-6 to FR-8; diagrams-in-app D1-D8)": "docs/specs/diagrams.md",
		"docs/x.md#shape":           "docs/x.md",
		"docs/x.md#sec,":            "docs/x.md",
		"docs/x.md, FR-2":           "docs/x.md",
		"./a/../b.md":               "b.md",
		"../agent-slack/specs/x.md": "",
		"/abs/x.md":                 "",
		"#only":                     "",
		"   ":                       "",
		"":                          "",
	} {
		got, ok := Card(in)
		if got != want || ok != (want != "") {
			t.Errorf("Card(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
}

func TestClean(t *testing.T) {
	for in, want := range map[string]string{
		"docs/x.md#sec": "docs/x.md",
		"a/./b.md":      "a/b.md",
		"..":            "",
		".":             "",
		"/abs.md":       "",
	} {
		got, ok := Clean(in)
		if got != want || ok != (want != "") {
			t.Errorf("Clean(%q) = %q, %v; want %q", in, got, ok, want)
		}
	}
}
