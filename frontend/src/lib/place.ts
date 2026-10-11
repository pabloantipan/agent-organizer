import type { Screen } from "../stores/board.store";

/** The places of the top bar's nav (initiatives-view Amendment 2, I19). */
export type Place = "home" | "initiatives" | "usage";

/** The place a screen belongs to (initiatives-view Amendment 3, I22): an
 *  initiative, whichever door opened it (rail, Home row, card), belongs to
 *  Initiatives, the place that lists them all. Settings and Help belong to
 *  no place: their own icon is the screen's mark. Help lies over any
 *  screen, so it is asked apart. */
export function placeOf(screen: Screen, help = false): Place | null {
  if (help) return null;
  switch (screen) {
    case "home": return "home";
    case "initiatives": case "initiative": return "initiatives";
    case "usage": return "usage";
    case "settings": return null;
  }
}

/** How a place tab is marked on a screen: `current` is the one "you are
 *  here" (`aria-current="page"`, the accent underline); `parent` is the
 *  place an initiative belongs to while the initiative's title is current
 *  (the underline in --fg-subtle, no `aria-current`). */
export type Mark = "current" | "parent" | null;

export function markOf(tab: Place, screen: Screen, help = false): Mark {
  if (placeOf(screen, help) !== tab) return null;
  return screen === "initiative" ? "parent" : "current";
}

/** Past a day since the last pull the sync is stale (Amendment 3 §2). An
 *  unknown pull is not called stale: the hover says "never". */
export const STALE_MS = 24 * 60 * 60 * 1000;

export function syncStale(pulledAt: unknown, now: number = Date.now()): boolean {
  if (!pulledAt) return false;
  const t = typeof pulledAt === "string" ? Date.parse(pulledAt) : (pulledAt as Date).getTime?.();
  if (!t || Number.isNaN(t) || t <= 0) return false;
  return now - t > STALE_MS;
}
