package model

import (
	"encoding/json"
	"reflect"
	"strings"
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

// leftovers-77 G1 (FR-1): the seeded no-client group is keyed by `seed`,
// which the order document's JSON and Regroup carry unchanged.
func TestSeededGroupKeepsSeedThroughJSONAndRegroup(t *testing.T) {
	o := Order{Initiatives: []string{"a", "b", "c"}}
	o.Regroup([]Group{{Name: "acme", Initiatives: []string{"a"}}, {Seed: "no-client", Initiatives: []string{"b", "c"}}, {Seed: "no-client", Name: "misc"}})
	if o.Groups[1].Seed != "no-client" || o.Groups[1].Name != "" || o.Groups[2].Seed != "no-client" || o.Groups[2].Name != "misc" || o.Groups[0].Seed != "" {
		t.Fatalf("Regroup dropped the seed: %+v", o.Groups)
	}
	b, err := json.Marshal(o)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), `{"name":"","initiatives":["b","c"],"seed":"no-client"}`) || strings.Contains(string(b), `"seed":""`) {
		t.Errorf("json %s", b)
	}
	var back Order
	if err := json.Unmarshal(b, &back); err != nil {
		t.Fatal(err)
	}
	if !reflect.DeepEqual(back.Groups, o.Groups) {
		t.Errorf("round trip %+v, want %+v", back.Groups, o.Groups)
	}
	var old Order
	if err := json.Unmarshal([]byte(`{"groups":[{"name":"other","initiatives":["b"]}]}`), &old); err != nil || old.Groups[0].Seed != "" || old.Groups[0].Name != "other" {
		t.Errorf("a group stored before the seed reads as stored: %+v %v", old.Groups, err)
	}
}
