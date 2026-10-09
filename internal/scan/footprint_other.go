//go:build !darwin || !cgo

package scan

import "errors"

// Footprint is darwin's; elsewhere every process falls back to resident size.
func Footprint(pid int) (uint64, error) {
	return 0, errors.New("footprint is read on darwin only")
}
