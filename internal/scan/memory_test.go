package scan

import (
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// G3: an agent's mem_bytes is its process, two children and a grandchild,
// each by footprint, the one whose footprint cannot be read by its resident
// size. A nested agent counts its own tree and is not counted again.
func TestAgentMemTree(t *testing.T) {
	b, err := os.ReadFile(filepath.Join("..", "..", "testdata", "memory", "ps-tree.txt"))
	if err != nil {
		t.Fatal(err)
	}
	foot := map[int]uint64{600: 1_000_000, 601: 200_000, 603: 300_000, 700: 2_000_000, 701: 5_000_000}
	o := AgentOptions{
		AgentBinary: "claude",
		PS: func(args ...string) string {
			if !strings.Contains(strings.Join(args, " "), "ppid=") {
				t.Errorf("ps called without ppid: %v", args)
			}
			return string(b)
		},
		Footprint: func(pid int) (uint64, error) {
			if v, ok := foot[pid]; ok {
				return v, nil
			}
			return 0, errors.New("not ours") // 602, another user's
		},
	}
	got := map[int]uint64{}
	for _, a := range Agents(o) {
		got[a.PID] = a.MemBytes
	}
	want := map[int]uint64{
		600: 1_000_000 + 200_000 + 50000*1024 + 300_000,
		700: 2_000_000,
		701: 5_000_000,
	}
	if len(got) != len(want) {
		t.Fatalf("agents %v, want pids %v (the daemon is not an agent)", got, want)
	}
	for pid, w := range want {
		if got[pid] != w {
			t.Errorf("pid %d: mem_bytes %d, want %d", pid, got[pid], w)
		}
	}
}
