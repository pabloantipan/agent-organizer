---
title: Session names longer than 22 characters
status: next
repos: [organizer, claudecode]
branch: main
updated: 2026-09-26
next: "Point probe's zellij at a short socket dir so a 40-character session name starts, lists, attaches and dies; derive the organizer's ceiling from it in one constant"
depends_on: []
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
- [ ] 1. probe (and every `*-probe`) starts zellij with a socket dir short enough that a 40-character session name works: `organizer-probe-abcdefghijklmnopqrstuvwx` starts, shows in `probe -l`, attaches, and `probe -k` kills it. Evidence: the command output
- [ ] 2. Sessions started before the change stay listable and killable by `probe -l` / `probe -k` until they end (evidence: a session started with the old probe, then listed and killed with the new one)
- [ ] 3. `gen-probe-profiles` and `files` agree with probe's socket dir
- [ ] 4. The organizer has one ceiling constant, set from probe's new limit with its derivation in a comment; `crewSession` and the run warning both use it; the warning no longer says "truncates"; tests updated; `go vet ./... && go test ./...` green
- [ ] 5. `CLAUDE.md` Crew session names and Run gate paragraphs say the new ceiling and why
- [ ] 6. End to end: `organizer run organizer redesign-goal-stages --print` prints no session-length warning

## Done
- 2026-09-26 cut by the FSE from Pablo's ruling (0024)

## Next
1. Point probe's zellij at a short socket dir; derive the organizer's ceiling from it

## Blockers
none

## Notes
- `~/claudecode` has an uncommitted `settings.json` that is not this card's; stage named files only
- 2026-09-26 sup1 runs this card (organizer-probe-sup1), spawned by the FSE
