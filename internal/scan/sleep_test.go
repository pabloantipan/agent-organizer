package scan

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

// G2: the date comes from the factory's comment on a paused status only.
func TestAsleepSinceFromTheStatusComment(t *testing.T) {
	cases := []struct{ yaml, want string }{
		{"id: x\nstatus: paused   # sleeping since 2026-10-09 (factory sleep; four-awake rule, 2026-10-09)\n", "2026-10-09"},
		{"id: x\nstatus: paused\n", ""},
		{"id: x\nstatus: active\n", ""},
		{"id: x\nstatus: active   # awake since 2026-10-09 (factory wake)\n", ""},
		{"id: x\nstatus: active   # sleeping since 2026-10-09 (stale)\n", ""},
		{"id: x\nstatus: paused   # by hand, Pablo\n", ""},
		{"id: x\nstatus: paused   # sleeping since 2026-13-40 (factory sleep)\n", ""},
		{"id: x\n", ""},
		{"- not a mapping\n", ""},
	}
	for _, c := range cases {
		if got := asleepSince([]byte(c.yaml)); got != c.want {
			t.Errorf("%q: asleep_since %q, want %q", c.yaml, got, c.want)
		}
	}
}

func TestAsleepSinceIsReadWithNoProblem(t *testing.T) {
	root := t.TempDir()
	wo := filepath.Join(root, "working-on")
	if err := os.MkdirAll(wo, 0o755); err != nil {
		t.Fatal(err)
	}
	y := "id: x\ntitle: X\nstatus: paused   # sleeping since 2026-10-09 (factory sleep; four-awake rule, 2026-10-09)\n"
	if err := os.WriteFile(filepath.Join(wo, "initiative.yaml"), []byte(y), 0o644); err != nil {
		t.Fatal(err)
	}
	si := ReadInitiative(root, Options{})
	if si.Status != "paused" || si.AsleepSince != "2026-10-09" || len(si.Problems) != 0 {
		t.Fatalf("status %q asleep_since %q problems %+v", si.Status, si.AsleepSince, si.Problems)
	}
}

// G2: a frozen dir counts for the root its cwd falls under and no deeper
// root; one under a deeper root counts there, one elsewhere nowhere.
func TestFrozenDirsGoToTheDeepestRoot(t *testing.T) {
	home := t.TempDir()
	outer := filepath.Join(home, "outer")
	inner := filepath.Join(outer, "sub", "inner")
	for _, r := range []string{outer, inner} {
		if err := os.MkdirAll(filepath.Join(r, "working-on"), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(filepath.Join(r, "working-on", "initiative.yaml"), []byte("id: "+filepath.Base(r)+"\n"), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	frozen := filepath.Join(t.TempDir(), "frozen")
	put := func(session, cwd string) {
		d := filepath.Join(frozen, session)
		if err := os.MkdirAll(d, 0o755); err != nil {
			t.Fatal(err)
		}
		if cwd != "" {
			if err := os.WriteFile(filepath.Join(d, "cwd"), []byte(cwd+"\n"), 0o644); err != nil {
				t.Fatal(err)
			}
		}
	}
	put("outer-probe-ana", filepath.Join(outer, ".wt", "feature"))
	put("inner-probe-bo", filepath.Join(inner, "repo"))
	put("elsewhere-probe-cy", filepath.Join(home, "outerish"))
	put("no-cwd", "")

	// Discovery stops at a root, so a nested root is scanned only when a
	// second configured root reaches it.
	roots := []string{home, filepath.Join(outer, "sub")}
	snap := Run(Options{Roots: roots, MaxDepth: 4, FrozenDir: frozen})
	got := map[string][]string{}
	for _, si := range snap.Initiatives {
		got[si.ID] = si.Frozen
	}
	want := map[string][]string{"outer": {"outer-probe-ana"}, "inner": {"inner-probe-bo"}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("frozen %v, want %v", got, want)
	}
	// No frozen dir configured reads none.
	for _, si := range Run(Options{Roots: roots, MaxDepth: 4}).Initiatives {
		if si.Frozen != nil {
			t.Fatalf("%s frozen %v with no dir", si.ID, si.Frozen)
		}
	}
}
