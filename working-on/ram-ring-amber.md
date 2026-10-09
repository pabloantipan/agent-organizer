---
title: "The floating icon's ring always on in the tone, memory pressure in amber everywhere"
status: next
repos: [organizer]
branch: ram-ring-amber
seat: ra-build
stage: one-window
updated: 2026-10-09
next: "waits on 0109 (accept); sup50 runs it after deltagos-mark (shared floaticon_darwin.m)"
depends_on: [deltagos-mark]
boundary: ["floaticon_darwin.m (the ring layer: always on, colour by level, the 1 px keyline)", "frontend/src/styles/tokens.css (--fg-on-warning)", "the memory button's and the float list's memory-line css", "not: Go, the mark's own layers, any other use of --tone"]
spec: "docs/ux/specs/ram-indicator.md Amendment 2 (7bb03f4)"
gate: "this card's Gate section, rows R1 to R5"
ui_review: true
---

## Goal
Pablo, 2026-10-09: "the border pink brilliant arround the icon helped me a
lot to find the app quickly ... keeping it and maybe using an orange tone when
ram spikes up". Aglaea's design: the ring always on in the tone; high and
critical in `--amber-9`, on the icon, the top bar and the panel line.

## Gate
- [ ] R1 (M9) at normal, the 2 px tone ring with its 1 px ground keyline shows on a light and a dark wallpaper (review build, fixture, shots)
- [ ] R2 (M10) high: amber 2 px ring; critical: amber 3 px breathing, steady under Reduce motion (`ORGANIZER_MEMORY_FAKE` per level, shots and the float log)
- [ ] R3 (M10) the top bar's high text and critical chip are amber, the chip's text `--fg-on-warning`, contrast >= 4.5:1 computed and logged
- [ ] R4 no reading or a failed reading shows the tone ring, as normal
- [ ] R5 `make test`, `cd frontend && npm run build`, `wails build` pass
