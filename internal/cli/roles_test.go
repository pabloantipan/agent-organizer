package cli

import (
	"bytes"
	"strings"
	"testing"
	"time"

	"organizer/internal/model"
)

// The table says each state in the spec's words.
func TestWriteRoles(t *testing.T) {
	f := func(v float64) *float64 { return &v }
	seen := time.Date(2026, 10, 2, 9, 0, 0, 0, time.Local)
	roles := []model.Role{
		{Name: "Hephaistos", Here: true, State: model.RoleLive, Context: f(61),
			Sessions:  []model.RoleSession{{Name: "probe-hefesto", State: "running", Context: f(42)}, {Name: "probe-hefesto-2", State: "working", Context: f(61)}},
			Bitacoras: []model.RoleBitacora{{HandOff: &model.RoleHandOff{Date: "2026-09-30", FirstLine: "Forged the roles feed."}}},
			Mail:      []model.RoleMail{{ThreadID: "a"}, {ThreadID: "b"}}, Initiatives: []string{"a", "b", "c", "d"}},
		{Name: "Aglaea", Here: true, State: model.RoleNotRunning, LastSeen: &seen, MailUnknown: true,
			Bitacoras: []model.RoleBitacora{{HandOff: &model.RoleHandOff{Date: "2026-09-21", FirstLine: "x", Stale: true}}}},
		{Name: "Ariadna", Here: true, State: model.RoleNotRunning,
			Bitacoras: []model.RoleBitacora{{Log: []model.RoleLogLine{{Date: "2026-09-29", Text: "first wake"}}}}},
		{Name: "Daedalus", Here: true, State: model.RoleNeverSeen},
		{Name: "Talos", Description: "PLV infra, on odyssey"},
		{Name: "Hermione", Description: "PLV infra, on odyssey"},
	}
	var b bytes.Buffer
	WriteRoles(&b, roles)
	out := b.String()
	for _, want := range []string{
		"2 sessions · 61% context", "hand-off 30 Sep · Forged the roles feed.", "2 messages waiting", "a, b, c +1",
		"not running · last seen 2 Oct", "hand-off 21 Sep (older than a week)", "mailbox not reachable",
		"29 Sep · first wake", "no bitácora yet", "Talos, Hermione · PLV infra, on odyssey",
	} {
		if !strings.Contains(out, want) {
			t.Errorf("missing %q in\n%s", want, out)
		}
	}
	b.Reset()
	WriteRoles(&b, []model.Role{})
	if b.String() != "no roles configured\n" {
		t.Errorf("no roles = %q", b.String())
	}
}
