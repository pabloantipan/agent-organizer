package main

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"organizer/internal/memory"
	"organizer/internal/service"
)

// memoryFakeEnv forces the memory reading for a review (docs/specs/ram-indicator.md,
// Acceptance (ram-view)): normal, high, critical or fail, none (no sample
// yet, so the popover stays at "Reading memory…", leftovers-15 FR-3), or
// @<file> to read
// one of those words from the file at every sample, so a reviewer walks the
// levels (critical, then normal for "Was critical until") without a
// restart. Unset, the real reading. It replaces only the service's reader
// (Service.SetMemoryReader), so since, was_critical_until and the warn rule
// run as they do for real.
const memoryFakeEnv = "ORGANIZER_MEMORY_FAKE"

// fakeMemory answers sysctl and vm_stat as a 32 GB Mac at the level asked,
// with Aglaea's example figures free: 12 GB at normal, 3.1 at high, 1.2 at
// critical.
type fakeMemory struct{ spec string }

// memoryFake is the forced reader when the env asks for one.
func memoryFake() (memory.Reader, bool) {
	v := strings.TrimSpace(os.Getenv(memoryFakeEnv))
	if v == "" {
		return nil, false
	}
	return fakeMemory{spec: v}, true
}

func (f fakeMemory) level() (string, error) {
	w := f.spec
	if path, ok := strings.CutPrefix(w, "@"); ok {
		b, err := os.ReadFile(path)
		if err != nil {
			return "", err
		}
		w = strings.TrimSpace(string(b))
	}
	switch w {
	case memory.Normal, memory.High, memory.Critical:
		return w, nil
	case "fail":
		return "", errors.New("forced to fail by " + memoryFakeEnv)
	case "none":
		return "", service.ErrNoSample
	}
	return "", fmt.Errorf("%s=%q is not normal, high, critical, fail or none", memoryFakeEnv, w)
}

const fakeGiB = 1 << 30

func (f fakeMemory) Sysctl(name string) (string, error) {
	w, err := f.level()
	if err != nil {
		return "", err
	}
	switch name {
	case "kern.memorystatus_vm_pressure_level":
		return map[string]string{memory.Normal: "1", memory.High: "2", memory.Critical: "4"}[w], nil
	case "hw.memsize":
		return fmt.Sprint(32 * fakeGiB), nil
	}
	return "", fmt.Errorf("sysctl %s: not faked", name)
}

func (f fakeMemory) VMStat() (string, error) {
	w, err := f.level()
	if err != nil {
		return "", err
	}
	free := map[string]float64{memory.Normal: 12, memory.High: 3.1, memory.Critical: 1.2}[w]
	pages := uint64(free * fakeGiB / 16384)
	return fmt.Sprintf("Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free: %d.\nPages speculative: 0.\nFile-backed pages: 0.\n", pages), nil
}
