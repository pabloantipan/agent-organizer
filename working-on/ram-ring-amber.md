---
title: "The floating icon's ring always on in the tone, memory pressure in amber everywhere"
status: now
repos: [organizer]
branch: ram-ring-amber
seat: ra-build
stage: one-window
updated: 2026-10-09
next: "review: ram-ring-amber, R1-R5 met (R1 on white and black composites, not Pablo's wallpaper), f329879"
depends_on: [deltagos-mark]
boundary: ["floaticon_darwin.m (the ring layer: always on, colour by level, the 1 px keyline)", "frontend/src/styles/tokens.css (--fg-on-warning)", "the memory button's and the float list's memory-line css", "not: Go, the mark's own layers, any other use of --tone"]
spec: "docs/ux/specs/ram-indicator.md Amendment 2 (7bb03f4)"
gate: "this card's Gate section, rows R1 to R5"
ui_review: true
review: pass
---

## Goal
Pablo, 2026-10-09: "the border pink brilliant arround the icon helped me a
lot to find the app quickly ... keeping it and maybe using an orange tone when
ram spikes up". Aglaea's design: the ring always on in the tone; high and
critical in `--amber-9`, on the icon, the top bar and the panel line.

## Gate
- [x] R1 (M9) at normal, the 2 px tone ring with its 1 px ground keyline shows on a light and a dark wallpaper (review build, fixture, shots) — `.wt-notes/ra-build/composite-white-black-272x136-R1-normal.png`, `float-levels.log` l.2, `ring-pixels.txt`
- [x] R2 (M10) high: amber 2 px ring; critical: amber 3 px breathing, steady under Reduce motion (`ORGANIZER_MEMORY_FAKE` per level, shots and the float log) — `.wt-notes/ra-build/native-136x136-R2-high.png`, `…-R2-critical-a/b.png`, `…-R2-critical-reduce-motion-a/b/c.png`, `float-levels.log` l.14-15, `float-reduce.log` l.9
- [x] R3 (M10) the top bar's high text and critical chip are amber, the chip's text `--fg-on-warning`, contrast >= 4.5:1 computed and logged — `.wt-notes/ra-build/vitest-R3-contrast.log` (`frontend/src/lib/memoryColour.test.ts`): 9.77:1 chip and top bar, 7.80:1 on the overlay
- [x] R4 no reading or a failed reading shows the tone ring, as normal — `.wt-notes/ra-build/native-136x136-R4-fail.png`, `float-levels.log` l.16 (fail) and l.2 (no reading yet)
- [x] R5 `make test`, `cd frontend && npm run build`, `wails build` pass — `.wt-notes/ra-build/r5-make-test.out`, `r5-npm-build.out`, `r5-wails-build.out`, clean clone of ef8f7ee

## Done
- 2026-10-09, ra-build: ring always on (tone at normal, no and failed readings; amber 2 pt high, 3 pt breathing critical, steady under Reduce motion) with a steady 1 pt #1a1523 keyline (c0354cd); memory pressure amber in the top bar, popover pressure line and float line, chip text `--fg-on-warning` (f329879). Evidence and how to reproduce: `.wt-notes/ra-build/progress.md`.

## Notes
- 2026-10-09: added to sup50's task (window 8383) by the FSE.
- 2026-10-09, ra-build: R1's light and dark wallpaper are the icon's window shot alone (`screencapture -o -l`) composited over #ffffff and #000000; Pablo's wallpaper was not changed. The popover's pressure line turned amber too ("for memory only"), not a gate row.

## Review
- Verdict: pass, f329879 (R1-R5 met; R5 rerun from a clean clone at f329879: make test, npm run build, wails build all exit 0).
- Unmet gate rows: none.
- Notes: R1's light wallpaper is a composite over #ffffff, not a real wallpaper (0108 allows it). `floatIconMemory`'s comment in `floaticon_darwin.go` still says "anything else ... draws nothing"; stale since the ring draws the tone (Go was outside the boundary).
- Reviewer: ra-review, 2026-10-09.
