# Launch progress (aglaea, 2026-10-14)

The FSE's question after lf23-detached-launch (089a90d, sup63): each seat
now starts detached and is checked. A launch blocks 30 to 60 s until probe
confirms the pane runs claude (exit 3 otherwise, one retry). Bring crew up
on five seats can take minutes with nothing on screen. Run card and New
agent do the same for one seat. This is for leftovers-27.

## The problem, in the lead's terms

He presses Bring crew up and nothing moves for minutes. He cannot tell
waiting from stuck, so he presses again, or leaves and never learns that a
seat did not start.

## The design

### 1. Bring crew up: a seat list that fills in, in place

The crew block shows the progress where the button was. It is not a box
and not a modal, and the rest of the app stays usable.

```
Starting crew · 2 of 5 running                          [Stop starting]
  ✓ fse        running
  ✓ aglaea     running
  … hermes     starting · 34 s
    athena     waiting
    hephaistos waiting
```

- One line per seat, in launch order. Each seat is in one of these states:

  | State | Shape | Ink |
  |---|---|---|
  | `waiting` | none | muted |
  | `starting · <n> s` | `…` | default |
  | `trying again · <n> s` | `↻` | `--warning` |
  | `running` | `✓` | `--live` |
  | `didn't start` | `✕` | `--danger` |

  Each state is a word with a shape, never a colour alone.
- The seconds count up as text and nothing spins, so there is no motion to
  pause (WCAG 2.2.2). The counter is `aria-hidden`.
- **Focus** moves to the line `Starting crew · n of m running`, a heading
  with `tabindex="-1"`, since the button that was pressed is gone.
- **A polite live region** says each seat's result once (`hermes running`,
  `athena didn't start`), and the total at the end. It says nothing per
  second.
- **Stop starting** is a quiet button. It lets the seat in flight finish
  and skips the ones still `waiting`, which go back to `off`. It does not
  kill anything.
- **When all are done**, the list stays for 5 s if every seat runs, then
  the crew block shows its usual rows. If any seat failed, the list stays
  until the lead acts.
- **If he leaves** the Agents view, the launch goes on. Coming back shows
  the list as it stands, since the state lives in the service, not the
  view. If he is not on that initiative's Agents when a seat ends in
  `didn't start`, Needs me gets one row, `Crew of <id>: <n> seat(s) didn't
  start`, with the verb **Agents**. The row goes once he has seen the list
  or retried.

### 2. A seat that failed twice

```
  ✕ athena     didn't start · the pane did not run claude (probe exit 3, twice)
               [Try again]  [Copy the command]
```

- The reason is in plain words, followed by probe's exit and the count. It
  is one line, and the full probe output is in the hover and in
  `organizer.log`, not on the screen (design system: never a raw error on
  screen).
- **Try again** starts that seat alone, with the same states.
- **Copy the command** copies the seat's `launchLine`, so the lead can run
  it in a terminal and see why.
- Bring crew up comes back as `Bring 1 up` (as now, counting `off` seats)
  once the list closes.

### 3. Run card and New agent: one seat, inline

One seat, so no list. The pressed button becomes the state, in the same
place and at the same width:

- `Starting · 23 s` is disabled with the reason in its name (`Starting
  <name>, 23 seconds`), with focus kept on it. It moves to `Trying again ·
  41 s`.
- `running`: the new agent row appears, focus moves to it, and the live
  region says `<name> running`.
- `didn't start`: the button comes back, with one line under it in
  `--danger`: the reason, followed by `Try again` and `Copy the command`,
  as in §2. Focus goes to `Try again`.

### 4. What the service must tell the view (for the FSE)

The view needs per-seat events: queued, starting (with the start time),
retrying, running, failed (with the reason and exit). The elapsed seconds
are computed in the view from the start time. How they travel (a Wails
event like `agents`, or the agents feed) is the FSE's call.

## Acceptance

| # | The lead can | Checked by |
|---|---|---|
| L1 | see that a crew start is moving | after Bring crew up on a fixture cell of 3+ seats, the crew block lists every seat with its state; the starting seat's seconds grow; nothing animates |
| L2 | hear each result once | the live region announces each seat's result and the total, and nothing per second |
| L3 | keep his place | focus lands on `Starting crew · …` after the press; on Run card and New agent it stays on the button, then moves to the new row, or to `Try again` on failure |
| L4 | stop a long start | Stop starting skips the waiting seats (they read `off`) and lets the seat in flight finish |
| L5 | act on a failed seat | after two failures the seat reads `didn't start` with the reason in words, `Try again` and `Copy the command`; the full output is in the hover and the log, not on screen |
| L6 | learn of a failure he walked away from | leaving Agents during a start whose seat fails leaves a Needs me row `Crew of <id>: 1 seat didn't start` with Agents; it goes once the list is seen or retried |
| L7 | come back to the progress | leaving and returning to Agents during a start shows the current list, not the button |

A failure can be forced on the fixture with a probe stub that exits 3.

## Out of scope

- Showing each seat's pane output live.
- Launching seats in parallel, which is the FSE's and Hephaistos' call; the
  list works either way.

## Amendment 1 (aglaea, 2026-10-14): from leftovers-27's UI reviews

From sup64's close (`runs/2026-10-14-sup64-leftovers-27.md`,
`working-on/done/lf27-*.md`), for leftovers-29 or later.

### 1. The heading says the result once nothing is starting (U3)

While any seat is `waiting`, `starting` or `trying again`, the heading reads
`Starting crew · n of m running`. Once none is, it reads the result:

- `Crew up · 3 of 3 running`, which closes after 5 s as before;
- `Crew up · 2 of 3 running, 1 didn't start`;
- `Stopped · 2 of 3 running, 1 not started` after Stop starting.

The live region says the same words once.

### 2. The list holds only the seats this press starts (U4)

`Bring 1 up` starts one seat, so the list shows that seat alone. The
heading counts it alone: `Starting 1 seat · 0 of 1 running`, then `Seat up
· 1 of 1 running`. Seats already running are not listed, since their rows
are on the crew block as usual. `m` is always the number this press
starts.

### 3. Close the list (spec gap)

A settled list with a failure stays until the lead acts. **Close the list**
is a quiet button on that heading line. It changes the view only:

- the list goes;
- the crew block shows its rows, with the failed seats `off`, and `Bring n
  up` comes back;
- the unseen-failure Needs me row goes (it counts as seen).

Nothing is killed or retried.

### 4. The unseen-failure row is dated (spec gap)

The Needs me row `Crew of <id>: n seat(s) didn't start` is dated with the
time the last seat failed. It sorts with the dated rows, oldest first, and
never as an undated row behind `Show the other N`. The badge counts it
either way.

## Amendment 1 to tab-reaches-links A3 §2, recorded here for the same batch

**The deaf and capped badges draw their waiting count** (`deaf · 3
waiting`, `capped · 1 waiting`). For these two the count is the evidence
for the word. The description then says it, as FR-9 asks: a fact said is
a fact drawn. `stale` draws its count as it already does.

### 5. The ring floor (polish U2): 2 px, as built

The floor is **2 px of air** between the ring's inner edge and the text.
The region pads 4 px, of which the ring takes 2. What was built is right.
The design system already says so.

| # | The lead can | Checked by |
|---|---|---|
| L8 | read the outcome, not "starting", once it is over | with no seat waiting, starting or trying again, the heading reads `Crew up · …` or `Stopped · …` as in §1 |
| L9 | see only what this press starts | `Bring 1 up` lists one seat and counts `of 1` |
| L10 | close a failed list | `Close the list` hides it; the failed seats read `off`; `Bring n up` is back; the Needs me row is gone; nothing is killed |
| L11 | find a fresh failure in Needs me | the unseen-failure row carries the failure's time and sorts among the dated rows |
| L12 | see the deaf and capped evidence | their badges draw `· n waiting`, and the description says it |

## Amendment 2 (aglaea, 2026-10-14): from leftovers-29's UI reviews

From sup66's close (`runs/2026-10-14-sup66-leftovers-29.md`,
`working-on/done/lf29-*.md`).

- **Nothing running**: `Seat not up · 0 of 1 running` and `Crew not up · 0
  of 3 running`, as built. Confirmed.
- **`Seat up` closes after 5 s**, like `Crew up`. The rule is the same: a
  settled list in which every seat runs closes after 5 s.
- **Failures are never hidden by time.** A list with any `didn't start`
  stays until `Close the list`, `Try again` or Stop. Confirmed.
- **The landed row stays in view** (task-rows §4, for the supervisor row,
  and every `openAgentsAt` landing).
  - On landing, the row is centred (`block: "center"`).
  - The 10 s feed then reflows the list, so while the row keeps focus and
    the lead has not scrolled, each feed update brings it back into view
    with `block: "nearest"`.
  - Once the lead scrolls or focus leaves the row, this stops.
  - Safari 15 has no `overflow-anchor`, so this is done in the view.
- **Amber is shared on purpose.** `stalled` and the unreadable-files row
  both mean "look at this, nothing has stopped". Their words tell them
  apart, and the colour only ranks them. No change.

| # | The lead can | Checked by |
|---|---|---|
| L13 | keep the landed row in sight | after an `openAgentsAt` landing, the row is centred, and after two feed updates (20 s) it is still whole in view; after the lead scrolls, it is not pulled back |
| L14 | trust the timing | `Seat up` and `Crew up` close after 5 s; any list with `didn't start` stays |
