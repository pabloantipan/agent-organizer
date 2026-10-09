package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// memoryFakeEnv forces the memory reading for a review (docs/specs/ram-indicator.md,
// Acceptance (ram-view)): normal, high, critical or fail, or @<file> to read
// one of those words from the file at every sample, so a reviewer walks the
// levels (critical, then normal for "Was critical until") without a restart.
// Unset, the real reading.
//
// The reading itself is not replaced: the service's reader runs sysctl(8)
// and vm_stat(1) by name, so stand-ins for those two go first on this
// process's PATH. The service then reads, times and warns exactly as it
// does for real (since, was_critical_until, the warn rule); only the
// numbers are the stand-ins'. Any other sysctl name goes to the real one.
const memoryFakeEnv = "ORGANIZER_MEMORY_FAKE"

// A 32 GB Mac with Aglaea's example figures free: 12 GB at normal, 3.1 at
// high, 1.2 at critical (as 16 KB pages).
const memoryFakeLevel = `level() {
  w=%q
  case "$w" in @*) w=$(cat "${w#@}" 2>/dev/null | tr -d '[:space:]') ;; esac
  case "$w" in
    normal) echo 1 786432 ;;
    high) echo 2 203162 ;;
    critical) echo 4 78643 ;;
    fail) echo "forced to fail by ORGANIZER_MEMORY_FAKE" >&2; exit 1 ;;
    *) echo "ORGANIZER_MEMORY_FAKE=$w is not normal, high, critical or fail" >&2; exit 1 ;;
  esac
}
`

const memoryFakeSysctl = `#!/bin/sh
%s
case "$*" in
  "-n kern.memorystatus_vm_pressure_level") l=$(level) || exit 1; set -- $l; echo "$1" ;;
  "-n hw.memsize") level >/dev/null || exit 1; echo 34359738368 ;;
  *) exec /usr/sbin/sysctl "$@" ;;
esac
`

const memoryFakeVMStat = `#!/bin/sh
%s
l=$(level) || exit 1
set -- $l
printf 'Mach Virtual Memory Statistics: (page size of 16384 bytes)\nPages free:                               %%s.\nPages speculative:                         0.\nFile-backed pages:                         0.\n' "$2"
`

// memoryFake puts the stand-ins first on PATH when the env asks for them,
// and says so; it returns "" when the real reading stands.
func memoryFake() (string, error) {
	v := strings.TrimSpace(os.Getenv(memoryFakeEnv))
	if v == "" {
		return "", nil
	}
	dir, err := os.MkdirTemp("", "organizer-memory-fake-")
	if err != nil {
		return "", err
	}
	level := fmt.Sprintf(memoryFakeLevel, v)
	for name, body := range map[string]string{"sysctl": memoryFakeSysctl, "vm_stat": memoryFakeVMStat} {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(fmt.Sprintf(body, level)), 0o755); err != nil {
			return "", err
		}
	}
	if err := os.Setenv("PATH", dir+string(os.PathListSeparator)+os.Getenv("PATH")); err != nil {
		return "", err
	}
	return dir, nil
}
