// Package memory reads this Mac's memory: the kernel's pressure level, the
// physical total and what Activity Monitor shows as available (Physical
// Memory less Memory Used) (FR-1 of
// docs/specs/ram-indicator.md). It holds no state; the service tracks how
// long a level has lasted and when to warn.
package memory

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// Pressure words, Aglaea's: the level the kernel's own pressure
// notifications use (kern.memorystatus_vm_pressure_level 1, 2, 4).
const (
	Normal   = "normal"
	High     = "high"
	Critical = "critical"
)

// Reader is where the numbers come from; tests fake it.
type Reader interface {
	// Sysctl returns `sysctl -n <name>`, trimmed.
	Sysctl(name string) (string, error)
	// VMStat returns the output of vm_stat.
	VMStat() (string, error)
}

// Reading is one sample. Bytes are bytes.
type Reading struct {
	Pressure   string
	TotalBytes uint64
	FreeBytes  uint64
}

// Level maps the kernel's pressure level to its word.
func Level(n int) (string, error) {
	switch n {
	case 1:
		return Normal, nil
	case 2:
		return High, nil
	case 4:
		return Critical, nil
	}
	return "", fmt.Errorf("kern.memorystatus_vm_pressure_level is %d, not 1, 2 or 4", n)
}

// Read takes one sample. Any part that cannot be read fails the whole
// reading: a zero would read as "no memory free".
func Read(r Reader) (Reading, error) {
	var out Reading
	s, err := r.Sysctl("kern.memorystatus_vm_pressure_level")
	if err != nil {
		return out, fmt.Errorf("pressure: %w", err)
	}
	n, err := strconv.Atoi(s)
	if err != nil {
		return out, fmt.Errorf("pressure: %q is not a number", s)
	}
	if out.Pressure, err = Level(n); err != nil {
		return out, err
	}
	s, err = r.Sysctl("hw.memsize")
	if err != nil {
		return out, fmt.Errorf("hw.memsize: %w", err)
	}
	if out.TotalBytes, err = strconv.ParseUint(s, 10, 64); err != nil || out.TotalBytes == 0 {
		return out, fmt.Errorf("hw.memsize: %q is not a size", s)
	}
	vm, err := r.VMStat()
	if err != nil {
		return out, fmt.Errorf("vm_stat: %w", err)
	}
	free, err := Available(vm)
	if err != nil {
		return out, err
	}
	out.FreeBytes = min(free, out.TotalBytes)
	return out, nil
}

var (
	pageSizeRe = regexp.MustCompile(`page size of (\d+) bytes`)
	vmLineRe   = regexp.MustCompile(`(?m)^"?([^:"]+)"?:\s+(\d+)\.?\s*$`)
)

// Available is Activity Monitor's available memory (its Physical Memory
// less Memory Used, which on macOS 26 equals its Cached Files) from vm_stat
// output: free, speculative and file-backed pages. The spec's first formula,
// total less app memory, wired and compressed, read about 1 GB higher than
// Activity Monitor on this Mac (the kernel holds memory vm_stat does not
// list); this one agreed within 0.05 GB over three screenshots, 2026-10-09
// (ram-sample card, G2). vm_stat was picked over host_statistics64 so the
// package needs no cgo and a test fakes it with a string; the counters are
// the same.
func Available(vm string) (uint64, error) {
	m := pageSizeRe.FindStringSubmatch(vm)
	if m == nil {
		return 0, errors.New("vm_stat: no page size")
	}
	page, _ := strconv.ParseUint(m[1], 10, 64)
	pages := map[string]uint64{}
	for _, l := range vmLineRe.FindAllStringSubmatch(vm, -1) {
		v, _ := strconv.ParseUint(l[2], 10, 64)
		pages[strings.TrimSpace(l[1])] = v
	}
	var sum uint64
	for _, k := range []string{"Pages free", "Pages speculative", "File-backed pages"} {
		v, ok := pages[k]
		if !ok {
			return 0, fmt.Errorf("vm_stat: no %q", k)
		}
		sum += v
	}
	return sum * page, nil
}

// System reads this machine through sysctl(8) and vm_stat(1).
type System struct{ Timeout time.Duration }

func (s System) Sysctl(name string) (string, error) {
	return s.run("sysctl", "-n", name)
}

func (s System) VMStat() (string, error) {
	return s.run("vm_stat")
}

func (s System) run(bin string, args ...string) (string, error) {
	t := s.Timeout
	if t <= 0 {
		t = 5 * time.Second
	}
	ctx, cancel := context.WithTimeout(context.Background(), t)
	defer cancel()
	var out, errb bytes.Buffer
	cmd := exec.CommandContext(ctx, bin, args...)
	cmd.Stdout, cmd.Stderr = &out, &errb
	if err := cmd.Run(); err != nil {
		if e := strings.TrimSpace(errb.String()); e != "" {
			return "", fmt.Errorf("%s: %s", bin, e)
		}
		return "", fmt.Errorf("%s: %w", bin, err)
	}
	return strings.TrimSpace(out.String()), nil
}
