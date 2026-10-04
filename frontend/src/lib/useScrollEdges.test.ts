import { describe, expect, it } from "vitest";
import { sideEdges } from "./useScrollEdges";

describe("sideEdges (leftovers-5 FR-13)", () => {
  it("has no edge when nothing scrolls, a fractional pixel included", () => {
    expect(sideEdges({ scrollLeft: 0, scrollWidth: 300, clientWidth: 300 })).toEqual({ left: false, right: false });
    expect(sideEdges({ scrollLeft: 0, scrollWidth: 300.5, clientWidth: 300 })).toEqual({ left: false, right: false });
  });

  it("marks only the side with hidden content", () => {
    expect(sideEdges({ scrollLeft: 0, scrollWidth: 600, clientWidth: 300 })).toEqual({ left: false, right: true });
    expect(sideEdges({ scrollLeft: 150, scrollWidth: 600, clientWidth: 300 })).toEqual({ left: true, right: true });
    expect(sideEdges({ scrollLeft: 299.5, scrollWidth: 600, clientWidth: 300 })).toEqual({ left: true, right: false });
  });
});
