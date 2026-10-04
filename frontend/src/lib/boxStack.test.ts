import { afterEach, describe, expect, it } from "vitest";
import { escapeTop, openBox, openBoxes } from "./boxStack";

const esc = () => {
  const e = { key: "Escape", defaultPrevented: false, preventDefault() { e.defaultPrevented = true; } };
  return e as unknown as KeyboardEvent;
};

describe("Escape closes the topmost box only (leftovers-5 FR-1)", () => {
  const closes: (() => void)[] = [];
  afterEach(() => { closes.splice(0).forEach((c) => c()); });

  it("a rule box, then Help: Escape closes Help, the next Escape the box", () => {
    const shut: string[] = [];
    const rule = openBox(() => { shut.push("rule"); rule(); });
    const help = openBox(() => { shut.push("help"); help(); });
    escapeTop(esc());
    expect(shut).toEqual(["help"]);
    escapeTop(esc());
    expect(shut).toEqual(["help", "rule"]);
    expect(openBoxes()).toBe(0);
  });

  it("a card back over a rule box: the card back first", () => {
    const shut: string[] = [];
    closes.push(openBox(() => shut.push("rule")));
    const card = openBox(() => { shut.push("card"); card(); });
    escapeTop(esc());
    expect(shut).toEqual(["card"]);
  });

  it("a box closed out of order leaves the others in their order", () => {
    const shut: string[] = [];
    closes.push(openBox(() => shut.push("a")));
    const b = openBox(() => shut.push("b"));
    closes.push(openBox(() => shut.push("c")));
    b();
    escapeTop(esc());
    expect(shut).toEqual(["c"]);
  });

  it("a busy top box keeps the Escape: the box under it stays", () => {
    const shut: string[] = [];
    closes.push(openBox(() => shut.push("help")));
    closes.push(openBox(() => { /* ruling: busy */ }));
    const e = esc();
    escapeTop(e);
    expect(shut).toEqual([]);
    expect(e.defaultPrevented).toBe(true);
  });

  it("an Escape already handled inside a box closes nothing", () => {
    const shut: string[] = [];
    closes.push(openBox(() => shut.push("help")));
    const e = esc();
    e.preventDefault();
    escapeTop(e);
    expect(shut).toEqual([]);
  });
});
