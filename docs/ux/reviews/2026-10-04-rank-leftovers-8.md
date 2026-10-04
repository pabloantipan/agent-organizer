# Ranked: sup33's leftovers (layers-focus-and-words) with A1–A3

- **Asked by:** the FSE, thread 01M43Z4MM70GV0TH1NAJC2D28A. Nothing is
  building, so there is no overlap to name.
- **Sources:** `working-on/done/layers-focus-and-words.md` (code review and
  its deltas; UI review U1–U6, G1–G4, A1–A3). I did not re-run it. My calls
  on A1–A3 are 80ab772.
- **Already fixed in the wave:** U1 (sev 3, the fourth milestone invisible at
  Fit, da128f9) and Help closing with no box losing focus (41f1b77).
- **Design system, amended in the same commit** (Principles): dates read
  as words everywhere a person reads them; the lead's words are kept
  verbatim (no autocorrect or autocapitalize). With these, rows 3 and 5 are
  conformance.
- **None needs Pablo.**

| # | What the lead cannot do, or does wrong | From | Sev | Kind | Direction |
|---|---|---|---|---|---|
| 1 | Ruling from Needs me, a wide table in the record is crushed to broken words ("cli ent", "scanne r proble ms") | U2 | 2 | DS | A body never widens its view, and its tables scroll inside themselves: `.rb .rb-body table { overflow-wrap: normal }`, with the edge, as in the card back |
| 2 | While ruling at 1024×640, the box covers the record's card link | U3, A1, G4 | 2 | Design (80ab772) | The facts line joins the stuck head while ruling; the box opens below it, at every width (decisions-view §8) |
| 3 | In WKWebView the ruling's words are silently autocorrected ("words" → "Words"), and the correction bubble eats the first Escape | U4, G1 | 2 | DS | Verbatim, as amended: `autocorrect="off" autocapitalize="off"` (and `spellcheck` off) on the rule box's words, a card note, the composer |
| 4 | At 1512×945 with the rail as a strip, WKWebView's Home list stops ~200 px short while goals and the next date are cut | A3 | 2 | DS (Widths) | Measure WKWebView against Chromium first (a max-width, or the scrollbar gutter). The list fills to the content edge before anything is cut |
| 5 | Record meta, Timeline row names and Stages still read ISO dates | U5, G2 | 1 | DS | Dates as words, as amended: `raised 4 Oct by fse`, `done 15 Aug` |
| 6 | The card back scrolls on its backdrop, and its foot shows no edge | U6, A2 | 1 | DS (80ab772) | The drawer is capped at the window and scrolls its own body, with the edge |
| 7 | WKWebView's tree exposes a crowd's "+1" as plain text, so its "1 more: …" reaches a screen reader only through the hidden mark | U1 residue | 1 | DS (Names) | `.tz-more` carries its own name, "and 1 more: Billing switched on", and the hover title |

## Gates and code (not UI changes)

| # | What | Direction |
|---|---|---|
| S1 | P7 passed the builder's text check while the "+1" was clipped out of view | A gate row about something visual hit-tests it (`elementFromPoint` or the AX element at its centre), in both engines |
| S2 | From a clean checkout, `make test` fails at `go vet`: `main.go` embeds `frontend/dist` | The FSE's: build the frontend before `go vet` in `make test`, or a stub `dist` |
| S3 | A UI reviewer's synthetic click landed in another app's window | supervise's: drivers refuse points outside their own window (lf7-ui already does) |
