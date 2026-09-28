---
title: Session names longer than 22 characters
status: done
repos: [organizer, claudecode]
branch: main
updated: 2026-09-26
next: "review: main in claudecode and organizer, gate 1-6 met, claudecode baa1c7c 7ecdfa1, organizer 25046ec 2a9e669"
depends_on: []
review: pass
seat: w1a
boundary: ["/Users/pabloantipan/claudecode/bin/probe", "/Users/pabloantipan/claudecode/bin/gen-probe-profiles", "/Users/pabloantipan/claudecode/bin/files", "internal/service/crew.go (maxSessionName, crewSession)", "internal/service/run.go (the length warning)", "internal/service/crew_test.go", "internal/service/retire_test.go", "internal/service/run_test.go", "CLAUDE.md (the Crew session names paragraph, the Run gate paragraph)"]
spec: "decision 0024; the Goal and Facts below; CLAUDE.md Crew session names"
gate: "the Gate section below"
---

## Goal
`organizer-probe-` leaves six characters under the 22-character ceiling, so
builders and crew seats on long families get unreadable names (0024).

## Facts (read 2026-09-26, not re-verified by the builder yet)
- The ceiling is zellij's socket path: `$TMPDIR/zellij-<uid>/contract_version_1/<session>`
  under macOS's 104-byte cap; `$TMPDIR` here is 49 characters, the prefix 79.
- `~/bin/probe` is a symlink to `~/claudecode/bin/probe` (repo `~/claudecode`);
  probe:27-32 pins `TMPDIR=/tmp`, but live sessions (e.g. `organizer-probe-fse`)
  sit under `/var/folders/...`, so the pin is not what their servers saw.
  Nothing sets `ZELLIJ_SOCKET_DIR`. zellij is 0.44.3.
- The organizer has two ceilings: `maxSessionName = 22` (crew.go:38-42) and a
  bare 22 in run.go:136-139, whose warning says "probe truncates", which it
  does not.
- `working-on/done/crew-session-names.md:56`: moving the socket dir hides
  sessions started before the move from `probe -l/-k`.

## Gate
- [x] 1. probe (and every `*-probe`) starts zellij with a socket dir short enough that a 40-character session name works: `organizer-probe-abcdefghijklmnopqrstuvwx` starts, shows in `probe -l`, attaches, and `probe -k` kills it. Evidence: the command output
- [x] 2. Sessions started before the change stay listable and killable by `probe -l` / `probe -k` until they end (evidence: a session started with the old probe, then listed and killed with the new one)
- [x] 3. `gen-probe-profiles` and `files` agree with probe's socket dir
- [x] 4. The organizer has one ceiling constant, set from probe's new limit with its derivation in a comment; `crewSession` and the run warning both use it; the warning no longer says "truncates"; tests updated; `go vet ./... && go test ./...` green
- [x] 5. `CLAUDE.md` Crew session names and Run gate paragraphs say the new ceiling and why
- [x] 6. End to end: `organizer run organizer redesign-goal-stages --print` prints no session-length warning

## Done
- 2026-09-26 cut by the FSE from Pablo's ruling (0024)
- 2026-09-26 w1a built on main: claudecode baa1c7c (probe), 7ecdfa1 (gen-probe-profiles, files); organizer 25046ec (ceiling), 2a9e669 (CLAUDE.md). Why fse is under /var/folders: zellij 0.44.3 does honour TMPDIR (sup1/w1a/w1b servers run `--server /tmp/zellij-501/...`); the pin db1edb7 reached this checkout only by `pull --ff-only` at 14:00:54 (reflog; HEAD before was b4f43a5, no TMPDIR line), and fse's client started 13:01:12 with `TMPDIR=/var/folders/.../T/` (`ps -E`). Kept /tmp as the one socket dir. Evidence per gate item:
  1. `attach -b` under /tmp: 68 characters starts, 69 prints zellij's "long $TMPDIR path" error. New probe in an iTerm tab: `organizer-probe-abcdefghijklmnopqrstuvwx` (40) has its socket at /tmp/zellij-501/contract_version_1/, shows in `probe -l`, a second tab's `probe <name>` attached (`action list-clients`: clients 1 and 2), `probe -k` printed "deleted …", no server or state left. A 69-character name is refused by probe before anything is written: "is 69 characters; the socket dir /tmp/zellij-501/contract_version_1/ admits 68", exit 1
  2. Before the change `probe -l` showed live organizer-probe-fse as EXITED and omitted organizer-probe-told (started with the pre-pin probe b4f43a5, socket under /var/folders). After: `probe -l` lists fse and told live; `probe organizer-probe-told2` attached with `TMPDIR=/var/folders/...` (2 clients); `probe -k organizer-probe-told2` killed server and state. tcur (started with HEAD probe before the edit) listed and killed the same way
  3. gen-probe-profiles lists both dirs (profiles for fse, told, tcur, sup1, w1a, w1b); `files <session>` added a yazi pane to tcur (/tmp) and told2 (legacy, via its TMPDIR)
  4. `maxSessionName = 103 - len("/tmp/zellij-501/contract_version_1/")` (68) with its derivation; `sessionNameTooLong` used by `crewSession` and `PrepareLaunch`; the warning reads "… zellij holds at most 68; probe refuses it". Tests: TestMaxSessionNameIsProbesSocketBudget, crew table (ccint-camp-monorepo and the 40-char name fit, 74 refused), retire (73), TestPrepareLaunchWarnsOnlyOverTheSessionCeiling. `go vet ./...` clean; `go test ./...` green with HOME=temp; under the real HOME only internal/scan TestAttachSessions fails (pre-existing, untouched package, card retire-keeps-the-cell)
  5. CLAUDE.md Crew session names: 68, the socket path arithmetic, the 0.44.3 measurement, probe refuses, legacy sessions; Run gate: warns over `maxSessionName` (68), which probe refuses
  6. `go run . run organizer redesign-goal-stages --print` prints only the missing-prompt warning, no session-length one

## Review
- Verdict: pass. Unmet gate items: none. Reviewer r1a, 2026-09-26.
- 1: `organizer-probe abcdefghijklmnopqrstuvwx /tmp` in a new iTerm tab came up (server `--server /tmp/zellij-501/contract_version_1/organizer-probe-abcdefghijklmnopqrstuvwx`, client attached), listed in `organizer-probe -l`, `-k` printed "deleted …", no server, socket or state left.
- 2: legacy organizer-probe-fse (socket under DARWIN_USER_TEMP_DIR) lists live in `-l`; -k/-r/attach go through `zj_tmpdir`; kill evidence is the builder's told2.
- 3: gen-probe-profiles and files use the same /tmp plus legacy rule. 4: one derived constant, `sessionNameTooLong` in crewSession and PrepareLaunch; vet clean, `go test ./...` green with a temp HOME (real HOME: only the pre-existing internal/scan TestAttachSessions). 5: CLAUDE.md matches. 6: only the missing-prompt warning.
- Not covered by the gate: `Launch.Warnings` doc comment (run.go:50) still says "probe will truncate"; the constant hard-codes uid 501.

## Next
1. Review main in claudecode (baa1c7c, 7ecdfa1) and organizer (25046ec, 2a9e669)

## Blockers
none

## Notes
- `~/claudecode` has an uncommitted `settings.json` that is not this card's; stage named files only
- 2026-09-26 sup1 runs this card (organizer-probe-sup1), spawned by the FSE
- Found while building, not anticipated (w1a):
  - The supervise skill's 68 via TMPDIR=/tmp is right for 0.44.3; probe's comment said ">= 0.45", now corrected. zellij 0.44.3 also reads ZELLIJ_SOCKET_DIR (not used)
  - internal/scan/agents.go and internal/service/retire.go run `zellij list-sessions -n` with the organizer's own TMPDIR; the app from Finder has the per-user default, so it reads /tmp sessions as EXITED. Outside this boundary; needs its own card
  - `bin/agent` (ob- sessions) pins TMPDIR=/tmp without the legacy reach; ob-katherine is a legacy session
  - Before this change `probe -c` would have deleted the resurrection data of live legacy sessions (they read EXITED from /tmp). `-c` was not exercised after the change: it deletes real EXITED sessions
  - The first legacy test session ended on its own a minute after start, cause not found; the second lived through list, files, attach and kill
