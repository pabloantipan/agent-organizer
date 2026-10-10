import { describe, expect, it } from "vitest";
import { applyLanding } from "./initiatives";
import { useBoard } from "../stores/board.store";
import homeSrc from "../components/Home.tsx?raw";
import railSrc from "../components/Rail.tsx?raw";

// U3 (leftovers-15 FR-6): Initiatives › from Home and from the rail leaves
// focus on the view's title. No DOM library is a dependency here (jsdom
// would change package.json, outside this card's boundary), so the title
// is a stand-in whose focus() sets a stand-in document's activeElement,
// and the view's effect runs through applyLanding, the one function it
// calls.

describe("U3: Initiatives › lands on the view's title", () => {
  it("Home's and the rail's Initiatives › ask for the title landing", () => {
    for (const [file, text] of [["Home.tsx", homeSrc], ["Rail.tsx", railSrc]]) {
      const links = text.split("\n").filter((l: string) => /Initiatives ›<\/button>/.test(l) && !/Wake in Initiatives/.test(l));
      expect(links.length, file).toBeGreaterThan(0);
      for (const l of links) expect(l, file).toContain('openInitiatives("title")');
    }
  });

  it("the store carries it to the view", () => {
    useBoard.getState().openInitiatives("title");
    expect(useBoard.getState().screen).toBe("initiatives");
    expect(useBoard.getState().initiativesFocus).toBe("title");
  });

  it("the view's landing leaves document.activeElement on the title once the board draws", () => {
    const doc: { activeElement: unknown } = { activeElement: null };
    const title = { tag: "h1", focus: () => { doc.activeElement = title; } };
    expect(applyLanding("title", { view: false, factory: false }, title)).toEqual({ done: false });
    expect(doc.activeElement).toBeNull();
    // The title does not wait for the factory's answer.
    expect(applyLanding("title", { view: true, factory: false }, title)).toEqual({ done: true });
    expect(doc.activeElement).toBe(title);
  });

  it("the header's Wake link still waits for the factory, then lands on that card", () => {
    expect(applyLanding("wake:init-asleep", { view: true, factory: false }, null)).toEqual({ done: false });
    expect(applyLanding("wake:init-asleep", { view: true, factory: true }, null)).toEqual({ done: true, card: "init-asleep" });
    expect(applyLanding(null, { view: true, factory: true }, null)).toEqual({ done: false });
  });
});
