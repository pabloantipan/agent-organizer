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

// leftovers-26 FR-1, FR-2 (S2). No DOM library is a dependency here, so the
// regions are stand-ins: attributes in a map, the size the test sets, and
// observers that record their callbacks so a test can fire them.
import { overflowsX, overflowsY, regionName, scrollStop, watchMarkdown } from "./useScrollEdges";
import { afterEach, beforeEach } from "vitest";

class Region {
  attrs = new Map<string, string>();
  classes = new Set<string>();
  classList = { toggle: (c: string, on: boolean) => { if (on) this.classes.add(c); else this.classes.delete(c); } };
  children: Region[] = [];
  scrollLeft = 0; scrollWidth = 300; clientWidth = 300;
  scrollTop = 0; scrollHeight = 300; clientHeight = 300;
  constructor(public tagName = "DIV", role?: string) { if (role) this.attrs.set("role", role); }
  getAttribute(k: string) { return this.attrs.get(k) ?? null; }
  setAttribute(k: string, v: string) { this.attrs.set(k, v); }
  removeAttribute(k: string) { this.attrs.delete(k); }
  addEventListener() {}
  removeEventListener() {}
  querySelectorAll() { return this.children; }
}

const stop = (r: Region) => ({ tabindex: r.getAttribute("tabindex"), role: r.getAttribute("role"), label: r.getAttribute("aria-label"), labelledby: r.getAttribute("aria-labelledby") });
const none = { tabindex: null, role: null, label: null, labelledby: null };

describe("scrollStop (leftovers-26 FR-1)", () => {
  it("is a named region stop only while it overflows, and loses all of it when it stops", () => {
    const r = new Region();
    scrollStop(r, true, regionName.cardBody("Long card"));
    expect(stop(r)).toEqual({ tabindex: "0", role: "region", label: "Long card, details", labelledby: null });
    scrollStop(r, false, regionName.cardBody("Long card"));
    expect(stop(r)).toEqual(none);
  });

  it("names by the heading over it when there is one", () => {
    const r = new Region();
    scrollStop(r, true, { labelledBy: "help-title" });
    expect(stop(r)).toEqual({ tabindex: "0", role: "region", label: null, labelledby: "help-title" });
    scrollStop(r, false, { labelledBy: "help-title" });
    expect(stop(r)).toEqual(none);
  });

  it("keeps a role of its own (the floating list's listbox)", () => {
    const r = new Region("DIV", "listbox");
    scrollStop(r, true, regionName.floatList);
    expect(stop(r)).toEqual({ tabindex: "0", role: "listbox", label: "Initiatives list", labelledby: null });
    scrollStop(r, false, regionName.floatList);
    expect(stop(r)).toEqual({ tabindex: null, role: "listbox", label: null, labelledby: null });
  });

  it("measures overflow with the edges' pixel of slack", () => {
    expect(overflowsY({ scrollHeight: 300.5, clientHeight: 300 })).toBe(false);
    expect(overflowsY({ scrollHeight: 600, clientHeight: 300 })).toBe(true);
    expect(overflowsX({ scrollWidth: 301, clientWidth: 300 })).toBe(false);
    expect(overflowsX({ scrollWidth: 900, clientWidth: 300 })).toBe(true);
  });
});

describe("the names of A3 §1 (leftovers-26 FR-2, FR-3; S4)", () => {
  it("says each region's words", () => {
    expect(regionName.cardBody("Long bodies scroll")).toEqual({ label: "Long bodies scroll, details" });
    expect(regionName.roleBody("Hermes")).toEqual({ label: "Hermes, details" });
    expect(regionName.record("0122", "accept leftovers-26")).toEqual({ label: "Record 0122, accept leftovers-26" });
    expect(regionName.floatList).toEqual({ label: "Initiatives list" });
    expect(regionName.headerOpen("organizer")).toEqual({ label: "Details of organizer" });
    expect(regionName.block("PRE")).toEqual({ label: "Code, scrolls" });
    expect(regionName.block("TABLE")).toEqual({ label: "Table, scrolls" });
  });
});

describe("watchMarkdown: code blocks and tables are stops while they scroll (S2)", () => {
  const fired: Array<() => void> = [];
  beforeEach(() => {
    fired.length = 0;
    const Observer = class { constructor(cb: (records: unknown[]) => void) { fired.push(() => cb([])); } observe() {} disconnect() {} };
    Object.assign(globalThis, { ResizeObserver: Observer, MutationObserver: Observer });
  });
  afterEach(() => { Object.assign(globalThis, { ResizeObserver: undefined, MutationObserver: undefined }); });

  it("puts tabindex, role and name on an overflowing pre and table only, and takes them off when they fit", () => {
    const pre = new Region("PRE"), table = new Region("TABLE"), narrow = new Region("PRE");
    pre.scrollWidth = 900; table.scrollWidth = 700;
    const body = new Region();
    body.children = [pre, table, narrow];
    const done = watchMarkdown(body as unknown as HTMLElement);
    expect(stop(pre)).toEqual({ tabindex: "0", role: "region", label: "Code, scrolls", labelledby: null });
    expect(stop(table)).toEqual({ tabindex: "0", role: "region", label: "Table, scrolls", labelledby: null });
    expect(pre.classes.has("edge-right")).toBe(true);
    expect(stop(narrow)).toEqual(none);
    // A wider window: the table fits now; its next measurement takes the stop off.
    table.clientWidth = 700;
    fired.forEach((f) => f());
    expect(stop(table)).toEqual(none);
    expect(stop(pre).tabindex).toBe("0");
    done();
  });
});
