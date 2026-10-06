package usage

import "testing"

func TestAttributeRolesAndTasks(t *testing.T) {
	inits := fixtureInitiatives()
	inits[0].Seats = []string{"fse", "po_andrea"}
	inits[0].Cards = append(inits[0].Cards,
		Card{Slug: "header-fold", Title: "Header fold", Seat: "hdr-fold"},
		Card{Slug: "dup-a", Seat: "dup-build"}, Card{Slug: "dup-b", Seat: "dup-build"},
		Card{Slug: "solo", Title: "Solo", Body: "- sup16 runs this card (org-probe-sup16)\n"},
		Card{Slug: "fic", Title: "Fic", Body: "## Done\n- 2026-10-05 sup43 launched fic-build\n"},
		Card{Slug: "fic-2", Title: "Fic 2", Body: "Details left by sup43 and sup44.\n## Done\n- 2026-10-05 sup40: seats ended\n"})
	inits = append(inits, Initiative{ID: "nested", Root: "/home/p/org/nested"})

	tests := []struct {
		name                   string
		seen                   Seen
		initiative, role, task string
		wantReason             bool
	}{
		{"builder by suffix", Seen{Name: "org-probe-rlf-build", Cwd: "/home/p/org"}, "org", RoleBuilder, "ruled-line-floor", false},
		{"reviewer of the same card", Seen{Name: "org-probe-rlf-review", Cwd: "/home/p/org/.wt/gone"}, "org", RoleReviewer, "ruled-line-floor", false},
		{"ui reviewer", Seen{Name: "org-probe-rlf-ui", Cwd: "/home/p/org"}, "org", RoleUIReviewer, "ruled-line-floor", false},
		{"cross-check x1 is a reviewer", Seen{Name: "org-probe-fi3-x1", Cwd: "/home/p/org"}, "org", RoleReviewer, "floating-icon-3", false},
		{"second launch of a suffixless seat", Seen{Name: "org-probe-hdr-fold2", Cwd: "/home/p/org"}, "org", RoleBuilder, "header-fold", false},
		{"review infix", Seen{Name: "org-probe-hdr-fold-review2", Cwd: "/home/p/org"}, "org", RoleReviewer, "header-fold", false},
		{"supervisor of a wave", Seen{Name: "org-probe-sup46", Cwd: "/home/p/org"}, "org", RoleSupervisor, "wave:sup46", false},
		{"supervisor of one card", Seen{Name: "org-probe-sup16", Cwd: "/home/p/org"}, "org", RoleSupervisor, "solo", false},
		{"supervisor that launched a seat", Seen{Name: "org-probe-sup43", Cwd: "/home/p/org"}, "org", RoleSupervisor, "fic", false},
		{"supervisor in a log bullet", Seen{Name: "org-probe-sup40", Cwd: "/home/p/org"}, "org", RoleSupervisor, "fic-2", false},
		{"a passing mention is not a supervisor's card", Seen{Name: "org-probe-sup44", Cwd: "/home/p/org"}, "org", RoleSupervisor, "", true},
		{"supervisor of nothing", Seen{Name: "org-probe-sup9", Cwd: "/home/p/org"}, "org", RoleSupervisor, "", true},
		{"two cards is no card", Seen{Name: "org-probe-dup-review", Cwd: "/home/p/org"}, "org", RoleReviewer, "", true},
		{"fse", Seen{Name: "org-probe-fse", Cwd: "/home/p/org"}, "org", RoleFSE, "", false},
		{"persona by short name", Seen{Name: "org-probe-andrea", Cwd: "/home/p/org"}, "org", RolePersona, "", false},
		{"persona from AGENT_NAME", Seen{Persona: "po_andrea", Cwd: "/home/p/org"}, "org", RolePersona, "", false},
		{"pair by name", Seen{Name: "probe-hefesto", Cwd: "/home/p"}, "", RolePair, "", true},
		{"pair by skill, no name", Seen{Pair: "hephaistos", Cwd: "/home/p/org"}, "org", RolePair, "", false},
		{"named plain session", Seen{Name: "isolate-access", Cwd: "/home/p/org"}, "org", RoleSession, "", false},
		{"no name at all", Seen{Cwd: "/home/p/org"}, "org", "", "", true},
		{"longest root wins", Seen{Name: "x-probe-fse", Cwd: "/home/p/org/nested/a"}, "nested", RoleFSE, "", false},
		{"session name from the record", Seen{Session: "org-probe-fi3-build", Cwd: "/home/p/org"}, "org", RoleBuilder, "floating-icon-3", false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			a := Attribute(tt.seen, inits)
			if a.Initiative != tt.initiative || a.Role != tt.role || a.Task != tt.task || (a.Reason != "") != tt.wantReason {
				t.Errorf("got %+v, want %s/%s/%s reason=%v", a, tt.initiative, tt.role, tt.task, tt.wantReason)
			}
		})
	}
	if a := Attribute(Seen{Name: "org-probe-sup46", Cwd: "/home/p/org"}, inits); len(a.Cards) != 2 || a.TaskTitle != "sup46 · floating-icon-3, ruled-line-floor" {
		t.Errorf("wave = %+v", a)
	}
}

func TestWeekStart(t *testing.T) {
	for week, want := range map[string]string{"2026-W41": "2026-10-05", "2026-W40": "2026-09-28", "2026-W01": "2025-12-29", "2020-W53": "2020-12-28"} {
		got, err := WeekStart(week, nil)
		if err != nil || got.Format("2006-01-02") != want {
			t.Errorf("WeekStart(%s) = %v %v, want %s", week, got, err, want)
		}
	}
	for _, bad := range []string{"2026-41", "2026-W54", "2025-W53"} {
		if _, err := WeekStart(bad, nil); err == nil {
			t.Errorf("WeekStart(%s) should fail", bad)
		}
	}
}
