/** One draft per record until Rule or Cancel (responsive-home FR-9). The open
 *  box is `open`; every record's words are kept in `drafts` by row key, so
 *  closing a box, opening another row's Rule or leaving Home keeps them and
 *  reopening restores them. Only drop discards one. */
export type Draft = { chosen: string; words: string };
export type Drafts = { open: (Draft & { key: string }) | null; drafts: Record<string, Draft> };

const EMPTY: Draft = { chosen: "", words: "" };

/** Open the box of `key` with its kept draft, or close the open one. */
export const openDraft = (st: Drafts, key: string | null): Drafts =>
  ({ ...st, open: key ? { key, ...(st.drafts[key] ?? EMPTY) } : null });

/** Change what the open box holds, keeping it by its key. */
export const editDraft = (st: Drafts, patch: Partial<Draft>): Drafts => {
  if (!st.open) return st;
  const { key, ...kept } = { ...st.open, ...patch };
  return { open: { key, ...kept }, drafts: { ...st.drafts, [key]: kept } };
};

/** Discard the draft of `key`, closing its box when it is the open one. */
export const dropDraft = (st: Drafts, key: string): Drafts => {
  const { [key]: _, ...drafts } = st.drafts;
  return { drafts, open: st.open?.key === key ? null : st.open };
};
