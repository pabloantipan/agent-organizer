package cli

import (
	"bytes"
	"fmt"
	"strings"
	"testing"

	"organizer/internal/model"
)

// G4 (0107 A, FR-3 amendment 2): every session is listed by name under its
// initiative, also the ones the top five leaves out, such as a six-seat
// crew; initiatives biggest first, unassigned last even when bigger.
func TestPrintMemoryListsEverySession(t *testing.T) {
	var sessions []model.MemorySession
	for i := 1; i <= 6; i++ {
		sessions = append(sessions, model.MemorySession{Name: fmt.Sprintf("camp-probe-seat%d", i), Initiative: "ccint-camp-monorepo", Bytes: 500 << 20})
	}
	big := []model.MemorySession{
		{Name: "organizer-probe-a", Initiative: "organizer", Bytes: 900 << 20},
		{Name: "organizer-probe-b", Initiative: "organizer", Bytes: 800 << 20},
		{Name: "pid 42", Bytes: 700 << 20},
		{Name: "hestia-probe-fse", Initiative: "hestia", Bytes: 600 << 20},
	}
	all := append(big, sessions...)
	m := model.Memory{
		Pressure: "high", TotalBytes: 24 << 30, FreeBytes: 3 << 30, AgentsBytes: 5400 << 20,
		Top: all[:5],
		ByInitiative: []model.MemoryInitiative{
			{Initiative: "ccint-camp-monorepo", Bytes: 3000 << 20, Agents: 6},
			{Initiative: "organizer", Bytes: 1700 << 20, Agents: 2},
			{Unassigned: true, Bytes: 700 << 20, Agents: 1},
			{Initiative: "hestia", Bytes: 600 << 20, Agents: 1},
		},
	}
	var out bytes.Buffer
	printMemory(&out, m, all)
	got := out.String()
	for _, want := range []string{"pressure  high", "free      3.0 of 24.0 GB", "unassigned", "pid 42"} {
		if !strings.Contains(got, want) {
			t.Errorf("output lacks %q:\n%s", want, got)
		}
	}
	if strings.Contains(got, "top sessions") {
		t.Errorf("the top five is --json only:\n%s", got)
	}
	camp := strings.Index(got, "\nccint-camp-monorepo")
	org := strings.Index(got, "\norganizer ")
	hestia := strings.Index(got, "\nhestia ")
	unassigned := strings.Index(got, "\nunassigned ")
	if camp < 0 || !(camp < org && org < hestia && hestia < unassigned) {
		t.Fatalf("want camp, organizer, hestia, then unassigned:\n%s", got)
	}
	for _, s := range sessions {
		i := strings.Index(got[camp:], s.Name)
		if i < 0 || camp+i > org {
			t.Errorf("%s not listed under ccint-camp-monorepo:\n%s", s.Name, got)
		}
	}
}
