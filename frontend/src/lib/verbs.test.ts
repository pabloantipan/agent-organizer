import { describe, expect, it } from "vitest";
import { ruleVerb, VERB_LIST, VERBS } from "./verbs";

// leftovers-41 FR-6 (lf40 UF1): Needs me's verbs are one list. Which row
// kind reads which is Home.waits.test.tsx's W6, rendered.

describe("W6 (FR-6): the one list of Needs me's verbs", () => {
  it("is exactly Rule, Rule · draft, Answer, Open, Agents, Launch, Show", () => {
    expect(VERB_LIST).toEqual(["Rule", "Rule · draft", "Answer", "Open", "Agents", "Launch", "Show"]);
  });
  it("names each verb once", () => {
    expect(new Set(VERB_LIST).size).toBe(VERB_LIST.length);
  });
  it("Rule reads Rule · draft while words are kept", () => {
    expect(ruleVerb(false)).toBe(VERBS.rule);
    expect(ruleVerb(true)).toBe(VERBS.ruleDraft);
  });
});
