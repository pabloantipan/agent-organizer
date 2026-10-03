import { describe, expect, it } from "vitest";
import { scrollEdges } from "./scrollEdges";

describe("a scroll area's edges (initiative-header FR-17)", () => {
  it("draws no edge when nothing is hidden", () => {
    expect(scrollEdges({ scrollTop: 0, scrollHeight: 200, clientHeight: 200 })).toEqual({ top: false, bottom: false });
    expect(scrollEdges({ scrollTop: 0, scrollHeight: 200.5, clientHeight: 200 })).toEqual({ top: false, bottom: false });
  });

  it("at the top, only the bottom edge", () => {
    expect(scrollEdges({ scrollTop: 0, scrollHeight: 400, clientHeight: 200 })).toEqual({ top: false, bottom: true });
  });

  it("in the middle, both", () => {
    expect(scrollEdges({ scrollTop: 100, scrollHeight: 400, clientHeight: 200 })).toEqual({ top: true, bottom: true });
  });

  it("at the end, only the top edge, with a fractional end", () => {
    expect(scrollEdges({ scrollTop: 199.5, scrollHeight: 400, clientHeight: 200 })).toEqual({ top: true, bottom: false });
  });
});
