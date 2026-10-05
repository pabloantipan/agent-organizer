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
 *  new thread's subject, body and addressee together, per chat,
 *  `thread:<initiative>/new:<chat>`; a branch's
 *  `thread:<initiative>/branch:<message id>`). A draft is its fields as
 *  strings; one whose words are all blank is no draft, so keeping it
 *  discards the key. The addressee and the kind (`to`, `kind`) are not
 *  words: they ride a draft, they never make one. */
export type DraftFields = Record<string, string>;
/** A ruling's draft: the chosen option and the words. */
export type Draft = { chosen: string; words: string };

export const decisionKey = (initiative: string, number: string) => `decision:${initiative}/${number}`;
export const cardKey = (initiative: string, slug: string) => `card:${initiative}/${slug}`;
export const threadKey = (initiative: string, thread: string) => `thread:${initiative}/${thread}`;
/** A chat of Conversations: a seat's direct chat (`seat:<name>`), or the
 *  channel, needs me, the reconciler's, the journal, the archive. */
export const chatKey = (focus: string | null, view: string) => (focus ? `seat:${focus}` : view);
/** A new thread's draft belongs to the chat it was typed in (leftovers-10
 *  FR-1; design system, Focus and names: "a draft keeps its addressee"), so
 *  another chat's form never shows it and its Start never sends it. */
export const newThreadKey = (initiative: string, chat: string) => threadKey(initiative, `new:${chat}`);
export const branchKey = (initiative: string, messageId: string) => threadKey(initiative, `branch:${messageId}`);

const NOT_WORDS = new Set(["to", "kind"]);
const blank = (f: DraftFields) => Object.entries(f).every(([k, v]) => NOT_WORDS.has(k) || v.trim() === "");

/** A new thread as its chat's draft holds it. */
export type NewThreadDraft = { subject: string; body: string; to: string };

/** What a chat's Start posts: that chat's own draft with its own addressee,
 *  or nothing when the chat has none. A draft typed in another chat is
 *  never read here (leftovers-10 FR-1, T1). */
export function newThreadPost(store: DraftStore, initiative: string, chat: string): NewThreadDraft | null {
  const d = store.restore<Partial<NewThreadDraft>>(newThreadKey(initiative, chat));
  if (!d || !(d.subject ?? "").trim() || !(d.body ?? "").trim()) return null;
  return { subject: d.subject!, body: d.body!, to: d.to ?? "" };
}

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
