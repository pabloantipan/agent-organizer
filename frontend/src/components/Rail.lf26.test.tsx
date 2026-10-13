import { describe, expect, it, vi } from "vitest";
import { placeInView } from "./Rail";

// leftovers-26 FR-8 (rl-ui U1): the place is measured after the ⋯ is in view.
// A fake ⋯ whose box moves when scrollIntoView centers it in the rail, the
// way WebKit scrolls it: 24 px tall, rail 0..640, menu 88 px.
const dots = (top: number, centered: number) => {
  let at = top;
  const scrollIntoView = vi.fn(() => { at = centered; });
  return { getBoundingClientRect: () => ({ top: at, bottom: at + 24 }) as DOMRect, scrollIntoView };
};
const rail = { top: 0, bottom: 640 };

describe("M1: a ⋯ pressed out of view opens downward when there is room below (FR-8)", () => {
  it("brings a ⋯ below the rail to the middle, then opens down", () => {
    const d = dots(1077, 308);
    expect(placeInView(d, rail, 88, 640)).toEqual({ up: false, room: 306 });
    expect(d.scrollIntoView).toHaveBeenCalledWith({ block: "center" });
  });
  it("brings a ⋯ above the rail to the middle, then opens down", () => {
    const d = dots(-200, 308);
    expect(placeInView(d, rail, 88, 640).up).toBe(false);
    expect(d.scrollIntoView).toHaveBeenCalledOnce();
  });
  it("measures a ⋯ in view where it stands: no scroll, down with room, up at the bottom edge", () => {
    const mid = dots(300, 0);
    expect(placeInView(mid, rail, 88, 640)).toEqual({ up: false, room: 314 });
    expect(mid.scrollIntoView).not.toHaveBeenCalled();
    const low = dots(616, 0);
    expect(placeInView(low, rail, 88, 640)).toEqual({ up: true, room: 614 });
    expect(low.scrollIntoView).not.toHaveBeenCalled();
  });
  it("a ⋯ cut by the rail's top (under the top bar) counts as out of view", () => {
    const d = dots(30, 308);
    placeInView(d, { top: 40, bottom: 640 }, 88, 640);
    expect(d.scrollIntoView).toHaveBeenCalledOnce();
  });
});
