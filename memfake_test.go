package main

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"organizer/internal/memory"
	"organizer/internal/model"
	"organizer/internal/service"
)

// The fake reads Aglaea's figures per level and fails as a failed read;
// @file follows the file at every sample.
func TestMemoryFake(t *testing.T) {
	file := filepath.Join(t.TempDir(), "level")
	t.Setenv(memoryFakeEnv, "@"+file)
	r, ok := memoryFake()
	if !ok {
		t.Fatal("no fake with the env set")
	}
	for _, c := range []struct {
		level string
		free  float64
	}{{"normal", 12}, {"high", 3.1}, {"critical", 1.2}} {
		os.WriteFile(file, []byte(c.level+"\n"), 0o644)
		got, err := memory.Read(r)
		if err != nil {
			t.Fatalf("%s: %v", c.level, err)
		}
		if got.Pressure != c.level || got.TotalBytes != 32<<30 || gbText(got.FreeBytes) != gbText(uint64(c.free*(1<<30))) {
			t.Errorf("%s: got %+v", c.level, got)
		}
	}
	// N3 (leftovers-15 FR-3): none is no sample yet, not a failed read.
	os.WriteFile(file, []byte("none"), 0o644)
	if _, err := memory.Read(r); !errors.Is(err, service.ErrNoSample) {
		t.Errorf("none: %v, want service.ErrNoSample", err)
	}
	os.WriteFile(file, []byte("fail"), 0o644)
	if _, err := memory.Read(r); err == nil {
		t.Error("fail: read succeeded")
	}
	t.Setenv(memoryFakeEnv, "")
	if _, ok := memoryFake(); ok {
		t.Error("a fake with the env unset")
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
