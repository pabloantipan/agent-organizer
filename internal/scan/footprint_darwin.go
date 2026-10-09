//go:build darwin && cgo

package scan

/*
#include <libproc.h>
#include <sys/resource.h>

static int organizer_footprint(int pid, unsigned long long *out) {
	struct rusage_info_v2 ri;
	if (proc_pid_rusage(pid, RUSAGE_INFO_V2, (rusage_info_t *)&ri) != 0) {
		return -1;
	}
	*out = ri.ri_phys_footprint;
	return 0;
}
*/
import "C"

import "fmt"

// Footprint is a process's physical footprint (ri_phys_footprint from
// proc_pid_rusage), the figure Activity Monitor's Memory column shows. It
// fails for another user's process.
func Footprint(pid int) (uint64, error) {
	var v C.ulonglong
	if C.organizer_footprint(C.int(pid), &v) != 0 {
		return 0, fmt.Errorf("proc_pid_rusage %d failed", pid)
	}
	return uint64(v), nil
}
