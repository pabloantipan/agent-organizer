---
title: Every health word says why and what to do
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: explain-health-words, branch explain-health-words, gate G3, G6 met, bfddcc6 8000b91 369055a 284add1"
depends_on: []
boundary: ["frontend/src/lib/health.ts (new)", "frontend/src/components/ContextBar.tsx", "frontend/src/components/Home.tsx (the health rows only)", "frontend/src/components/SlackView.tsx (the health counts' words only)", "internal/service/crew.go (the blocker reasons only)", "CLAUDE.md (the Slack paragraph's capped sentence)"]
spec: "docs/specs/machine-explains-itself.md (FR-4, FR-5); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G3, G6; the Gate section below"
stage: machine-explains-itself
seat: stage3-words
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-4, FR-5 of `docs/specs/machine-explains-itself.md`.

## Gate
- [x] G3: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 stage3-words: `frontend/src/lib/health.ts` is the one table (alive, never, stale, deaf, capped, no identity: label, why, what to do, blocker); WatcherBadge, Home's seat rows and the Conversations health counts read it; crew.go's capped reason is "capped, mail waits for its next prompt"; CLAUDE.md's capped sentence says the next prompt delivers it (bfddcc6, 8000b91, 369055a, 284add1, rebased on main). G3: `/Users/pabloantipan/organizer/.wt-notes/stage3-words/g3.txt`, `grep -rn -i -E "new session|probe -r" frontend/src internal/service/crew.go` → no match (exit 1), no "restart" in the table or the three components, with the table's contents. G6: `/Users/pabloantipan/organizer/.wt-notes/stage3-words/g6.txt`, `XDG_DATA_HOME=$(mktemp -d) make test` → every package ok (exit 0); `npm run build` → built (exit 0); G18 grep on main...explain-health-words → empty (exit 1).

## Next
1. review: explain-health-words, branch explain-health-words, gate G3, G6 met

## Blockers
none

## Notes
- 2026-09-28 sup10 runs this card (organizer-probe-sup10), spawned by the FSE after 0040
- 2026-09-28 stage3-words: comments still say capped is "unreachable until restarted" outside this boundary: `internal/service/crew.go:31` (the `Capped` field, not a blocker reason), `frontend/src/lib/queue.ts:10`, `internal/discuss/discuss.go:35-37` ("mail waits for a new session"). Not UI; for explain-health-all-agents or a follow-up.
- 2026-09-28 stage3-words: the frontend's lockfile is pnpm's; `npm ci` fails (EUSAGE), `pnpm install --frozen-lockfile` works. Task prompts should say so.
- 2026-09-28 stage3-words: "no identity" has no badge CSS yet (class `no-identity`); the next card styles it when it shows it.
