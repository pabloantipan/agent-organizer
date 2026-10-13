---
title: "Every click target is a link or a button"
status: done
repos: [organizer]
branch: lf24-controls
seat: ct-build
stage: one-window
updated: 2026-10-13
next: "review: lf24-controls, gate met (E1, X0; F2 by vitest only, unreachable in the app), 37b056f"
depends_on: []
boundary: ["docs/specs/leftovers-24.md Boundary, lf24-controls"]
spec: "docs/specs/leftovers-24.md (FR-1 to FR-5; tab-reaches-links Amendment 1, T6)"
gate: "docs/specs/leftovers-24.md Acceptance, rows E1 and X0"
ui_review: true
review: pass
---

## Goal
F1-F5 become buttons or a link, reachable by Tab (Aglaea, b131393, from sup59's close).

## Gate
docs/specs/leftovers-24.md, rows E1 and X0.

- [x] E1: no span/li/div with onClick in the three files, roles and names as FR-1 to FR-5, Return acts, F4 and F5 focus lands on the divider. Evidence: `frontend/src/components/Controls.test.tsx`, `.wt-notes/ct-build/e1.txt`, `e1-on.jsonl` and `e1-summary.txt`. F2 is vitest only: `f2.jsonl` shows its list never mounts.
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `pnpm run build`, `wails build` pass; `git status --porcelain` empty (clean clone of f801a1b; rebased to 37b056f over card-only commits, same code tree). Evidence: `.wt-notes/ct-build/x0-make-test.log`, `x0-pnpm-build.log`, `x0-wails-build.log`, `x0-status.txt`.

## Done
- F1, F3, F4 and F5 are buttons and F2 is a link, each keeping its row look. The thread divider replies through a `Reply into <subject>` button; a search hit and a ruling land focus on the divider (db349dd, 84aebab, 0081190, 37b056f; ct-build, 2026-10-13).

## Notes
- Boundary extended by sup60 (spec Amendment 1, fc41775): E1's grep also hit `div.tl-divider` and `span.a-actions`. The divider gets a `Reply into <subject>` button whose `::after` still takes a click anywhere on the divider, the divider stays the F4/F5 focus target, and `.tl-*` rules in `global.css` are this card's.
- F2's cell list (SlackView with no initiative) cannot be reached since the redesign: `InitiativeScreen` mounts SlackView only with a selected initiative. Its `aria-current` therefore never applies; it is proven by vitest only.
- After Return on F1 or F3, focus falls to `body`, as a click does. Not asked by the spec.
- Choices and how to reproduce: `.wt-notes/ct-build/progress.md`.

## UI review

ct-ui, 2026-10-13, branch `lf24-controls` at 37b056f (detached worktree `.wt/ct-ui`). **Verdict: pass.** Nothing of severity 4 or 3 against FR-1 to FR-5 or Amendment 1's divider.

How each state was checked:
- E1 grep: the card's vitest line grep, plus my own multi-line JSX scan of the three files. No `span`, `li` or `div` has `onClick`; the one hit is `span.confirm-inline`'s Escape `onKeyDown` (AgentsView.tsx:255), not a click target.
- F1, F3, F4, F5 and the divider reply: my own steps (`.wt-notes/ct-ui/e1-ui.txt`, output `e1-ui-on.jsonl`) in a copy of `scripts/tab-harness` with two extra verbs, `shot` (WKWebView snapshot of its own window) and `tabto` (Tab until a predicate holds). Run against my own `wails dev` on 34119, fixture, auth off, `--links on`, 1440×900. Each control takes focus by Tab with a visible 2 px accent ring (`:focus-visible` true). Return does what a click does. F4 and F5 land focus on the thread's divider (`Thread <subject>, open`). A divider's `Reply into <subject>` retargets the composer.
- Look kept: computed styles of each button against its old row rules (font, weight, colour, background, border, padding, radius), plus harness shots `wk-1440x900-E1-{f1,f3,f4,f5}-focus.png`, `-f3-current.png`, `-f4-landed.png`, `-f5-landed.png`, `-divider-tab2.png`. The current person's `--accent-soft` read transparent in the offscreen harness only: the button's background transition never ticks offscreen (`getAnimations()` running at time 0), and with `transition: none` it reads `rgba(138, 63, 252, .18)`. In the review build's own window (`screencapture -o -l`, `wkapp-1440x900-E1-f3-current.png`) the current person, fse, shows its highlight.
- AX names in the review build: In the review build's own window (`screencapture -o -l`, `wkapp-1440x900-E1-f3-current.png`) the current person, fse, shows its highlight.
- vitest `Controls.test.tsx`: not rerun by me. `test-lease` held it for 30 min under memory pressure "warn" and gave up (rc 75). I rest on the builder's `x0-make-test.log` (45 files, 563 tests pass) and on reading the test file.

Findings (none fails; the ruled names are per spec):

- **U1 (3, not in FR-1 to FR-5; pre-existing).** What the person cannot do: see where focus is on a thread divider's Escalate, Close and Reopen buttons. Where: Conversations, any divider; `wk-1440x900-E1-divider-tab2.png` (focus on Escalate, nothing drawn). Evidence: Tab from a landed divider reaches `Reply into …`, then `Escalate …` and `Close …` with `.a-actions` at computed `opacity: 0` (`e1-ui-on.jsonl` div-2, div-3). The rules `.tl-divider .a-actions { opacity: 0 }` / `:hover { opacity: 1 }` are the same on main, so this predates the card. Since Amendment 1 this card owns `.tl-*` and every divider is now on the keyboard path to F4/F5, though. WCAG 2.4.7. Proposal: `.tl-divider:focus-within .a-actions { opacity: 1 }`, a one-line leftover.
- **U2 (2).** What the person cannot do: keep their place after choosing a chat with Return. Where: People panel, `Chat with <seat>`. Evidence: the button stays the same connected node with `aria-current="true"`, yet focus falls to `body`. The next Tab lands on the composer's `new thread instead`, so the keyboard user is thrown from the People panel to the composer (`next-tab.txt`). Proposal: keep focus on the pressed button (a button that changes what is shown in place keeps focus). Find what blurs it in Conversation's chat switch.
- **U3 (2).** What the person cannot do: continue from the filter they just applied. Where: Agents, `Show only <id>`. Evidence: Return selects the initiative, every group title unmounts, and focus is lost (body, or in one run a span mid-page). Proposal: focus the control that undoes the filter, or the view's heading. The design memory's rule: a control that hides itself must say where focus goes.
- **U4 (1).** A search hit's accessible name is its whole content: subject, kind, from → to, and up to 160 characters of snippet. Amendment 1 says "named by the hit's subject". Proposal: `aria-label` = subject, with the rest as `aria-describedby`.

Spec gaps (for the FSE):
- G1: FR-2 / F2 designs an element the app cannot show. `SlackView` mounts only inside `InitiativeScreen` with an initiative selected (App.tsx:115), so the cell list and its `aria-current` never render; proven by vitest only. Either drop the list or name where it lives.
- G2: no FR says where focus goes after F1 (its button unmounts) or F3 (U2, U3).
- G3: Amendment 1's divider reply puts each divider's hover-only actions on the Tab path (U1); no row checks their focus visibility.

For aglaea (design questions, not defects):
- A1: `aria-label` on F1, F3 and F5 replaces the row's content for a screen reader. F1 drops the counts, memory and cell state; F3 drops live/off, deaf and context; F5 drops the ruling itself (who ruled, when, the words, next). The visible row says far more than the name. Should the content become `aria-describedby`, or the label a prefix ("Show only init-a: 25 agents …")?
- A2: F1's `aria-pressed` is constant `false`, since the titles show only while no filter is on. A toggle that can never be pressed: is it a toggle, or a plain button?

Not verified in WKWebView:
- F2 in the app (unreachable, G1); vitest only.
- Hover looks of the new buttons (no pointer hovers allowed); from the CSS, `button:hover` is overridden by each row's own `:hover`.
- Widths other than 1440×900.

## Review

**Verdict: pass.** ct-review, 2026-10-13, branch `lf24-controls` at 37b056f, fresh clone under `.wt-notes/ct-review/clean` (removed after). Evidence in `.wt-notes/ct-review/`.

- E1, met. Grep: no `span`, `li` or `div` with its own `onClick` in `AgentsView.tsx`, `SlackView.tsx`, `Conversation.tsx` (line grep plus a multi-line JSX scan; the same checks on main find the old sites). Roles and names: `Controls.test.tsx` passed inside make test (45 files, 563 tests). Harness: the builder's `e1.txt` rerun on my own `wails dev` (34118, fixture, auth off, `--links on`), `e1-on.jsonl`. `Show only init-a` takes Tab, Return selects init-a. `Chat with fse` takes Tab, Return sets the chat and `aria-current`. The search hit and `Open the thread w-queued…` take Tab, and Return focuses `Thread w-queued…, open` (the divider). `Reply into …` takes Tab and retargets. F2, which the app never mounts: `f2.txt` mounts `SlackView` by hand in the same page (initiative null). Tab reaches `Conversations of init-a`, `init-define`, `init-drafted` (links, `href="#<id>"`), and Return selects init-drafted (`f2.jsonl`).
- X0, met. In the clean clone: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0, `pnpm run build` rc 0, `wails build` rc 0, then `git status --porcelain` empty (`x0-make-test.log`, `x0-pnpm-build.log`, `x0-wails-build.log`, `x0-status.txt`).

Unmet rows: none.

