import type { Hush } from "./liveRegion";

/** What closing the rail's rename field touches: the announcer's `hush`, the
 *  refusal line, and which group is edited. */
export type RenameCloser = {
  hush: Hush;
  setRefused: (r: null) => void;
  setEditing: (i: null) => void;
};

/** Closes the rename field as Escape does: the announcer emptied now and a
 *  sentence still 100 ms from being set dropped, the line emptied, the field
 *  closed. Nothing is saved: the group keeps its old name (leftovers-80
 *  FR-1; leftovers-81 FR-1). */
export function closeRename(c: RenameCloser): void {
  c.hush();
  c.setRefused(null);
  c.setEditing(null);
}

/** The rail's toggle collapsing it (leftovers-81 FR-1; run-report A15,
 *  AR51): an open rename closes first as Escape does, typed text dropped
 *  whether refused or not, then the rail collapses and focus goes to the
 *  toggle that collapsed it. With no rename open it only collapses. */
export function collapseRail(c: RenameCloser & { editing: number | null; collapse: () => void; focusToggle: () => void }): void {
  const open = c.editing !== null;
  if (open) closeRename(c);
  c.collapse();
  if (open) c.focusToggle();
}
