/** The one table of mailbox health words (FR-4). Every place that shows a
 *  health word reads its label, why and what to do from here; none keeps its
 *  own string. `blocker` is the short reason a card shows after the seat's
 *  name, and `threadState` in internal/service/crew.go writes the same text
 *  (change both together).
 *
 *  Capped (FR-5): since agent-slack 8991640 the drain ceiling counts per stop
 *  cycle, and a drain on the seat's next prompt delivers everything waiting.
 *  The session stays as it is. */

export type HealthState = "alive" | "never" | "stale" | "deaf" | "capped" | "no identity";

export interface HealthWords {
  label: string;
  why: string;
  what: string;
  blocker: string;
}

export const HEALTH: Record<HealthState, HealthWords> = {
  alive: {
    label: "alive",
    why: "Its wake watcher polled recently, so new mail wakes it.",
    what: "Nothing to do.",
    blocker: "",
  },
  never: {
    label: "never",
    why: "Its wake watcher has never polled: no session has ever read this seat's mail.",
    what: "Start the seat: Bring crew up on the Agents tab, or launch its session with its prelude.",
    blocker: "never started",
  },
  stale: {
    label: "stale",
    why: "Its wake watcher stopped polling, so mail arriving now wakes nobody.",
    what: "If its session is mid-turn, the mail arrives when the turn ends; if its pane is gone, start the seat again.",
    blocker: "watcher stale",
  },
  deaf: {
    label: "deaf",
    why: "Mail has waited past the stale window and no drain has picked it up.",
    what: "Check the seat's session runs: if it does, type anything into its pane; if not, start the seat again.",
    blocker: "not picking up",
  },
  capped: {
    label: "capped",
    why: "Alive and posting, but its session reached the mailbox's drain ceiling for this stop cycle, so waiting mail is held.",
    what: "Wait for its next prompt, which delivers the mail: the watcher's wake, or anything typed into its pane.",
    blocker: "capped, mail waits for its next prompt",
  },
  "no identity": {
    label: "no identity",
    why: "A session runs under this seat's name without its mailbox identity, so its mail is never read.",
    what: "Relaunch it with an identity prelude (the fse skill's references/standing-up.md).",
    blocker: "no identity",
  },
};

/** The state one seat's discuss health is in: capped outranks deaf (capped is
 *  deaf for a known cause), deaf outranks the watcher. Undefined when discuss
 *  gave no watcher. */
export function healthState(h: { watcher?: string; deaf?: boolean; capped?: boolean; noIdentity?: boolean }): HealthState | undefined {
  if (h.noIdentity) return "no identity";
  if (h.capped) return "capped";
  if (h.deaf) return "deaf";
  if (h.watcher === "alive" || h.watcher === "stale" || h.watcher === "never") return h.watcher;
  return undefined;
}

/** "3 messages" / "1 message". */
export const messages = (n: number) => `${n} message${n === 1 ? "" : "s"}`;

/** The tooltip of a health word: why, what to do, and the mail waiting. */
export function healthTitle(s: HealthState, undelivered = 0): string {
  const w = HEALTH[s];
  return `${w.why}${undelivered > 0 ? ` ${messages(undelivered)} waiting.` : ""} ${w.what}`;
}

/** The People toggle's accessible name (initiative-header FR-7, UI7): what
 *  it is, then the counts its face shows, in the same words. */
export function peopleLabel(c: { seats: number; live: number; capped: number; deaf: number }): string {
  const parts = [`${c.seats} seat${c.seats === 1 ? "" : "s"}`];
  if (c.live > 0) parts.push(`${c.live} live`);
  if (c.capped > 0) parts.push(`${c.capped} ${HEALTH.capped.label}`);
  if (c.deaf > 0) parts.push(`${c.deaf} ${HEALTH.deaf.label}`);
  return `People, ${parts.join(", ")}`;
}
