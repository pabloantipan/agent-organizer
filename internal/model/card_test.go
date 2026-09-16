package model

import (
	"strings"
	"testing"
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
