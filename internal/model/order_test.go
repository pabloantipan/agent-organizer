package model

import (
	"reflect"
	"testing"
)

func TestRegroupDerivesPriorityAndDropsDuplicates(t *testing.T) {
	o := Order{Initiatives: []string{"a", "b", "c", "d"}}
	o.Regroup([]Group{{Name: "PLV", Initiatives: []string{"c", "b", "c"}}, {Name: "me", Initiatives: []string{"d", "b"}}})
	if !reflect.DeepEqual(o.Initiatives, []string{"c", "b", "d", "a"}) {
		t.Errorf("initiatives %v", o.Initiatives)
	}
	if !reflect.DeepEqual(o.Groups[0].Initiatives, []string{"c", "b"}) || !reflect.DeepEqual(o.Groups[1].Initiatives, []string{"d"}) {
		t.Errorf("groups %+v", o.Groups)
	}
	o.Regroup(nil)
	if o.Groups != nil || !reflect.DeepEqual(o.Initiatives, []string{"c", "b", "d", "a"}) {
		t.Errorf("ungroup keeps the ranking: %+v", o)
	}
}

func TestReprioritizeReordersWithinGroups(t *testing.T) {
	o := Order{Groups: []Group{{Name: "g", Initiatives: []string{"a", "b"}}, {Name: "h", Initiatives: []string{"c"}}}}
	o.Reprioritize([]string{"c", "b", "a"})
	if !reflect.DeepEqual(o.Groups[0].Initiatives, []string{"b", "a"}) || !reflect.DeepEqual(o.Initiatives, []string{"c", "b", "a"}) {
		t.Errorf("%+v", o)
	}
}

func TestRegroupKeepsNotesAndResolved(t *testing.T) {
	o := Order{Initiatives: []string{"a"}, Notes: map[string][]Note{"a/x": {{ID: "1", Text: "n"}}}, Resolved: map[string]string{"card:a/x": "2026-09-06"}}
	o.Regroup([]Group{{Name: "g", Initiatives: []string{"a"}}})
	o.Reprioritize([]string{"a"})
	if len(o.Notes["a/x"]) != 1 || o.Resolved["card:a/x"] == "" {
		t.Error("grouping must not touch notes or resolved marks")
	}
}
