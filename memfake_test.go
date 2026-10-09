package main

import (
	"os"
	"path/filepath"
	"testing"

	"organizer/internal/memory"
	"organizer/internal/model"
)

// The stand-ins answer the real reader as Aglaea's figures, per level, and
// fail as a failed read; @file follows the file at every sample.
func TestMemoryFake(t *testing.T) {
	file := filepath.Join(t.TempDir(), "level")
	t.Setenv("PATH", os.Getenv("PATH"))
	t.Setenv(memoryFakeEnv, "@"+file)
	if _, err := memoryFake(); err != nil {
		t.Fatal(err)
	}
	for _, c := range []struct {
		level string
		free  float64
	}{{"normal", 12}, {"high", 3.1}, {"critical", 1.2}} {
		os.WriteFile(file, []byte(c.level+"\n"), 0o644)
		r, err := memory.Read(memory.System{})
		if err != nil {
			t.Fatalf("%s: %v", c.level, err)
		}
		if r.Pressure != c.level || r.TotalBytes != 32<<30 || gbText(r.FreeBytes) != gbText(uint64(c.free*(1<<30))) {
			t.Errorf("%s: got %+v", c.level, r)
		}
	}
	os.WriteFile(file, []byte("fail"), 0o644)
	if _, err := memory.Read(memory.System{}); err == nil {
		t.Error("fail: read succeeded")
	}
}

func TestMemoryWarning(t *testing.T) {
	m := memoryFixture()
	title, body := memoryWarning("lodestar", m)
	if title != "Memory critical on lodestar" {
		t.Errorf("title %q", title)
	}
	if want := "1.2 GB free. Biggest: camp-probe-andrea 4.2 GB, organizer-probe-sup46 3 GB, probe-hefesto 2.6 GB."; body != want {
		t.Errorf("body %q, want %q", body, want)
	}
}

func memoryFixture() model.Memory {
	g := func(f float64) uint64 { return uint64(f * (1 << 30)) }
	return model.Memory{Pressure: "critical", TotalBytes: g(32), FreeBytes: g(1.2), Top: []model.MemorySession{
		{Name: "camp-probe-andrea", Initiative: "ccint-camp-monorepo", Bytes: g(4.2)},
		{Name: "organizer-probe-sup46", Initiative: "organizer", Bytes: g(3)},
		{Name: "probe-hefesto", Bytes: g(2.6)},
		{Name: "fourth", Bytes: g(1)},
	}}
}
