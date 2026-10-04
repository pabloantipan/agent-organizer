import { useSyncExternalStore } from "react";

/** What was typed in a box, kept per key until it is posted or cancelled
 *  (responsive-home FR-9; leftovers-9 FR-1; design system, Focus and names:
 *  "Escape closes, it does not discard"). One store for the session, in
 *  memory only: never written to disk, browser storage or the synced
 *  order, so a restart forgets every draft.
 *
 *  Keys name what the words are about: a record (a ruling,
 *  `decision:<initiative>/<NNNN>`; a card comment, `card:<initiative>/<slug>`)
 *  or a thread (a message in the composer, `thread:<initiative>/<id>`; a
 *  new thread's subject and body together, `thread:<initiative>/new`, a
 *  branch's `thread:<initiative>/branch:<message id>`). A draft is its
 *  fields as strings; one whose fields are all blank is no draft, so
 *  keeping it discards the key. */
export type DraftFields = Record<string, string>;
/** A ruling's draft: the chosen option and the words. */
export type Draft = { chosen: string; words: string };

export const decisionKey = (initiative: string, number: string) => `decision:${initiative}/${number}`;
export const cardKey = (initiative: string, slug: string) => `card:${initiative}/${slug}`;
export const threadKey = (initiative: string, thread: string) => `thread:${initiative}/${thread}`;
export const newThreadKey = (initiative: string) => threadKey(initiative, "new");
export const branchKey = (initiative: string, messageId: string) => threadKey(initiative, `branch:${messageId}`);

const blank = (f: DraftFields) => Object.values(f).every((v) => v.trim() === "");

export type DraftStore = {
  /** Keep `fields` under `key`, replacing what was there; all blank discards. */
  keep: (key: string, fields: DraftFields) => void;
  /** Merge `patch` into the draft under `key`. */
  edit: (key: string, patch: DraftFields) => void;
  /** The draft under `key`, or undefined. The same object until it changes. */
  restore: <T extends DraftFields = DraftFields>(key: string) => T | undefined;
  /** Forget the draft under `key` (Cancel, or the words posted). */
  discard: (key: string) => void;
  has: (key: string) => boolean;
  subscribe: (fn: () => void) => () => void;
  /** Moves on every change, for a view that reads several keys. */
  version: () => number;
};

export function draftStore(): DraftStore {
  const kept = new Map<string, DraftFields>();
  const subs = new Set<() => void>();
  let v = 0;
  const changed = () => { v++; subs.forEach((fn) => fn()); };
  const store: DraftStore = {
    keep: (key, fields) => {
      if (blank(fields)) { if (kept.delete(key)) changed(); return; }
      kept.set(key, { ...fields });
      changed();
    },
    edit: (key, patch) => store.keep(key, { ...kept.get(key), ...patch }),
    restore: <T extends DraftFields>(key: string) => kept.get(key) as T | undefined,
    discard: (key) => { if (kept.delete(key)) changed(); },
    has: (key) => kept.has(key),
    subscribe: (fn) => { subs.add(fn); return () => { subs.delete(fn); }; },
    version: () => v,
  };
  return store;
}

/** The session's drafts. */
export const drafts = draftStore();

/** The draft under `key` (undefined with none, or with no key), re-rendering
 *  when it changes. */
export function useDraft<T extends DraftFields = DraftFields>(key: string | null, store: DraftStore = drafts): T | undefined {
  return useSyncExternalStore(store.subscribe, () => (key ? store.restore<T>(key) : undefined));
}

/** Re-render on any draft change, for a list whose rows each read one. */
export function useDrafts(store: DraftStore = drafts): DraftStore {
  useSyncExternalStore(store.subscribe, store.version);
  return store;
}

/** A verb with a kept draft says so: `Rule · draft` (leftovers-9 FR-1). */
export const draftVerb = (verb: string, kept: boolean) => (kept ? `${verb} · draft` : verb);
