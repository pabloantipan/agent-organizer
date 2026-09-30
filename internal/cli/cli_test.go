package cli

import (
	"bytes"
	"os"
	"path/filepath"
	"testing"
	"time"

	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/scan"
)

func TestWriteStatusGolden(t *testing.T) {
	home, _ := filepath.Abs(filepath.Join("..", "..", "testdata", "home"))
	t.Setenv("HOME", home)
	now := time.Date(2026, 9, 2, 12, 0, 0, 0, time.UTC)
	snap := scan.Run(scan.Options{
		Roots:      []string{home},
		MaxDepth:   3,
		IgnoreDirs: config.Default().IgnoreDirs,
		Now:        func() time.Time { return now },
	})
	var buf bytes.Buffer
	WriteStatus(&buf, snap, now, false)
	got := buf.String()

	golden := filepath.Join("testdata", "status.golden")
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		_ = os.MkdirAll("testdata", 0o755)
		_ = os.WriteFile(golden, []byte(got), 0o644)
	}
	want, err := os.ReadFile(golden)
	if err != nil {
		t.Fatalf("no golden file; run with UPDATE_GOLDEN=1. Output was:\n%s", got)
	}
	if got != string(want) {
		t.Errorf("status output drifted.\n--- got ---\n%s\n--- want ---\n%s", got, want)
	}
}

func TestAge(t *testing.T) {
	now := time.Date(2026, 9, 2, 0, 0, 0, 0, time.UTC)
	cases := map[string]string{"2026-09-02": "today", "2026-09-01": "1d", "2026-08-20": "13d", "2026-06-01": "3mo"}
	for in, want := range cases {
		c := model.Card{Updated: in}
		if got := age(c.UpdatedTime(), now); got != want {
			t.Errorf("age(%s)=%s want %s", in, got, want)
		}
	}
	if age(time.Time{}, now) != "?" {
		t.Error("zero time should be ?")
	}
}

// The version line names the app (0066); the command stays organizer.
func TestVersionNamesTheApp(t *testing.T) {
	home := t.TempDir()
	t.Setenv("HOME", home)
	t.Setenv("XDG_CONFIG_HOME", filepath.Join(home, ".config"))
	old := Version
	Version = "v9.9.9"
	defer func() { Version = old }()
	for _, arg := range []string{"version", "--version"} {
		var out, errb bytes.Buffer
		if code := Run([]string{arg}, &out, &errb); code != 0 {
			t.Fatalf("%s: exit %d, stderr %q", arg, code, errb.String())
		}
		if got := out.String(); got != "Deltagos v9.9.9\n" {
			t.Errorf("%s printed %q, want %q", arg, got, "Deltagos v9.9.9\n")
		}
	}
}
