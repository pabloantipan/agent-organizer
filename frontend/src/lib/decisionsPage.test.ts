import { describe, expect, it } from "vitest";
import { countWords, decSectionsOf, decisionMatches, emptyRuledWords, lineName, rulerWords, ruledShown, shownSections, summaryOf, summaryText, timelineCount, timelineName, turnaroundWords, waitedWords } from "./decisionsPage";

const now = new Date(2026, 9, 3); // 2026-10-03, local midnight
const rec = (number: string, raised: string, ruled = "") => ({ number, raised, ruled });

describe("decisionMatches", () => {
  const d = { number: "0069", title: "Accept the leftovers batch", chosen: "accept as written", body: "## Question\n\nThe rail group and its order." };

  it("matches a number with or without its padding, and only that number", () => {
    expect(decisionMatches(d, "69")).toBe(true);
    expect(decisionMatches(d, "0069")).toBe(true);
    expect(decisionMatches(d, " 069 ")).toBe(true);
    expect(decisionMatches(d, "6")).toBe(false);
    expect(decisionMatches({ ...d, number: "0070", body: "supersedes 0069" }, "69")).toBe(false);
  });

  it("needs every word, in any order, in the title, chosen or body, any case", () => {
    expect(decisionMatches(d, "rail group")).toBe(true);
    expect(decisionMatches(d, "GROUP rail")).toBe(true);
    expect(decisionMatches(d, "leftovers written")).toBe(true);
    expect(decisionMatches(d, "rail stage")).toBe(false);
  });

  it("matches everything on an empty query", () => {
    expect(decisionMatches(d, "")).toBe(true);
    expect(decisionMatches(d, "   ")).toBe(true);
  });
});

describe("summaryOf", () => {
  const ruled = [rec("0071", "2026-10-01", "2026-10-03"), rec("0060", "2026-09-27", "2026-09-27"), rec("0050", "2026-09-20", "2026-09-26")];

  it("names how many wait, the oldest's age and number, and this week's rulings", () => {
    const s = summaryOf([rec("0007", "2026-09-28"), rec("0008", "2026-10-01"), rec("0009", "2026-10-02")], ruled, now);
    expect(summaryText(s)).toBe("3 to rule, the oldest for 5 days (0007) · 2 ruled this week");
    expect(s.number).toBe("0007");
  });

  it("says it of one record without 'the oldest'", () => {
    expect(summaryText(summaryOf([rec("0069", "2026-10-01")], ruled, now))).toBe("1 to rule, for 2 days (0069) · 2 ruled this week");
    expect(summaryText(summaryOf([rec("0069", "2026-10-02")], ruled, now))).toBe("1 to rule, for 1 day (0069) · 2 ruled this week");
  });

  it("says raised today, never 0 days", () => {
    expect(summaryText(summaryOf([rec("0072", "2026-10-03"), rec("0073", "2026-10-03")], ruled, now))).toBe("2 to rule, the oldest raised today (0072) · 2 ruled this week");
    expect(summaryText(summaryOf([rec("0072", "2026-10-03")], ruled, now))).toBe("1 to rule, raised today (0072) · 2 ruled this week");
  });

  it("says nothing waits", () => {
    const s = summaryOf([], ruled, now);
    expect(summaryText(s)).toBe("Nothing to rule · 2 ruled this week");
    expect(s.number).toBeNull();
  });

  it("leaves the week out when nothing was ruled in the last seven days", () => {
    expect(summaryText(summaryOf([], [rec("0050", "2026-09-20", "2026-09-26")], now))).toBe("Nothing to rule");
    expect(summaryText(summaryOf([rec("0007", "2026-09-28")], [], now))).toBe("1 to rule, for 5 days (0007)");
  });
});

describe("turnaroundWords", () => {
  it("says nothing of a same-day ruling", () => {
    expect(turnaroundWords("2026-10-03", "2026-10-03")).toBeNull();
  });
  it("says after N days from one day on", () => {
    expect(turnaroundWords("2026-10-02", "2026-10-03")).toBe("after 1 day");
    expect(turnaroundWords("2026-09-30", "2026-10-03")).toBe("after 3 days");
  });
  it("says nothing without both dates or backwards", () => {
    expect(turnaroundWords("2026-10-03", "")).toBeNull();
    expect(turnaroundWords("", "2026-10-03")).toBeNull();
    expect(turnaroundWords("2026-10-04", "2026-10-03")).toBeNull();
  });
  it("words a wait the same way", () => {
    expect(waitedWords(0)).toBe("today");
    expect(waitedWords(1)).toBe("1 day");
    expect(waitedWords(5)).toBe("5 days");
  });
});

describe("lineName", () => {
  const waiting = { number: "0007", title: "Stage normalize: exit met", status: "proposed", owner: "pablo", raised: "2026-09-28", ruled: "", ruled_by: "", chosen: "", superseded_by: "" };

  it("says waiting once (B14)", () => {
    const n = lineName(waiting, now);
    expect(n).toBe("0007 Stage normalize: exit met, waiting, owner pablo, 5 days");
    expect(n.match(/waiting/g)).toHaveLength(1);
  });

  it("names a ruled record's facts with its turnaround only from a day", () => {
    const r = { ...waiting, status: "ruled", ruled: "2026-10-01", ruled_by: "pablo", chosen: "accept as written" };
    expect(lineName(r, now, undefined, "1 Oct")).toBe("0007 Stage normalize: exit met, ruled, “accept as written”, by pablo, 1 Oct, after 3 days");
    expect(lineName({ ...r, raised: "2026-10-01" }, now, "init-a", "1 Oct")).toBe("0007 Stage normalize: exit met, init-a, ruled, “accept as written”, by pablo, 1 Oct");
  });

  it("says no ruler recorded in the text and the name alike (row 15)", () => {
    const r = { ...waiting, status: "ruled", ruled: "2026-10-01", ruled_by: "", chosen: "" };
    expect(rulerWords("")).toBe("no ruler recorded");
    expect(rulerWords("  ")).toBe("no ruler recorded");
    expect(rulerWords("pablo")).toBe("by pablo");
    expect(lineName(r, now, undefined, "1 Oct")).toBe("0007 Stage normalize: exit met, ruled, no ruler recorded, 1 Oct, after 3 days");
  });

  it("names the Timeline row's status (B11)", () => {
    expect(timelineName(waiting)).toBe("0007 Stage normalize: exit met, waiting, raised 2026-09-28, owner pablo");
  });
});

describe("sections", () => {
  it("counts with the total while finding", () => {
    expect(countWords(2, 68, true)).toBe("2 of 68");
    expect(countWords(68, 68, false)).toBe("68");
  });

  it("shows the newest ten of Ruled unless all are asked for or a find is on", () => {
    const rows = Array.from({ length: 68 }, (_, i) => i);
    expect(ruledShown(rows, false, false)).toEqual({ shown: rows.slice(0, 10), hidden: 58 });
    expect(ruledShown(rows, true, false).shown).toHaveLength(68);
    expect(ruledShown(rows, false, true).shown).toHaveLength(68);
    expect(ruledShown(rows.slice(0, 10), false, false).hidden).toBe(0);
  });

  it("opens To rule and Ruled and closes the Timeline unless remembered", () => {
    expect(decSectionsOf(null)).toEqual({ rule: true, ruled: true, timeline: false });
    expect(decSectionsOf("not json")).toEqual({ rule: true, ruled: true, timeline: false });
    expect(decSectionsOf('{"ruled":false,"timeline":true,"rule":"x"}')).toEqual({ rule: true, ruled: false, timeline: true });
  });

  it("says nothing ruled yet without a find, no match only with one (row 5)", () => {
    expect(emptyRuledWords(false)).toBe("Nothing ruled yet.");
    expect(emptyRuledWords(true)).toBe("no match");
  });

  it("names what the Timeline hides while finding (row 9)", () => {
    expect(timelineCount(1, 71, 3, true)).toBe("1 of 71 · 3 hidden");
    expect(timelineCount(1, 74, 0, true)).toBe("1 of 74");
    expect(timelineCount(71, 71, 3, false)).toBeNull();
  });

  const stored = { rule: true, ruled: false, timeline: false };
  it("opens the sections with a hit while finding and restores the layout after (row 6)", () => {
    const hits = { rule: false, ruled: true, timeline: true };
    expect(shownSections(stored, {}, hits, {})).toEqual({ rule: true, ruled: true, timeline: true });
    expect(shownSections(stored, {}, null, {})).toEqual(stored);
  });

  it("lets a hand toggle win during a find, and drops it with the find", () => {
    const hits = { rule: false, ruled: true, timeline: false };
    expect(shownSections(stored, {}, hits, { ruled: false }).ruled).toBe(false);
    expect(shownSections(stored, {}, null, { ruled: true }).ruled).toBe(false);
  });

  it("opens a landing's section for the visit over the stored layout (row 8)", () => {
    expect(shownSections(stored, { ruled: true }, null, {})).toEqual({ rule: true, ruled: true, timeline: false });
    expect(shownSections(stored, {}, null, {}).ruled).toBe(false);
  });
});
