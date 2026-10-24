import { describe, expect, it } from "vitest";
import {
  EASE, FILL, LAYER, LAYER_SHADOW, LINE, MARKS, dead, PAINT, RULES, SHEETS, isControl, onLayer, read, reaches, transitions, winners,
  type Compound, type Mark, type Target,
} from "./stateLayer.kit";

// leftovers-52 S1 and S2 (FR-1 to FR-3; review-view A16, A17, R43 amended,
// R50): every state mark is painted on one shared layer with no transition,
// and hover eases on every control. The marked selectors are not listed
// here: MARKS is every selector, in every stylesheet but review.css, with a
// compound carrying .active, .on, .current, .selected, .open,
// [aria-current], [aria-selected], [aria-pressed="true"] or
// [aria-expanded="true"], so a control added later is checked by the same
// rules without editing this file.
//
// A transition is read from the style after a change, so a mark that
// leaves eases on whatever its unmarked element transitions, and one that
// arrives on whatever the marked element does (A16). Each check below reads
// the element four ways: marked and unmarked, hovered and not.

const hovered = (parts: Compound[], hover: boolean): Target => ({ parts, hover });
const fourWays = (m: Mark): Target[] => [hovered(m.parts, false), hovered(m.parts, true), hovered(m.plain, false), hovered(m.plain, true)];
const paints = (m: Mark) => PAINT.filter((p) => m.rule.decls.has(p));
const sets = (m: Mark, prefix: string) => [...m.rule.decls.keys()].some((k) => k.startsWith(prefix));
/** The value of `prop` on the unmarked element at rest, when one rule wins it. */
const baseOf = (m: Mark, prop: string) => { const w = winners(hovered(m.plain, false), prop); return w.length === 1 ? w[0].v : null; };
/** A mark rule may restate its element's own unmarked value (the chat row keeps its background transparent over hover): nothing changes, so nothing eases. */
const restates = (m: Mark, prop: string) => FILL.some((f) => baseOf(m, f) === m.rule.decls.get(prop)) || baseOf(m, prop) === m.rule.decls.get(prop);
const label = (m: Mark) => `${m.file}: ${m.sel}`;

// Exception rules, read by the test, never a list of selectors:
// - Not a mark: a rule that paints nothing (only transform, opacity, mask,
//   layout, weight) toggles motion or visibility, not a fill or a line; the
//   chevron that turns while open (.ol-chev.open), the details that span
//   their row (.ic.open), the ⋯ shown while its menu is open
//   (.rail-group-tools.open) are of this kind.
// - Not a control: an element no hover rule fills (a stage bar, a legend
//   key, the stepper's dot, the current stage's row in Roadmap) has no hover
//   to ease; its mark may sit on its own background as long as nothing
//   transitions it, which the first check still holds it to.
// - Not on screen: a selector naming a class no component writes matches
//   nothing (roadmap.css's .srm-row family, left from the stage roadmap the
//   outline replaced); it is reported, not checked.
const notAMark = (m: Mark) => paints(m).length === 0 && !sets(m, "--mark-");
const marks = MARKS.filter((m) => !notAMark(m) && !dead(m.parts));
const controls = marks.filter((m) => isControl(m.plain));

describe("FR-3: the test finds the marked selectors itself", () => {
  it("reads every stylesheet but review.css", () => {
    expect(SHEETS).not.toContain("review.css");
    expect(SHEETS.length).toBeGreaterThan(15);
    expect(new Set(MARKS.map((m) => m.file)).size).toBeGreaterThanOrEqual(10);
  });
  it("names the selectors it skips as not on screen", () => {
    expect(MARKS.filter((m) => dead(m.parts)).map(label).every((l) => /srm-/.test(l))).toBe(true);
  });
  it("finds the controls Amendment 17 names, in their own stylesheets", () => {
    const found = controls.map(label).join("\n");
    for (const name of ["person", "subtabs", "seg", "strip-item", "place-tab", "stg", "fl-row", "rail-item", "chat"]) expect(found).toContain(name);
  });
});

describe("S1 (FR-1): every mark is painted through the shared layer, which sets no transition", () => {
  it("one layer, written once: .sl and its ::before, and .sl-shadow for a control whose ::before is taken", () => {
    const named = (sel: string, prop: string) => RULES.filter((r) => r.sels.includes(sel) && r.decls.has(prop));
    const [host] = named(`.${LAYER}`, "position"), [layer] = named(`.${LAYER}::before`, "content"), [shadow] = named(`.${LAYER_SHADOW}`, "box-shadow");
    expect(RULES.filter((r) => r.sels.includes(`.${LAYER}::before`))).toHaveLength(1);
    expect(host.decls.get("position")).toBe("relative");
    expect(host.decls.get("z-index")).toBe("0");
    expect(layer.decls.get("content")).toBe('""');
    expect(layer.decls.get("position")).toBe("absolute");
    expect(layer.decls.get("inset")).toBe("0");
    expect(layer.decls.get("z-index")).toBe("-1");
    expect(layer.decls.get("pointer-events")).toBe("none");
    expect(layer.decls.get("transition")).toBe("none");
    expect(layer.decls.get("background")).toMatch(/var\(--mark-fill/);
    expect(layer.decls.get("box-shadow")).toMatch(/var\(--mark-line/);
    expect(shadow.decls.get("box-shadow")).toMatch(/^inset .*var\(--mark-fill/);
    // Nothing else draws on the layer, so no control copies it.
    const others = RULES.filter((r) => r !== layer && r.parts.some((p) => { const s = p[p.length - 1]; return s.pe === "before" && s.classes.includes(LAYER); }));
    expect(others.map((r) => r.sels.join(", "))).toEqual([]);
    expect(RULES.filter((r) => r.decls.has("--mark-fill") && r.parts.some((p) => !onLayer(p))).map((r) => r.sels.join(", "))).toEqual([]);
  });

  it("the layer has no transition whatever the control's state", () => {
    const layer: Compound = { tag: null, classes: [LAYER], attrs: [], pseudos: [], nots: [], pe: "before" };
    for (const hover of [false, true]) for (const w of winners({ parts: [layer], hover }, "transition")) expect(w.v).toBe("none");
  });

  it.each(marks.map((m) => [label(m), m] as const))("%s: nothing it paints on the element itself is transitioned, marked or not, hovered or not", (_l, m) => {
    for (const p of paints(m)) {
      if (FILL.includes(p) && restates(m, p)) continue;
      for (const t of fourWays(m)) for (const w of winners(t, "transition")) {
        expect.soft(transitions(w.v, p), `${p} eases on "${w.sel}" (${w.rule.file}): ${w.v}`).toBe(false);
      }
    }
  });

  it.each(controls.map((m) => [label(m), m] as const))("%s: a control's fill and line are the layer's (--mark-fill, --mark-line), never its own background or box-shadow", (_l, m) => {
    const own = [...FILL, ...LINE].filter((p) => m.rule.decls.has(p) && !restates(m, p));
    expect(own, `paint ${own.join(", ")} through --mark-fill / --mark-line on .${LAYER}`).toEqual([]);
    if (sets(m, "--mark-")) expect(onLayer(m.parts), "the mark rule names the layer's class, so it reaches only a control that has the layer").toBe(true);
  });

  it.each(controls.filter((m) => /rgba\(/.test(tokenOf(m.rule.decls.get("--mark-fill")))).map((m) => [label(m), m] as const))(
    "%s: a see-through fill does not change on hover (R49 amended)", (_l, m) => {
      const at = (hover: boolean) => FILL.map((p) => winners(hovered(m.parts, hover), p).map((w) => w.v).join("|")).join(";");
      expect(at(true)).toBe(at(false));
    });
});

describe("S2 (FR-2): hover eases on every control, in and out, and no transition: none list remains", () => {
  it("hover is 100 ms", () => {
    expect(read("tokens.css")).toMatch(/--dur-fast:\s*100ms/);
    for (const host of [LAYER, LAYER_SHADOW]) expect(RULES.find((r) => r.sels.includes(`.${host}`) && r.decls.has("transition"))?.decls.get("transition")).toBe(EASE);
  });

  it.each(controls.map((m) => [label(m), m] as const))("%s: background-color eases 100 ms on --ease-out, marked or not, hovered or not", (_l, m) => {
    expect(m.rule.decls.has("transition"), "the mark rule sets no transition of its own").toBe(false);
    for (const t of fourWays(m)) {
      const w = winners(t, "transition");
      expect(w.map((x) => `${x.sel} (${x.rule.file}): ${x.v}`), JSON.stringify(t.hover)).toEqual(w.map((x) => `${x.sel} (${x.rule.file}): ${EASE}`));
      expect(w.length).toBeGreaterThan(0);
    }
  });

  it("no rule sets transition: none on a marked control or its hover (lf51's list is gone)", () => {
    const offenders = RULES.filter((r) => r.decls.get("transition") === "none" && r.parts.some((p) =>
      controls.some((m) => [false, true].some((hover) => reaches(p, hovered(m.plain, hover)) || reaches(p, hovered(m.parts, hover))))));
    expect(offenders.map((r) => `${r.file}: ${r.sels.join(", ")}`)).toEqual([]);
  });
});

/** A --mark-fill value with its token resolved, so a see-through fill shows as rgba. */
function tokenOf(v: string | undefined): string {
  if (!v) return "";
  const tokens = read("tokens.css");
  let out = v;
  for (let i = 0; i < 6; i++) {
    const m = /var\((--[\w-]+)\)/.exec(out); if (!m) break;
    const d = new RegExp(`${m[1]}:\\s*([^;]+);`).exec(tokens); if (!d) break;
    out = out.replace(m[0], d[1].trim());
  }
  return out;
}
