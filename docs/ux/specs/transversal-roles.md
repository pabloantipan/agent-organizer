# Roles: the transversal seats in Deltagos

status: proposed
owner: pablo
by: aglaea, 2026-10-04, for the FSE (thread 01M4432DTFCSXJN9F715G84FYS)
rulings it rests on: 0082 (scope, Pablo's words); 0034 (Needs me is the
lead's queue only); 0013 and redesign FR-14 (rail, Home); the design
system (Widths, Focus and names, layers, dates as words)

Looked at: 0082, the live `zellij list-sessions` on lodestar (`probe-hefesto`,
`organizer-probe-aglaea`, `<initiative>-probe-fse`, supervisors), and
`~/agent-slack/docs/bitacora/hephaistos_bitacora.md` (one HAND-OFF per Mac,
titled with the host). From the data and the code, not from a running
screen; there is no screen yet.

## The problem, in the lead's terms

Pablo, 2026-09-30: "What I need now is seeing Hefestos and other principal
transversal roles in Deltagos App properly" (`said`). Today a role shows
only as a session inside whichever initiative its cwd falls in, or under
"unassigned". Nothing says it exists, whether it is running, what it is
doing, or that mail waits for it.

## The job

At a glance on Home: **which roles are up, what each is on, and whether one
waits on mail.** In one click, the detail. Show only: Deltagos never starts,
stops or messages a role from here (0082).

## Which roles

Configured, not hard-coded: a `roles` list in config, each with a name, a
one-line description, how its sessions are recognised (a session-name
pattern), where its bitácora lives, and whether it runs here. The default
list:

| Role | Sessions (by name) | Bitácora | Here? |
|---|---|---|---|
| Hephaistos | `probe-hefesto*` | `~/agent-slack/docs/bitacora/hephaistos_bitacora.md` | yes |
| Aglaea | `<project>-probe-aglaea` | `<initiative>/docs/bitacora/aglaea_bitacora.md` | yes, one seat per initiative |
| Ariadna | `*-probe-ariadna` | `<initiative>/docs/bitacora/ariadna_bitacora.md` | yes, none yet |
| Daedalus | `*-probe-daedalus` | `<initiative>/docs/bitacora/daedalus_bitacora.md` | yes (O1) |
| Talos | — | — | **no**: PLV infra, on odyssey |
| Hermione | — | — | **no**: PLV infra, on odyssey |

Talos and Hermione are **named only**, as the FSE read 0082 ("maybe naming
it here"). I agree with that reading, and the FSE may confirm it with Pablo
in the accept record. They show as one muted line, never with a status.

## Home: a Roles section

It sits **between Needs me and the initiatives** ("above the initiatives",
0082). Needs me stays first because it is the lead's queue (0034). It is
collapsible like Home's other sections and remembered per machine. One row
per role, one line, the same grid as the initiative rows:

| Column | Says | Example |
|---|---|---|
| name | the role | `Hephaistos` |
| state | live and context, or why not | `live · 42% context` · `2 sessions · 61% context` · `not running · last seen 2 Oct` · `not running` |
| doing now | its HAND-OFF's date and first line | `hand-off 30 Sep · Forged Aglaea, agent-slack waves…` · `no bitácora yet` |
| mail | waiting for it, with the noun | `2 messages waiting` · nothing when none |
| where | initiatives it touched | `organizer, camp, hestia` (text, never chips), `+N` past three |

The row's last line, muted, under the configured ones: `Talos, Hermione ·
PLV infra, on odyssey`. It has no state, no click and no count.

Widths: at compact, the row folds by the design system's order. The
state's live dot and context stay; "where" gives way first, then "doing
now". What gives way goes into the row's hover and accessible name.

## The rail: a Roles group

At the top of the rail, above the first initiative group, headed `Roles`,
collapsible like any rail group. One item per configured role that runs
here: the name, a live dot when live, and the mail count as a small number
(the same slot as an initiative's counts). Talos and Hermione are not in the
rail, since there is nothing to show. As the strip, each role is its
initial (`H`, `A`, `Ar`, `D`) with the live dot, and the name on hover.
Roles take no rank number: they are not priorities.

## A click: the role's drawer

Pressing a role (rail or Home) opens a **drawer**, the card back's pattern
(capped at the window, scrolls its own body, Escape closes, focus returns).
It is not a new screen. Its sections:

1. **Head**: name, the configured description, state as on the row.
2. **Sessions**: one line each: session name, initiative, `working` /
   `running` / `exited`, context %, started. With several Hephaistos
   sessions on this Mac, or Aglaea seats in several initiatives, each is a
   line. A session line links to that initiative's Agents, landing on the
   session (`openInitiative(id, "agents")`). Attach, Kill and Message stay
   there, not here (show only).
3. **Doing now**: the HAND-OFF block rendered read-only, with its date and
   `<path>` in mono. With one HAND-OFF per host (Hephaistos), this Mac's is
   shown first, titled `lodestar`, and the other's under it, folded,
   `odyssey · 2 Oct`.
4. **Mail waiting**: one line per thread: subject, from, age. Each opens
   Conversations on that thread. "Waiting" means, per role: threads
   addressed to its seat, or to `pablo` with a subject starting
   `[for <role>]`, that have no reply from the role after the ask.
5. **Initiatives**: the ones it touched, each opening that initiative.

## States

| State | Row | Drawer |
|---|---|---|
| live, one session | `live · 42% context` | one session line |
| live, several (Hephaistos ×2; Aglaea in 2 initiatives) | `2 sessions · 61% context` (the highest) | one line each |
| working | the live dot animates as on Agents | as on Agents |
| not running, seen before | `not running · last seen 2 Oct` (runs.jsonl) | no sessions, `Last seen 2 Oct in organizer` |
| never seen | `not running` | `No session yet. It starts outside Deltagos.` |
| no bitácora (Ariadna today) | doing now: `no bitácora yet` | Doing now: `No bitácora yet at <expected path>.` |
| bitácora without a HAND-OFF | doing now: its last log line, dated | the last five log lines |
| HAND-OFF older than 7 days | its date in `--fg-subtle` (`hand-off 21 Sep`) | the same, with `older than a week` |
| mail waiting | `2 messages waiting` | the threads |
| mail unknown (discuss down) | nothing in the mail column, title `mailbox not reachable` | `Mailbox not reachable.` |
| PLV infra roles | the one muted line | no drawer |
| no roles configured | no section, no rail group | — |

Counts: a role's mail is **not** in the Needs me badge, since it is not
the lead's queue (0034). Roles' sessions still show inside their
initiatives on Agents, as today. This adds a view; it moves nothing.

## Words

Section and rail heading `Roles`. On the row and in the drawer, `live`,
`working`, `not running`, `last seen 2 Oct`, `hand-off 30 Sep`,
`no bitácora yet`, `N message(s) waiting`, `PLV infra, on odyssey`. Dates
as words (design system Principles).

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| R1 | see on Home, between Needs me and the initiatives, which roles are live | fixture: Hephaistos and Aglaea sessions live, Ariadna and Daedalus none; four rows with the right state; the Talos/Hermione line last |
| R2 | read what each role is on without opening it | Hephaistos' row shows lodestar's HAND-OFF date and first line; Ariadna's says `no bitácora yet` |
| R3 | see mail waiting for a role | a `[for aglaea]` thread to pablo with no reply: `1 message waiting` on Aglaea's row and in the rail; the Needs me badge unchanged |
| R4 | tell several sessions apart | two `probe-hefesto*` sessions: `2 sessions · <max>% context`; the drawer lists both |
| R5 | open a role and go from it to its session or thread | the drawer opens with focus on its title; a session line lands on that initiative's Agents with the session focused; a thread opens in Conversations; Escape returns focus to the row |
| R6 | not start or stop anything here | the drawer and rows hold no Attach, Kill, Start or Message |
| R7 | use it at 1024×640 and as the strip | the row folds by the design system's order; the strip shows initials with the live dot; no horizontal page scroll |

## Open questions

- **O1** (FSE): Daedalus (head of architecture, skill since 2026-10-01) is a
  transversal role that 0082 did not list. I put it in the default list;
  remove it if Pablo meant only the five.
- **O2** (FSE): "initiatives touched" means the initiatives where it has a
  live or past session (runs.jsonl) or a bitácora. Say if the data has a
  better source.

## Technical notes

by the FSE, 2026-10-04, on main. Two cards: `roles-feed` (Go) then
`roles-ui` (frontend).

- **T1, config.** `roles` in `~/.config/organizer/config.yaml`
  (`config.Config`, json tags), each `{name, description, sessions (glob on
  the zellij session name), bitacora (a path, `<initiative>` expanded over
  each scanned initiative root), here (bool)}`; the default list is the
  table above when the key is absent; `roles: []` turns the section off.
- **T2, the feed.** `service.Roles` builds `[]model.Role` and rides the 10 s
  agents feed as `AgentsView.Roles` (one sample, no new ticker): sessions
  from the zellij list matched by glob, each with its cwd's initiative and
  context % from the existing statusline join (`Agent.Context`); state
  `live`, `not running` with last seen (`runs.jsonl` last_seen for a
  matching session name), or never seen; HAND-OFF: the first `## HAND-OFF`
  heading of each bitácora found, its date and first line, the date parsed
  from the heading, stale over 7 days; mail: open threads in every cell the
  organizer reads as the human whose subject starts `[for <name>]`
  (case-insensitive) and whose last message is not the role's reply (a body
  starting `[<name>`), via the existing discuss client (`GET
  /threads?status=open` per project); initiatives touched (O2): the
  initiatives of its live sessions, of its `runs.jsonl` sessions by cwd, and
  of the bitácoras found. Discuss down means mail unknown, not zero. A role
  with `here: false` carries its name only.
- **T3, binding and CLI.** New bound types need json tags and `wails
  generate module`; `organizer roles [--json]` prints the same view.
- **T4, Needs me untouched.** Role mail stays out of `queueOf`; 0079
  already leaves `[for <role>]` relays out.
- **T5, the UI** reads `AgentsView.Roles` only: Home's section, the rail's
  group (unranked, collapsible, initials in the strip), and a drawer on the
  card back's pattern; navigation through the store's existing
  `openInitiative(id, "agents")` and `openSlack`.
- **O1** (Daedalus): put to Pablo in the accept record; until ruled, the
  default list includes it as Aglaea proposed.
- Spec check (spec-craft 5b): rows R1-R7 read against these notes and the
  States table; no row asks for starting a session (0082 "show only");
  files found by grep (`AgentsView` at `internal/service/service.go:437`,
  `runs.jsonl`, `probe-hefesto` live). Result: holds.
