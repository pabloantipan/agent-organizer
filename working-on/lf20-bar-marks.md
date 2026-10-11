---
title: "Current is a line, open is a surface, in the bar"
status: now
repos: [organizer]
branch: lf20-bar-marks
seat: bm-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-bar-marks, B1 and X0 met, d9b7331"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-bar-marks"]
spec: "docs/specs/leftovers-20.md (FR-1, FR-2; initiatives-view Amendment 5, I35)"
gate: "docs/specs/leftovers-20.md Acceptance, rows B1 and X0"
ui_review: true
review: pass
---

## Goal
The current gear and the open ? look different (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows B1 and X0.

- [x] B1: vitest of the bar on Settings with and without Help, and offscreen WebKit computed styles: current gear `rgb(138, 63, 252) 0px -2px 0px 0px inset`, background transparent; open `?` background `--surface-selected` rgb(47, 27, 85), box-shadow none; over Settings the two differ. `.wt-notes/bm-build/b1-vitest.txt`, `.wt-notes/bm-build/b1-webkit.json`
- [x] X0: clean clone, `make test`, `pnpm run build`, `wails build` pass, `git status --porcelain` empty. `.wt-notes/bm-build/x0.txt`

## Done
- d9b7331: `.gear.on` is the tabs' 2 px accent underline with no fill; `?` open is `.gear.open`, `--surface-selected`, no line (bm-build, 2026-10-11).

## Review
Verdict: pass. B1 and X0 met at d9b7331; reviewer bm-review, 2026-10-11.

- B1: diff touches only `TopBar.tsx` (the `?` class `on` → `open`), `shell.css` (`.gear.on`, new `.gear.open`) and `TopBar.test.tsx`, inside the boundary. Vitest in a clean clone: `TopBar.test.tsx` 23/23, including the B1 block (Settings: gear `ghost gear on`; Help: `?` `ghost gear open`; both over Settings, differing; neither: no mark). Offscreen WKWebView (builder's `b1.swift`, rerun on my own build's css): Settings gear box-shadow `rgb(138, 63, 252) 0px -2px 0px 0px inset`, background `rgba(0, 0, 0, 0)`; open `?` background `rgb(47, 27, 85)` = `--surface-selected`, box-shadow `none`; Help over Settings both as above, different. No `.gear` rule depends on an ancestor, so the probe's markup reads as the bar does. `.wt-notes/bm-review/b1-vitest.txt`, `b1-webkit.json`.
- X0: fresh clone at d9b7331, `pnpm install --frozen-lockfile`, `XDG_DATA_HOME=$(mktemp -d) make test` pass (go, then vitest 40 files / 532 tests), `pnpm run build` pass, `wails build` pass, `git status --porcelain` empty, no `package-lock.json`. `.wt-notes/bm-review/x0-*.txt`. Clone removed.
- No AX or screencapture used and no review app launched: B1 rests on vitest plus WebKit computed styles, as the row allows.

Unmet: none. `## UI review` is missing, so status and place stay until it passes.

