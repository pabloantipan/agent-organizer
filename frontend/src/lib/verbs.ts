/** Needs me's verbs, one per row (CLAUDE.md, Navigation; leftovers-41
 *  FR-6, lf40 UF1): every row of Home's Needs me and of Waiting on others
 *  reads its verb from here, and verbs.test.ts names each row kind's. */
export const VERBS = {
  rule: "Rule",
  /** Rule while words are kept for the record (leftovers-9 FR-1). */
  ruleDraft: "Rule · draft",
  answer: "Answer",
  open: "Open",
  agents: "Agents",
  launch: "Launch",
  show: "Show",
} as const;

export type Verb = (typeof VERBS)[keyof typeof VERBS];

/** The list, in the order above. */
export const VERB_LIST: readonly Verb[] = Object.values(VERBS);

/** A record's Rule, `Rule · draft` while words are kept for it. */
export const ruleVerb = (kept: boolean): Verb => (kept ? VERBS.ruleDraft : VERBS.rule);
