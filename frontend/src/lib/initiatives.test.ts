import { describe, expect, it } from "vitest";
import {
  agentMemory, groupMemory, afterLine, confirmLines, countWords, factoryLine, isLimitRefusal, limitLine, listWords, memoryLine, mostMemory,
  nextLine, progressLine, refusedWakeName, sectionsOf, limitNames, landingOf, foldName, rowMemoryWords, sessionsLine, sinceLine, sleepyOf, sleepyWord, waitLine, waitingOf, doneLine, firstLine,
} from "./initiatives";

const GB = 1024 ** 3;
const words = (d: string) => (d === "2026-10-14" ? "14 Oct" : d === "2026-10-02" ? "2 Oct" : d);

describe("the words of a status (The words)", () => {
  it("active and empty are awake, paused asleep, the rest archived", () => {
    expect(sleepyOf("active")).toBe("awake");
    expect(sleepyOf("")).toBe("awake");
    expect(sleepyOf(undefined)).toBe("awake");
    expect(sleepyOf("paused")).toBe("asleep");
    expect(sleepyOf("archived")).toBe("archived");
    expect(sleepyOf("done")).toBe("archived");
  });
  it("an unknown status is shown as written", () => {
    expect(sleepyWord("done")).toBe("done");
    expect(sleepyWord("paused")).toBe("asleep");
    expect(sleepyWord("archived")).toBe("archived");
  });
});

describe("the head's count (§1, I2)", () => {
  it("is neutral under the limit", () => {
    expect(countWords(3, 4)).toEqual({ text: "3 of 4 awake", over: false, title: "" });
  });
  it("says the limit at four", () => {
    expect(countWords(4, 4).text).toBe("4 of 4 awake · the limit");
    expect(countWords(4, 4).over).toBe(false);
  });
  it("is over the limit above four, with its hover", () => {
    const c = countWords(5, 4);
    expect(c.text).toBe("5 of 4 awake · over the limit");
    expect(c.over).toBe(true);
    expect(c.title).toBe("one was woken past the limit outside Deltagos; put one to sleep");
  });
  it("names the initiative the factory does not see when the counts differ", () => {
    expect(countWords(4, 4, 3, ["camp"]).title).toBe("the factory counts 3; it does not see camp");
    expect(countWords(3, 4, 3, ["camp"]).title).toBe("");
  });
  it("is the count alone when the factory is missing or failing (I15)", () => {
    expect(countWords(10, null)).toEqual({ text: "10 awake", over: false, title: "" });
  });
  it("reads none awake", () => {
    expect(countWords(0, 4).text).toBe("0 of 4 awake");
  });
});

describe("the sessions line (§3)", () => {
  it("awake, with frozen and working only when there are any", () => {
    expect(sessionsLine("awake", 4, 1, 0)).toBe("4 sessions live · 1 frozen");
    expect(sessionsLine("awake", 6, 0, 0)).toBe("6 sessions live");
    expect(sessionsLine("awake", 1, 0, 1)).toBe("1 session live · 1 working");
    expect(sessionsLine("awake", 0, 0, 0)).toBe("no sessions live");
  });
  it("asleep", () => {
    expect(sessionsLine("asleep", 0, 3, 0)).toBe("3 sessions frozen");
    expect(sessionsLine("asleep", 0, 1, 0)).toBe("1 session frozen");
    expect(sessionsLine("asleep", 0, 0, 0)).toBe("no sessions frozen");
  });
  it("while it runs (§6)", () => {
    expect(progressLine("sleep", 4)).toBe("freezing 4 sessions…");
    expect(progressLine("wake", 3)).toBe("thawing 3 sessions…");
    expect(progressLine("wake", 1)).toBe("thawing 1 session…");
  });
});

describe("the memory line (§3, States)", () => {
  const feed = { memory: { pressure: "normal", by_initiative: [{ initiative: "organizer", bytes: 9.8 * GB }, { initiative: "camp", bytes: 11.2 * GB }, { initiative: "", bytes: GB, unassigned: true }] } };
  it("is the initiative's total", () => {
    expect(memoryLine(feed, "organizer", false).text).toBe("Memory 9.8 GB");
  });
  it("hovers the biggest sessions", () => {
    expect(memoryLine(feed, "camp", false, ["andrea 3.1 GB"]).title).toBe("biggest: andrea 3.1 GB");
  });
  it("reads none running when nothing of it runs", () => {
    expect(memoryLine(feed, "hestia", false).text).toBe("Memory: none running");
  });
  it("is a dash while reading and when the read failed", () => {
    expect(memoryLine(null, "x", false)).toEqual({ text: "Memory —", title: "reading memory…" });
    expect(memoryLine({ memory: null }, "x", false)).toEqual({ text: "Memory —", title: "reading memory…" });
    expect(memoryLine({ memory: null, memory_reason: "vm_stat failed" }, "x", false)).toEqual({ text: "Memory —", title: "memory could not be read" });
  });
  it("marks the most at high or critical, never at normal", () => {
    expect(mostMemory(feed, ["organizer", "camp"])).toBeNull();
    const high = { memory: { ...feed.memory, pressure: "high" } };
    expect(mostMemory(high, ["organizer", "camp"])).toBe("camp");
    expect(mostMemory(high, ["organizer"])).toBe("organizer");
    expect(memoryLine(high, "camp", true).text).toBe("Memory 11.2 GB · the most");
  });
});

describe("the next and since lines (§3)", () => {
  it("names the kind and the date in words", () => {
    expect(nextLine({ date: "2026-10-14", what: "due · w-review" }, words).text).toBe("Next: due 14 Oct");
    expect(nextLine({ date: "2026-10-14", what: "target" }, words).text).toBe("Next: target 14 Oct");
    expect(nextLine(null, words)).toMatchObject({ text: "Next: no date", none: true });
  });
  it("asleep since, only when the factory's comment says so", () => {
    expect(sinceLine("2026-10-02", words)).toBe("asleep since 2 Oct");
    expect(sinceLine("", words)).toBeNull();
  });
  it("P4 (FR-7): asleep since today on the day", () => {
    const now = new Date(2026, 9, 9);
    expect(sinceLine("2026-10-09", words, now)).toBe("asleep since today");
    expect(sinceLine("2026-10-02", words, now)).toBe("asleep since 2 Oct");
    expect(sinceLine("2025-10-09", (d) => d, now)).toBe("asleep since 2025-10-09");
  });
});

describe("Sleep's confirm (§4, I4)", () => {
  const none = { decision: 0, thread: 0, card: 0, other: 0 };
  it("is her example", () => {
    const c = confirmLines("organizer", 4, ["fse"], { decision: 2, thread: 1, card: 0, other: 0 }, false);
    expect(c.question).toBe("Sleep organizer?");
    expect(c.commit).toBe("Sleep organizer");
    expect(c.lines).toEqual([
      "4 sessions freeze: their conversations are kept and mail waits.",
      "1 is working now: fse.",
      "2 decisions and 1 thread waiting on you leave Needs me until it wakes.",
    ]);
  });
  it("is empty with nothing live and nothing waiting, so Sleep runs at once", () => {
    expect(confirmLines("x", 0, [], none, false).lines).toEqual([]);
  });
  it("P6 (FR-9): the last awake one asks even with nothing live or waiting", () => {
    expect(confirmLines("x", 0, [], none, true).lines).toEqual(["Home will be empty until one wakes."]);
  });
  it("P4 (FR-7): one row leaves, more leave", () => {
    expect(confirmLines("x", 0, [], { decision: 1, thread: 0, card: 0, other: 0 }, false).lines).toEqual(["1 decision waiting on you leaves Needs me until it wakes."]);
    expect(confirmLines("x", 0, [], { decision: 0, thread: 0, card: 0, other: 1 }, false).lines).toEqual(["1 other row waiting on you leaves Needs me until it wakes."]);
    expect(confirmLines("x", 0, [], { decision: 1, thread: 1, card: 0, other: 0 }, false).lines).toEqual(["1 decision and 1 thread waiting on you leave Needs me until it wakes."]);
  });
  it("says only what is true", () => {
    expect(confirmLines("x", 1, [], none, false).lines).toEqual(["1 session freezes: its conversation is kept and mail waits."]);
    expect(confirmLines("x", 0, [], { decision: 1, thread: 0, card: 2, other: 0 }, false).lines).toEqual(["1 decision and 2 cards waiting on you leave Needs me until it wakes."]);
  });
  it("adds Home's line when it is the last awake", () => {
    expect(confirmLines("x", 2, ["a", "b"], none, true).lines).toEqual([
      "2 sessions freeze: their conversations are kept and mail waits.",
      "2 are working now: a and b.",
      "Home will be empty until one wakes.",
    ]);
  });
  it("counts the Needs me rows of that initiative only", () => {
    const rows = [{ kind: "decision", initiative: "a" }, { kind: "thread", initiative: "a" }, { kind: "decision", initiative: "b" }, { kind: "seat", initiative: "a" }];
    expect(waitingOf(rows, "a")).toEqual({ decision: 1, thread: 1, card: 0, other: 1 });
  });
});

describe("Wake at the limit (§5, I6)", () => {
  it("names the four awake", () => {
    expect(limitLine(["agent-slack", "camp", "hestia", "organizer"])).toBe("Four are awake: agent-slack, camp, hestia, organizer. Put one to sleep to wake another.");
  });
  it("names a refused Wake with its reason", () => {
    expect(refusedWakeName("hestia", 4)).toBe("Wake hestia: four are awake");
  });
});

describe("while it runs and after (§6, States)", () => {
  it("one at a time", () => {
    expect(waitLine({ id: "organizer", action: "sleep" })).toBe("Wait for organizer to finish sleeping.");
    expect(waitLine({ id: "hestia", action: "wake" })).toBe("Wait for hestia to finish waking.");
  });
  it("the live region's words", () => {
    expect(doneLine("organizer", "sleep")).toBe("organizer is asleep");
    expect(doneLine("hestia", "wake")).toBe("hestia is awake");
  });
  it("tells the factory's limit refusal from a failure", () => {
    expect(isLimitRefusal({ exit_code: 1, output: "4 initiatives are awake (limit 4): put one to sleep first" })).toBe(true);
    expect(isLimitRefusal({ exit_code: 3, output: "boom" })).toBe(false);
    expect(firstLine("\n  seat-freeze: no such session\nmore")).toBe("seat-freeze: no such session");
  });
  it("says what is true after a failure", () => {
    expect(afterLine("organizer", "sleep", "active", 0)).toBe("Nothing changed.");
    expect(afterLine("organizer", "sleep", "paused", 1, ["fse"])).toBe("organizer is asleep, but 1 session still runs: fse.");
    expect(afterLine("organizer", "sleep", "paused", 3, ["a", "b"])).toBe("organizer is asleep, but 3 sessions still run: a and b.");
    expect(afterLine("hestia", "wake", "paused", 0)).toBe("Nothing changed.");
    expect(afterLine("hestia", "wake", "active", 0)).toBe("hestia is awake.");
  });
});

describe("the factory's line (States)", () => {
  it("missing, failing, answering", () => {
    expect(factoryLine({ found: false, ok: false, limit: 0, awake: 0 })).toBe("Sleep and Wake need the factory command, which is not on this Mac.");
    expect(factoryLine({ found: true, ok: false, reason: "python3: not found", limit: 0, awake: 0 })).toBe("Sleep and Wake need the factory, which did not answer: python3: not found.");
    expect(factoryLine({ found: true, ok: true, limit: 4, awake: 3 })).toBeNull();
  });
});

describe("sections (§2)", () => {
  it("awake, asleep, archived, each in the given order", () => {
    const s = sectionsOf([{ id: "c", state: "asleep" as const, local: true }, { id: "a", state: "awake" as const, local: true }, { id: "z", state: "archived" as const, local: true }, { id: "b", state: "awake" as const, local: true }]);
    expect(s.awake.map((i) => i.id)).toEqual(["a", "b"]);
    expect(s.asleep.map((i) => i.id)).toEqual(["c"]);
    expect(s.archived.map((i) => i.id)).toEqual(["z"]);
  });
  it("lists in words", () => {
    expect(listWords(["a"])).toBe("a");
    expect(listWords(["a", "b", "c"])).toBe("a, b and c");
  });
});

describe("Agents' Memory column (I10)", () => {
  const feed = { memory: { pressure: "normal", by_initiative: [{ initiative: "organizer", bytes: 9.8 * GB }, { initiative: "", bytes: 2 * GB, unassigned: true }] } };
  it("is the row's figure", () => {
    expect(agentMemory({ pid: 7, state: "working", mem_bytes: 1.4 * GB }, feed)).toMatchObject({ text: "1.4 GB" });
  });
  it("is a dash with its reason when unread", () => {
    expect(agentMemory({ pid: 0, state: "exited" }, feed)).toEqual({ text: "—", title: "not running" });
    expect(agentMemory({ pid: 7, state: "running", mem_bytes: 5 }, null)).toEqual({ text: "—", title: "reading memory…" });
    expect(agentMemory({ pid: 7, state: "running", mem_bytes: 5 }, { memory: null, memory_reason: "x" })).toEqual({ text: "—", title: "memory could not be read" });
  });
  it("totals a group the way its card does", () => {
    expect(groupMemory(feed, "organizer")).toBe("Memory 9.8 GB");
    expect(groupMemory(feed, "")).toBe("Memory 2 GB");
    expect(groupMemory(feed, "camp")).toBeNull();
  });
  it("P2 (FR-5): the head reads Memory — with memory unread", () => {
    expect(groupMemory(null, "organizer")).toBe("Memory —");
    expect(groupMemory({ memory: null, memory_reason: "x" }, "organizer")).toBe("Memory —");
    expect(groupMemory({ memory: null, memory_reason: "x" }, "")).toBe("Memory —");
  });
  it("P2 (FR-5): a row's name says memory unknown, never a number the cell does not show", () => {
    const row = { pid: 7, state: "running", mem_bytes: 0.05 * GB };
    expect(rowMemoryWords(row, { memory: null, memory_reason: "x" })).toBe("memory unknown");
    expect(rowMemoryWords(row, null)).toBe("memory unknown");
    expect(rowMemoryWords({ pid: 7, state: "running", mem_bytes: 0 }, feed)).toBe("memory unknown");
    expect(rowMemoryWords({ pid: 7, state: "working", mem_bytes: 1.4 * GB }, feed)).toBe("1.4 GB memory");
    expect(rowMemoryWords({ pid: 0, state: "exited" }, { memory: null, memory_reason: "x" })).toBe("");
  });
});

describe("the view's landings and the rail's folds (leftovers-15)", () => {
  it("P3 (FR-6): Initiatives › lands on the title, the header's Wake link on that Wake", () => {
    expect(landingOf("title")).toEqual({ to: "title" });
    expect(landingOf("wake:init-asleep")).toEqual({ to: "action", id: "init-asleep" });
    expect(landingOf(null)).toBeNull();
    expect(landingOf("")).toBeNull();
  });
  it("P4 (FR-7): fold chevrons carry their row", () => {
    expect(foldName(true, "Asleep")).toBe("Expand Asleep");
    expect(foldName(false, "Archived")).toBe("Collapse Archived");
  });
  it("P5 (FR-8): the limit line links only those with a Sleep", () => {
    const awake = [{ id: "init-a", blind: false }, { id: "init-blind", blind: true }];
    expect(limitNames(awake, (a) => !a.blind)).toEqual([{ id: "init-a", link: true }, { id: "init-blind", link: false }]);
  });
});
