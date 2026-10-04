package cli

import (
	"encoding/json"
	"fmt"
	"io"
	"strings"
	"text/tabwriter"
	"time"

	"organizer/internal/cache"
	"organizer/internal/config"
	"organizer/internal/model"
	"organizer/internal/service"
)

const rolesUsage = "usage: organizer roles [--json]"

// rolesCmd prints the transversal roles the agents feed carries: a table in
// the spec's words, or the same []model.Role as JSON.
func rolesCmd(cfg config.Config, args []string, stdout, stderr io.Writer, now func() time.Time) int {
	args, asJSON := takeFlag(args, "--json")
	if len(args) > 0 {
		fmt.Fprintln(stderr, rolesUsage)
		return 2
	}
	st, _ := cache.Load()
	svc := service.NewWith(cfg, st, now)
	svc.Scan(false)
	roles := svc.RefreshAgents().Roles
	if asJSON {
		enc := json.NewEncoder(stdout)
		enc.SetIndent("", "  ")
		_ = enc.Encode(roles)
		return 0
	}
	WriteRoles(stdout, roles)
	return 0
}

// WriteRoles prints one line per role that runs here, then the ones that do
// not, named on one muted line per description.
func WriteRoles(w io.Writer, roles []model.Role) {
	if len(roles) == 0 {
		fmt.Fprintln(w, "no roles configured")
		return
	}
	tw := tabwriter.NewWriter(w, 0, 4, 2, ' ', 0)
	var away []string
	awayDesc := map[string][]string{}
	for _, r := range roles {
		if !r.Here {
			if len(awayDesc[r.Description]) == 0 {
				away = append(away, r.Description)
			}
			awayDesc[r.Description] = append(awayDesc[r.Description], r.Name)
			continue
		}
		fmt.Fprintf(tw, "%s\t%s\t%s\t%s\t%s\n", r.Name, roleState(r), roleDoing(r), roleMail(r), roleWhere(r))
		for _, s := range r.Sessions {
			ctx := ""
			if s.Context != nil {
				ctx = fmt.Sprintf("%d%% context", int(*s.Context+0.5))
			}
			fmt.Fprintf(tw, "  %s\t%s\t%s\t%s\t\n", s.Name, s.State, ctx, s.Initiative)
		}
	}
	tw.Flush()
	for _, d := range away {
		fmt.Fprintf(w, "%s · %s\n", strings.Join(awayDesc[d], ", "), d)
	}
}

func roleState(r model.Role) string {
	switch r.State {
	case model.RoleLive:
		s := "live"
		if n := liveSessions(r); n > 1 {
			s = fmt.Sprintf("%d sessions", n)
		}
		if r.Context != nil {
			s += fmt.Sprintf(" · %d%% context", int(*r.Context+0.5))
		}
		return s
	case model.RoleNotRunning:
		if r.LastSeen != nil {
			return "not running · last seen " + dayWords(*r.LastSeen)
		}
	}
	return "not running"
}

func liveSessions(r model.Role) int {
	n := 0
	for _, s := range r.Sessions {
		if s.State == model.AgentWorking || s.State == model.AgentRunning {
			n++
		}
	}
	return n
}

// roleDoing is the first bitácora's HAND-OFF, else its last log line.
func roleDoing(r model.Role) string {
	if len(r.Bitacoras) == 0 {
		return "no bitácora yet"
	}
	b := r.Bitacoras[0]
	if h := b.HandOff; h != nil {
		s := "hand-off"
		if t, err := time.Parse("2006-01-02", h.Date); err == nil {
			s += " " + dayWords(t)
		}
		if h.Stale {
			s += " (older than a week)"
		}
		return s + " · " + clip(h.FirstLine, 60)
	}
	if n := len(b.Log); n > 0 {
		l := b.Log[n-1]
		s := l.Text
		if t, err := time.Parse("2006-01-02", l.Date); err == nil {
			s = dayWords(t) + " · " + s
		}
		return clip(s, 70)
	}
	return "bitácora with nothing dated"
}

func roleMail(r model.Role) string {
	switch {
	case r.MailUnknown:
		return "mailbox not reachable"
	case len(r.Mail) == 1:
		return "1 message waiting"
	case len(r.Mail) > 1:
		return fmt.Sprintf("%d messages waiting", len(r.Mail))
	}
	return ""
}

func roleWhere(r model.Role) string {
	if len(r.Initiatives) > 3 {
		return strings.Join(r.Initiatives[:3], ", ") + fmt.Sprintf(" +%d", len(r.Initiatives)-3)
	}
	return strings.Join(r.Initiatives, ", ")
}

func dayWords(t time.Time) string { return t.Format("2 Jan") }
