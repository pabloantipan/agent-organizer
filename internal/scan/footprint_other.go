//go:build !darwin || !cgo

package scan

import "errors"

// MemSource names what Agent.MemBytes sums in this build: without cgo there
// is no proc_pid_rusage, so every process is its resident size.
const MemSource = "resident size"

// Footprint is darwin's; elsewhere every process falls back to resident size.
func Footprint(pid int) (uint64, error) {
	return 0, errors.New("footprint is read on darwin only")
}
