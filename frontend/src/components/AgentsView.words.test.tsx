import { describe, expect, it, vi } from "vitest";

vi.mock("../stores/board.store", () => ({ useBoard: Object.assign(() => ({}), { getState: () => ({}), setState: () => undefined }) }));
const { countsOf } = await import("./AgentsView");

const group = (agents: number, live: number, working: number, seats?: number) =>
  ({ agents: Array.from({ length: agents }, () => ({})), live, working, cell: seats === undefined ? undefined : {}, crew: Array.from({ length: seats ?? 0 }, () => ({})) }) as unknown as Parameters<typeof countsOf>[0];

describe("W1: F1's counts carry their nouns in the right number (leftovers-26 FR-5)", () => {
  it("1 agent, never 1 agents", () => {
    expect(countsOf(group(1, 1, 0))).toBe("1 agent · 1 live · 0 working");
    expect(countsOf(group(1, 1, 0))).not.toContain("1 agents");
  });
  it("25 agents", () => {
    expect(countsOf(group(25, 3, 2))).toBe("25 agents · 3 live · 2 working");
  });
  it("seats agree too: 1 seat, 4 seats", () => {
    expect(countsOf(group(2, 1, 1, 1))).toBe("2 agents · 1 live · 1 working · 1 seat");
    expect(countsOf(group(2, 1, 1, 4))).toBe("2 agents · 1 live · 1 working · 4 seats");
  });
});
