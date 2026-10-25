import { describe, expect, it } from "vitest";
import {
  EASE, FILL, LAYER, LAYER_SHADOW, LINE, MARKS, borderColor, borderWidth, dead, PAINT, RULES, SHEETS, isControl, mediaOn, onLayer, px, read, reaches, transitions, unclassified, winnerOf, winners,
  type Compound, type Mark, type Target,
} from "./stateLayer.kit";

// leftovers-52 S1 and S2 (FR-1 to FR-3; review-view A16, A17, R43 amended,
// R50): every state mark is painted on one shared layer with no transition,
// and hover eases on every control. The marked selectors are not listed
// here: MARKS is every selector, in every stylesheet but review.css, with a
// compound carrying .active, .on, .current, .selected, .open,
// [aria-current], [aria-selected], [aria-pressed="true"] or
// [aria-expanded="true"] (quoted or not, and inside :is() or :where()), so a
// control added later is checked by the same rules without editing this
// file. The premise's own grep is run over the same sheets as a check on
// that reading: a match the parser did not classify fails.
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
/** The controls on .sl's ::before (the rule box's radio is on .sl-shadow, an inset shadow inside its own border, so FR-1b's edge does not apply to it). */
const layered = controls.filter((m) => m.parts[m.parts.length - 1].classes.includes(LAYER));

describe("FR-3: the test finds the marked selectors itself", () => {
  it("reads every stylesheet but review.css", () => {
    expect(SHEETS).not.toContain("review.css");
    expect(SHEETS.length).toBeGreaterThan(15);
    expect(new Set(MARKS.map((m) => m.file)).size).toBeGreaterThanOrEqual(10);
  });
  it("classifies every selector the premise's grep matches, so a spelling it does not foresee fails", () => {
    expect(unclassified()).toEqual([]);
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

  it("the layer reaches the border box: inset and width from --mark-edge, the border colour from --mark-rim (FR-1b, R52)", () => {
    const [layer] = RULES.filter((r) => r.sels.includes(`.${LAYER}::before`));
    expect(layer.decls.get("inset")).toMatch(/^calc\(-1 \* var\(--mark-edge, 0px\)\)$/);
    expect(layer.decls.get("border")).toMatch(/^var\(--mark-edge, 0px\) solid var\(--mark-rim\)$/);
    expect(RULES.find((r) => r.sels.includes(`.${LAYER}`) && r.decls.has("--mark-rim"))?.decls.get("--mark-rim")).toBe("transparent");
  });

  it("every custom property the layer's calc() reads is a length with a unit wherever it is set, and so is its fallback (U4)", () => {
    // calc(-1 * 0) is a number, not a length: inset is then invalid at computed-value time, falls back to auto, and the layer lays out 0x0.
    const [layer] = RULES.filter((r) => r.sels.includes(`.${LAYER}::before`));
    const calcs = [...layer.decls.values()].flatMap((v) => v.match(/calc\((?:[^()]|\([^()]*\))*\)/g) ?? []);
    expect(calcs.length).toBeGreaterThan(0);
    const refs = calcs.flatMap((c) => [...c.matchAll(/var\((--[\w-]+)(?:,\s*([^()]*))?\)/g)]);
    expect(refs.length).toBeGreaterThan(0);
    const LENGTH = /^-?\d+(\.\d+)?(px|rem|em)$/;
    const bad: string[] = [];
    for (const [ref, name, fallback] of refs) {
      if (fallback !== undefined && !LENGTH.test(fallback.trim())) bad.push(`fallback of ${ref}`);
      for (const r of RULES) if (r.decls.has(name) && !LENGTH.test(r.decls.get(name)!)) bad.push(`${r.file}: ${r.sels.join(", ")} { ${name}: ${r.decls.get(name)} }`);
    }
    expect(bad).toEqual([]);
  });

  it.each(layered.map((m) => [label(m), m] as const))("%s: a bordered control's layer covers its border box, marked or not, hovered or not (FR-1b)", (_l, m) => {
    for (const t of fourWays(m)) {
      const edge = winnerOf(t, ["--mark-edge"]);
      expect(px(edge?.v), `--mark-edge on "${edge?.sel ?? "nothing"}" for a ${borderWidth(t)}px border (${JSON.stringify(t.hover)})`).toBe(borderWidth(t));
    }
  });

  it.each(layered.filter((m) => fillOf(m) !== null).map((m) => [label(m), m] as const))("%s: an opaque fill keeps the control's border drawn over it, a see-through one leaves it under (FR-1b)", (_l, m) => {
    const t = hovered(m.parts, false), rim = winnerOf(t, ["--mark-rim"])?.v;
    if (fillOf(m) === "opaque" && borderWidth(t) > 0) expect(rim, "--mark-rim restates the marked border colour").toBe(borderColor(t));
    else expect(rim).toBe("transparent");
  });

  it("the critical memory chip's open ring is 2px outside its border, as on main (FR-1c, R52)", () => {
    const rings = controls.filter((m) => /^0 0 0 /.test(m.rule.decls.get("--mark-line") ?? ""));
    expect(rings.map(label).join("\n")).toContain("memory-btn.sl.critical");
    for (const m of rings) {
      expect(m.rule.decls.get("--mark-line")).toMatch(/^0 0 0 2px /);
      const t = hovered(m.parts, false);
      expect(borderWidth(t)).toBe(1);
      expect(px(winnerOf(t, ["--mark-edge"])?.v), "the ring spreads from the layer, which sits on the border's outer edge").toBe(1);
    }
  });

  it.each(controls.filter((m) => fillOf(m) === "opaque").map((m) => [label(m), m] as const))("%s: hover changes nothing on an opaque mark (FR-1d, R52)", (_l, m) => {
    const at = (hover: boolean) => { const t = hovered(m.parts, hover); return [winnerOf(t, FILL)?.v, winnerOf(t, ["color"])?.v, winnerOf(t, ["--mark-rim"])?.v].join(" | "); };
    expect(at(true)).toBe(at(false));
  });
});

describe("S2 (FR-2): hover eases on every control, in and out, and no transition: none list remains", () => {
  it("hover is 100 ms", () => {
    expect(read("tokens.css")).toMatch(/--dur-fast:\s*100ms/);
    for (const host of [LAYER, LAYER_SHADOW]) expect(RULES.find((r) => r.sels.includes(`.${host}`) && r.decls.has("transition"))?.decls.get("transition")).toBe(EASE);
  });

  it("the hover transition lists background-color and not color: ink switches at once, hover and mark alike (Amendment 2, FR-2a withdrawn)", () => {
    for (const host of [LAYER, LAYER_SHADOW]) {
      const v = RULES.find((r) => r.sels.includes(`.${host}`) && r.decls.has("transition"))?.decls.get("transition") ?? "";
      expect({ background: transitions(v, "background-color"), color: transitions(v, "color") }, `.${host}: ${v}`).toEqual({ background: true, color: false });
    }
  });

  it("under reduced motion one global guard sets every transition to none, hover included, and no control has its own (FR-1a, R51)", () => {
    const guards = RULES.filter((r) => /prefers-reduced-motion:\s*reduce/.test(r.media ?? "") && r.decls.has("transition"));
    expect(guards.map((r) => `${r.file}: ${r.sels.join(", ")}`)).toEqual(["global.css: *, *::before, *::after"]);
    expect(guards[0].decls.get("transition")).toBe("none");
    expect(read("global.css").replace(/\/\*[^]*?\*\//g, "")).toMatch(/@media \(prefers-reduced-motion: reduce\) \{\s*\*, \*::before, \*::after \{ transition: none !important; \}/);
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
    // The reduced-motion guard is FR-1a's, checked above; this is the window at rest.
    const offenders = RULES.filter((r) => mediaOn(r.media) && r.decls.get("transition") === "none" && r.parts.some((p) =>
      controls.some((m) => [false, true].some((hover) => reaches(p, hovered(m.plain, hover)) || reaches(p, hovered(m.parts, hover))))));
    expect(offenders.map((r) => `${r.file}: ${r.sels.join(", ")}`)).toEqual([]);
  });
});

/** Whether a mark paints a fill, and whether that fill lets what is under it show. */
function fillOf(m: Mark): "opaque" | "see-through" | null {
  const v = tokenOf(m.rule.decls.get("--mark-fill"));
  if (!v || v === "transparent") return null;
  return /rgba\(/.test(v) ? "see-through" : "opaque";
}

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
