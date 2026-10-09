import { describe, expect, it } from "vitest";
import { agentsLine, buttonName, buttonText, duration, freeLine, gb, memoryState, panelLine, pressureLine, sessionRows, wasCriticalLine, type MemoryReading } from "./memory";

const G = 1024 ** 3;
const at = (h: number, m: number) => new Date(2026, 9, 9, h, m).getTime();
const reading = (p: Partial<MemoryReading> = {}): MemoryReading => ({ pressure: "normal", total_bytes: 32 * G, free_bytes: 12 * G, agents_bytes: 18.6 * G, since: new Date(at(14, 0)).toISOString(), since_opened: false, ...p });

describe("gb", () => {
  it("is GB of 2^30 to one decimal, a whole number without .0", () => {
    expect(gb(12 * G)).toBe("12");
    expect(gb(3.14 * G)).toBe("3.1");
    expect(gb(25769803776)).toBe("24");
    expect(gb(1.25 * G)).toBe("1.3");
    expect(gb(0)).toBe("0");
  });
});

describe("memoryState", () => {
  it("is none before the first sample and failed with a reason", () => {
    expect(memoryState(null)).toBe("none");
    expect(memoryState({ memory: null })).toBe("none");
    expect(memoryState({ memory: null, memory_reason: "vm_stat: exit 1" })).toBe("failed");
  });
  it("is the pressure word", () => {
    expect(memoryState({ memory: reading() })).toBe("normal");
    expect(memoryState({ memory: reading({ pressure: "high" }) })).toBe("high");
    expect(memoryState({ memory: reading({ pressure: "critical" }) })).toBe("critical");
  });
});

describe("the button", () => {
  it("says her words per level, regular width", () => {
    expect(buttonText("normal", reading(), false)).toBe("12 GB free");
    expect(buttonText("high", reading({ free_bytes: 3.1 * G }), false)).toBe("3.1 GB free · high");
    expect(buttonText("critical", reading({ free_bytes: 1.2 * G }), false)).toBe("Memory critical · 1.2 GB free");
  });
  it("is short at 1024, the word in the name", () => {
    expect(buttonText("normal", reading(), true)).toBe("12 GB");
    expect(buttonText("high", reading({ free_bytes: 3.1 * G }), true)).toBe("3.1 GB");
    expect(buttonText("critical", reading({ free_bytes: 1.2 * G }), true)).toBe("critical · 1.2 GB");
  });
  it("is a dash with no reading or a failed one", () => {
    expect(buttonText("none", null, false)).toBe("—");
    expect(buttonText("failed", null, true)).toBe("—");
  });
  it("is named Memory: <level>, <free> GB free of <total> GB", () => {
    expect(buttonName("high", reading({ free_bytes: 3.1 * G }))).toBe("Memory: high, 3.1 GB free of 32 GB");
    expect(buttonName("failed", null)).toBe("memory unknown");
    expect(buttonName("none", null)).toBe("Memory: reading…");
  });
});

describe("the popover's lines", () => {
  it("says normal with no time at normal", () => {
    expect(pressureLine(reading(), at(14, 4))).toBe("normal");
  });
  it("says how long high or critical has lasted", () => {
    expect(pressureLine(reading({ pressure: "high" }), at(14, 4))).toBe("high, for 4 min");
    expect(pressureLine(reading({ pressure: "critical" }), at(14, 0) + 20_000)).toBe("critical, for 1 min");
    expect(pressureLine(reading({ pressure: "high", since_opened: true }), at(14, 4))).toBe("high, since Deltagos opened");
  });
  it("counts hours", () => {
    expect(duration(125 * 60000)).toBe("2 h 5 min");
    expect(duration(120 * 60000)).toBe("2 h");
  });
  it("keeps Was critical until for as long as the reading carries it, never while critical", () => {
    const until = new Date(at(14, 32)).toISOString();
    expect(wasCriticalLine(reading({ was_critical_until: until }))).toBe("Was critical until 14:32");
    expect(wasCriticalLine(reading())).toBeNull();
    expect(wasCriticalLine(reading({ pressure: "critical", was_critical_until: until }))).toBeNull();
  });
  it("says free of total and the agents' share of what is in use", () => {
    expect(freeLine(reading({ free_bytes: 3.1 * G }))).toBe("3.1 GB of 32 GB");
    expect(agentsLine(reading({ free_bytes: 3.1 * G, agents_bytes: 18.6 * G }))).toBe("use 18.6 GB of the 28.9 GB in use");
  });
});

describe("panelLine", () => {
  it("shows only at high and critical", () => {
    expect(panelLine("normal", reading())).toBeNull();
    expect(panelLine("none", null)).toBeNull();
    expect(panelLine("high", reading({ free_bytes: 3.1 * G }))).toBe("Memory high · 3.1 GB free");
    expect(panelLine("critical", reading({ free_bytes: 1.2 * G }))).toBe("Memory critical · 1.2 GB free");
  });
});

describe("sessionRows", () => {
  const a = (session: string, pid: number, mem: number, state = "running") => ({ session, pid, state, mem_bytes: mem * G });
  it("is the reading's five, with state, then the rest biggest first", () => {
    const top = ["s1", "s2", "s3", "s4", "s5"].map((n, i) => ({ name: n, initiative: "x", bytes: (9 - i) * G, agent_id: `${n}#${i + 1}` }));
    const feed = {
      memory: reading({ top }),
      groups: [{ id: "x", agents: [a("s1", 1, 9, "working"), a("s2", 2, 8), a("s3", 3, 7), a("s4", 4, 6), a("s5", 5, 5), a("s6", 6, 1), a("s7", 7, 2), a("s7", 8, 1)] }],
      unassigned: [a("", 9, 0.5), a("gone", 0, 3)],
    };
    const rows = sessionRows(feed);
    expect(rows.map((r) => r.name)).toEqual(["s1", "s2", "s3", "s4", "s5", "s7", "s6", "pid 9"]);
    expect(rows[0].state).toBe("working");
    expect(rows[5].bytes).toBe(3 * G);
    expect(rows[7]).toMatchObject({ initiative: "", agentId: "#9" });
  });
  it("is empty without a reading", () => {
    expect(sessionRows({ memory: null, groups: [] })).toEqual([]);
  });
});
