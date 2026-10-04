package model

import "time"

// The states of a transversal role (docs/ux/specs/transversal-roles.md,
// States). A role that does not run here has no state.
const (
	RoleLive       = "live"
	RoleNotRunning = "not_running"
	RoleNeverSeen  = "never_seen"
)

// Role is one configured transversal role as the agents feed carries it: its
// sessions, what it is on, the mail waiting for it and the initiatives it
// touched. Derived on every sample, never stored. A role with Here false
// carries its name and description only.
type Role struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Here        bool   `json:"here"`
	// State is live (a session of it has an agent process), not_running (no
	// live session, but runs.jsonl or a session has seen it), or never_seen.
	// Empty when Here is false.
	State string `json:"state"`
	// Working is true when one of its sessions is working.
	Working bool `json:"working"`
	// Sessions are the zellij sessions whose name matches the role's glob,
	// live or not, as the agents feed found them.
	Sessions []RoleSession `json:"sessions"`
	// Context is the highest context fill over its live sessions, nil when
	// no live session has reported one.
	Context *float64 `json:"context"`
	// LastSeen is the latest last_seen in runs.jsonl of a run whose session
	// name matches, nil when no run does. LastSeenIn is that run's
	// initiative, by its cwd.
	LastSeen   *time.Time `json:"last_seen"`
	LastSeenIn string     `json:"last_seen_in"`
	// Bitacoras are the bitácoras found, in initiative order; empty means
	// "no bitácora", and BitacoraExpected says where one was looked for
	// (the configured path, ~ expanded, <initiative> kept).
	Bitacoras        []RoleBitacora `json:"bitacoras"`
	BitacoraExpected string         `json:"bitacora_expected"`
	// Mail is the open threads waiting for it; MailUnknown is true when the
	// mailbox could not be read, and then Mail means nothing (never zero).
	Mail        []RoleMail `json:"mail"`
	MailUnknown bool       `json:"mail_unknown"`
	// Initiatives it touched: of its live sessions, of its bitácoras, then of
	// its runs.jsonl sessions by cwd, newest first, without repeats.
	Initiatives []string `json:"initiatives"`
}

// RoleSession is one session of a role.
type RoleSession struct {
	Name string `json:"name"`
	// Initiative is the one its cwd falls in, empty when none.
	Initiative string `json:"initiative"`
	// State is the agent's: working, running, shell or exited.
	State   string `json:"state"`
	Working bool   `json:"working"`
	// Context is the statusline's last fill for its process, nil when none.
	Context *float64 `json:"context"`
	// Created is the zellij session age when known, Uptime the process's.
	Created string `json:"created"`
	Uptime  string `json:"uptime"`
	PID     int    `json:"pid"`
}

// RoleBitacora is what one bitácora says the role is on: its HAND-OFF when it
// has one, else its last dated log lines.
type RoleBitacora struct {
	Path string `json:"path"`
	// Initiative is the one the bitácora sits in, empty when none.
	Initiative string `json:"initiative"`
	// HandOff is the first HAND-OFF heading, nil when the file has none.
	HandOff *RoleHandOff `json:"hand_off"`
	// Others are the bitácora's other HAND-OFF sections in file order: a
	// bitácora two Macs share keeps one per host, and HandOff is this
	// machine's when a heading names it, else the first.
	Others []RoleHandOff `json:"others"`
	// Log is the last five dated log lines, oldest first, when there is no
	// HAND-OFF; the row shows the last one.
	Log []RoleLogLine `json:"log"`
}

// RoleHandOff is a bitácora's first HAND-OFF section, read, never rendered.
type RoleHandOff struct {
	// Title is the heading without its hashes.
	Title string `json:"title"`
	// Date is the first YYYY-MM-DD in the heading, empty when it has none.
	Date string `json:"date"`
	// Host is the heading's word after the date ("2026-09-30, lodestar"),
	// empty when it names none.
	Host string `json:"host"`
	// FirstLine is the section's first paragraph or list item on one line,
	// a list marker dropped.
	FirstLine string `json:"first_line"`
	// Body is the section verbatim, for the drawer.
	Body string `json:"body"`
	// Stale is true when Date is more than seven days before the sample.
	Stale bool `json:"stale"`
}

// RoleLogLine is one dated line of a bitácora's log.
type RoleLogLine struct {
	Date string `json:"date"`
	Text string `json:"text"`
}

// RoleMail is one open thread waiting for a role: its subject starts
// "[for <role>]" and its last message is not the role's reply.
type RoleMail struct {
	ThreadID string `json:"thread_id"`
	Subject  string `json:"subject"`
	Project  string `json:"project"`
	// Initiative is the one whose cell holds the thread.
	Initiative string `json:"initiative"`
	// From is who opened the thread, empty when unknown.
	From       string `json:"from"`
	Status     string `json:"status"`
	AgeSeconds int64  `json:"age_seconds"`
}
