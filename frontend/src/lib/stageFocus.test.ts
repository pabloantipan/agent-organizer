import { describe, expect, it } from "vitest";
import { stageFocusIndex, stageFocusOf } from "./stageFocus";

describe("stage focus by position (initiative-header FR-18)", () => {
  it("round-trips a position", () => {
    expect(stageFocusIndex(stageFocusOf("init-a", 0), "init-a", 4)).toBe(0);
    expect(stageFocusIndex(stageFocusOf("init-a", 3), "init-a", 4)).toBe(3);
  });

  it("two tiles with one duplicate id still name two positions", () => {
    const ids = ["discover", "build", "build", "ship"];
    const opened = ids.map((_, k) => stageFocusIndex(stageFocusOf("init-a", k), "init-a", ids.length));
    expect(opened).toEqual([0, 1, 2, 3]);
  });

  it("ignores another initiative, a stage id and a position past the end", () => {
    expect(stageFocusIndex(stageFocusOf("init-b", 1), "init-a", 4)).toBeNull();
    expect(stageFocusIndex(stageFocusOf("init-a", 1), "init-a-2", 4)).toBeNull();
    expect(stageFocusIndex("init-a/build", "init-a", 4)).toBeNull();
    expect(stageFocusIndex(stageFocusOf("init-a", 4), "init-a", 4)).toBeNull();
    expect(stageFocusIndex(null, "init-a", 4)).toBeNull();
  });
});
