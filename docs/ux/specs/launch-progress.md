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

## Amendment 3 (aglaea, 2026-10-14): from lf30-launch-view's UI review

From the lvw-ui review (`working-on/lf30-launch-view.md`, ## UI review, pass
at 7c35c18).

- **A kept landing keeps a margin.** Flush is not acceptable: the ring is
  part of the row, and a clipped ring reads as a row cut off. The landed row
  carries `scroll-margin-block: var(--space-2)` (8 px), so both the centring
  and every `nearest` pull leave the whole ring, plus air, inside the
  scroller. This follows the design-system floor (the ring clears its
  neighbour by at least 2 px; the scroller's edge is a neighbour).
- **Focus after a list closes by itself goes to the button that started
  it.** When `Seat up` or `Crew up` closes after 5 s, focus moves from the
  heading (which is leaving) to the crew block's launch button, which by
  then reads `Reattach all`. That is the same target as `Close the list`,
  and the press that opened the list. Confirmed as built.
  - Only when focus was inside the list. If the lead had moved elsewhere,
    the close takes nothing from them.
  - Never the body: a vanished focus drops Tab to the top of the page.

| # | The lead can | Checked by |
|---|---|---|
| L15 | see the whole landed row | after an `openAgentsAt` landing and two feed updates, the row's focus ring is whole, with at least 2 px between it and the scroller's edge |
| L16 | keep their place when a list closes | with focus in the list, `Seat up` closes and focus is on `Reattach all`; with focus elsewhere, it stays there |

## Amendment 4 (aglaea, 2026-10-14): every seat already runs

From sup67's close. Since lf30-launch-go (53db688), Bring crew up skips the
seats that already run, so with every seat up a press queues nothing and
shows nothing. The fault is the button, not the silence: `Reattach all`
promises a thing the app does not do (it opens no window; Attach is per
seat), and a press that cannot act should not be offered (design system:
never-acting items are left out).

- **With no seat off, there is no launch button.** The crew block's meta
  already says `3 seats · 3 live · 0 off`; that is the answer, said once.
  `Reattach all` is retired as a label. Retire… stays.
- **The race.** If the confirm is open when the last off seat comes up
  (another press, the CLI), `Start` finds nothing to queue: the confirm
  closes, the live region says `Every seat is already running`, and focus
  goes to the first seat row's `Attach`. No list, no heading.
- **This changes L16's target.** When `Seat up` or `Crew up` closes by
  itself, every listed seat runs and the button is gone. Focus, if it was
  in the list, goes to the `Attach` of the first seat the list showed, in
  the rows that take the list's place. A list that closes with a seat
  still off (Close the list after a failure) keeps its target: `Bring n
  up`.

| # | The lead can | Checked by |
|---|---|---|
| L17 | not press a button that does nothing | with every seat live, the crew block has no Bring up / Reattach button and its meta reads `n live · 0 off` |
| L18 | hear why nothing started | with the confirm open, bring the last seat up from the CLI, press Start: the live region says `Every seat is already running`, no list appears, focus is on the first `Attach` |
| L16 (amended) | keep their place when a list closes | with focus in the list, `Seat up` closes and focus is on the first listed seat's `Attach`; with focus elsewhere, it stays |

## Amendment 5 (aglaea, 2026-10-14): from lf31-crew-button's UI review

From cb-ui (`working-on/lf31-crew-button.md`, ## UI review, pass at
e3c470c).

- **U1: the press's answer is the newest truth; show it at once.** When
  Start finds every seat running, the block must not keep saying `1 off`
  and `Bring 1 up` beside `Every seat is already running`: that is one
  fact said two ways on one screen. The press's result is applied to the
  block at once, with no new service call: the seats it reports running
  read live, the meta reads `0 off`, and the launch button goes (A4). The
  next feed then agrees. If the result names no seats (it only says
  nothing was queued), treat every seat the view shows as off as live
  until the feed says otherwise.
- **U2: a repeated message is said again.** The live region is emptied,
  then set on the next frame, so a second identical race is announced.
  This holds for every live region in the app (design system).
- **U3: a confirm whose press can no longer act closes.** When the feed
  turns `0 off` with the confirm open, the confirm closes; its words are
  not rewritten. Same rule as the button (A4): an action that cannot act is
  not offered. If focus was in the confirm, it goes where A4's race sends
  it.
- **Gap: the focus chain when a list or a confirm leaves.** Only if focus
  was inside it, in order:
  1. the `Attach` of the first listed seat that has one;
  2. else `Bring n up` (a listed seat with no Attach is off, so it exists
     unless it is blocked);
  3. else `Retire…`, which every crew block has.
  Never the body.

| # | The lead can | Checked by |
|---|---|---|
| L19 | trust one answer | with a stale feed showing `1 off`, press Start on a seat already running: at once the meta reads `0 off`, there is no launch button, and the live region says `Every seat is already running`; the next feed changes nothing |
| L20 | hear it twice | repeat the L19 race: the live region says it again |
| L21 | not see a dead confirm | open the confirm, bring the last seat up from the CLI, wait for the feed: the confirm closes, and focus, if it was there, is on the first `Attach` |
| L22 | never lose focus | let a list close after its first seat went off: focus is on the next listed `Attach`, else `Bring n up`, else `Retire…` |

## Amendment 6 (aglaea, 2026-10-14): from lf32-newest-answer's UI review

From nw-ui (`working-on/lf32-newest-answer.md`, ## UI review, pass at
1cb7c38).

- **U1: an assumed-live row says what the press said.** `idle` is wrong:
  the press reported the seat running, and A5 makes that answer the
  newest truth. The row reads `running`, as a feed-running row does.
  - The press's result carries each running seat's session name (the
    service already names it with `crewSession`; no new call). With it,
    the row draws `Attach` at once, and the focus chain counts it.
  - If the result cannot carry it, the row still reads `running`, keeps
    `—` where Attach sits, and the chain skips it until the feed. Not
    `starting…`: nothing is starting.
- **U2: a confirm closed by the feed says why.** The live region says
  `Every seat is already running`, the same words as the race, before
  focus lands on `Attach`. One reason, one sentence, wherever the confirm
  goes away because nothing is off.
- **A1: the gap is 100 ms.** Empty, then set again 100 ms later in a later
  task (`setTimeout`, not `requestAnimationFrame`, which does not run in a
  hidden window). 2 ms is not known to re-announce in VoiceOver; 100 ms is
  the common floor. Checking it under VoiceOver is a finding for whoever
  has a screen, not a gate row.
- **The chain with no list.** In the race and the dead-confirm case,
  "listed seats" means every seat row, in drawn order. Confirmed as
  built.

| # | The lead can | Checked by |
|---|---|---|
| L23 | attach to a seat the press found running | after the L19 race, the seat's row reads `running` and draws `Attach` before the next feed |
| L24 | hear why the confirm went away | after L21, the live region says `Every seat is already running` |
| L25 | hear a repeat | the live region is empty for 100 ms between two identical messages |

## Amendment 7 (aglaea, 2026-10-15): from lf33-press-running's UI review

From pr-ui (`working-on/lf33-press-running.md`, ## UI review, pass at
c0130f2).

- **U1: the assumed-live row reads `idle`.** A6 was wrong about the feed:
  a running row that is not working reads `idle` (`stateWord`). The press
  knows a seat runs, not whether it works, so the assumed row takes the
  same word as its alive peers, and the next feed changes nothing unless
  the seat is working. A6's `running` is replaced by the word a
  feed-running, not-working row draws. No rename.
- **U2: a busy Start keeps focus.** While CreateCrew runs, Start takes
  `aria-disabled="true"`, keeps its gerund label (`Starting…`), ignores
  presses, and holds focus until the list's heading (§1) or the race's
  `Attach` takes it. Not `disabled`. This is now the design system's busy
  rule for every pressed control.
- **U3: one order for the race and the feed-closed confirm: focus first,
  then the words.** Focus never waits (it would sit on nothing, U2's
  fault), and a polite message queues behind the focus announcement
  instead of being cut off by it. L24 is amended to this order; the race
  follows it as built.
- **Heard in that order?** Whether VoiceOver speaks focus, then the polite
  words, is a finding for whoever has a screen, as in A6; not a gate row.

| # | The lead can | Checked by |
|---|---|---|
| L26 | read one word for alive seats | after the L19 race, the assumed seat and its not-working peers all read `idle`; the next feed changes no word |
| L27 | keep focus through a press | press Start: until the list or the race moves it, `document.activeElement` is Start (`aria-disabled="true"`, `Starting…`), never the body |
| L24 (amended) | hear why the confirm went away | after L21 and after the race, focus is on `Attach` first and the live region then says `Every seat is already running` |

## Amendment 8 (aglaea, 2026-10-15): the busy ring (lf34-busy-focus U4)

From bf-ui at 87abf10. A7 made a busy control hold focus, and the disabled
look (opacity .45 on the element) dims its ring to about 1.6:1. A ring
under 3:1 is no ring (WCAG 1.4.11), so:

- **Busy dims what is inside, not the ring.** The label, the icon and the
  fill take the 45% as before; the focus ring is drawn at full strength,
  3:1 or more against the panel it sits on. How is the build's choice (dim
  the children and the fill instead of the element, or draw the ring
  outside the dimmed box); the outcome is the rule.
- Every control under the busy rule (A7's seven), not only Start.

| # | The lead can | Checked by |
|---|---|---|
| L28 | see where focus is while a press runs | press Start: the busy Start's ring measures 3:1 or more against the crew panel, while its label still reads dimmed `Starting…` |
