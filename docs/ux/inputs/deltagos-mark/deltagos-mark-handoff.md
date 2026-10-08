# Deltagos mark — handoff for Claude Code

Source: `deltagos-forja-intro.html` (self-contained: HTML + CSS + vanilla JS, no build step).
Goal for next step: bring this animated mark into the Deltagos desktop app (Wails v2, React + TypeScript frontend) as the splash / brand mark, without changing how it looks or moves.

## What the mark is
- A **D** drawn as one continuous closed stroke (stroke-width 9 in a 100-unit space), violet.
- **Three gaps** travel together around the D, 13 units apart. Each gap has a **pointed head** (the end of the segment behind it) and a **V-notched tail** (the start of the segment in front), so the gaps read as a continuous arrow chasing its tail.
- **Speed varies** along the D: slowest on the stem, fastest at the outermost point of the bowl (cosine profile).
- **Gap length follows local speed**: longest (5.25) where slow, shrinking to fully closed near top speed, then reopening.
- **Two meshing gears behind the D**, clipped to the D's silhouette (stroke + counter). Big gear ember, small gear amber, on the 45° diagonal from the counter's centre. Small gear turns 2× faster, opposite direction. Teeth were checked numerically to never overlap.
- Nothing fades or enters: everything is in place from frame one; only the gaps travel and the gears turn.
- One colour per form. Wordmark "Deltagos" in Archivo (width 125, weight 700) with subtitle "From deltos, the writing tablet, and strategos, the general."

## Tuning constants (top of the script)
| Constant | Value | Meaning |
|---|---|---|
| `SPEED` | 24 | average belt speed, units/s |
| `VARY` | 0.65 | speed swing: 35%–165% of `SPEED` |
| `GAPS` | 3 | number of gaps, travelling as a group |
| `SPACING` | 13 | distance between gaps in the group |
| `CLOSE` | [0.5, 0.85] | speed band over which a gap closes |
| `GAP` | 5.25 | longest a gap gets |
| `TIP` / `NOTCH` | 3.2 / 3.2 | depth of the point and the notch |
| `HALF` | 4.5 | half stroke width |
| `GEAR` | cx 66.8, cy 64.8, 10 teeth, rOut 25.5, rIn 20.83, hole 7.65, phase 27 | big gear |
| `GEAR2` | 36.4 units up-left on the 45° diagonal, 5 teeth, rOut 13.9, rIn 9.25, hole 3.5, phase 27 | small gear |

Tooth shape: root half-width `0.33 × step`, tip half-width `0.2 × step`. If teeth count, shape or radii change, re-check meshing (no overlap through a full turn) and adjust the centre distance.

## Colours
| Token | Dark | Light |
|---|---|---|
| `--ground` | `#1A1433` | `#EFEAFB` |
| `--belt` (D) | `#9D80FF` | `#5634D6` |
| `--gear` (big) | `#FF6A4A` | `#D9452A` |
| `--gear2` (small) | `#FFC25A` | `#B87400` |
| `--ink` | `#F2EDFF` | `#1A1433` |
| `--ink-soft` | `#A99FCB` | `#5D5480` |

## How it works (keep this logic)
- The visible D is one `<path>` with a computed `stroke-dasharray` (segment, gap, segment, gap, …) and `stroke-dashoffset = -travel`.
- Points are separate `<polygon>`s in the D colour; notches are black polygons inside an SVG `<mask>` on the D path. Both are placed every frame with `getPointAtLength` + tangent, so they follow the curves.
- A gap with openness < 0.06 is treated as fully closed (no point/notch drawn) to avoid hairline seams.
- Gears sit in a group masked by the D's silhouette (same path, white fill + white 9-unit stroke).
- One `requestAnimationFrame` loop; `dt` capped at 50 ms. Respects `prefers-reduced-motion` (static frame). Pause button toggles `aria-pressed` and its label.

## Suggested next tasks
1. Port to a `<DeltagosMark />` React component in the Wails frontend: SVG in JSX, the loop in a `useEffect` with cleanup (`cancelAnimationFrame`), refs instead of `getElementById`, props for size and `animated`.
2. Bundle Archivo locally (the Wails app should not depend on Google Fonts at runtime).
3. Export a static app icon (`.icns` for macOS) from the reduced-motion frame, and check legibility at 16/32 px.
4. Optionally expose the tuning constants as props for a debug panel.
