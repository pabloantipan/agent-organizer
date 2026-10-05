import { describe, expect, it } from "vitest";
import { holdTall, stickNow, type HeldTall } from "./stuckHead";
// The stylesheet's text: vitest turns a CSS import into an empty module, ?raw
// included, so it is read from disk. No @types/node here, hence the ignore.
// @ts-ignore
import { readFileSync } from "node:fs";

const css: string = readFileSync(new URL("../styles/decisions.css", import.meta.url), "utf8");

// decisions-still FR-2: DecisionsView sets .stuck from the expanded record's
// height, so a .stuck rule that changes a size feeds back into that measure
// and the head flips every frame. The rule box (.rb) is absolutely placed
// and takes no room in the record, so its placement is exempt.
const SIZING = /^(border(-(top|bottom|left|right))?(-width)?|border-(block|inline)(-(start|end))?(-width)?|padding(-\w+)?|margin(-\w+)?|(min-|max-)?(height|width)|inset|top|bottom|font(-size)?|line-height|display|box-sizing|gap|row-gap|flex(-\w+)?|grid(-\w+)?)$/;

function stuckRules(text: string): { selector: string; props: string[] }[] {
  const out: { selector: string; props: string[] }[] = [];
  const bare = text.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const m of bare.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selector = m[1].trim();
    if (!selector.includes(".dec-head.stuck")) continue;
    const props = m[2].split(";").map((d) => d.split(":")[0].trim()).filter(Boolean);
    out.push({ selector, props });
  }
  return out;
}

describe(".dec-head.stuck changes paint, never a size", () => {
  const rules = stuckRules(css);

  it("finds the stuck head's rules", () => {
    expect(rules.map((r) => r.selector)).toContain(".dec-head.stuck");
  });

  it("sets no sizing property outside the rule box", () => {
    const sizing = rules
      .filter((r) => !/\.rb\b/.test(r.selector))
      .flatMap((r) => r.props.filter((p) => SIZING.test(p) && !(r.selector === ".dec-head.stuck" && p === "top")).map((p) => `${r.selector} { ${p} }`));
    expect(sizing).toEqual([]);
  });

  it("flags a border or a padding that would shrink the record", () => {
    const bad = stuckRules(".dec-head.stuck { border-bottom: 1px solid red; } .dec-head.stuck .dec-actions { padding: 0; }");
    expect(bad.flatMap((r) => r.props.filter((p) => SIZING.test(p)))).toEqual(["border-bottom", "padding"]);
  });
});

// §8 as amended (dst-ui F1, A2): tallness is decided before ruling and held
// while the box is open. 0085 at 1245x868-879: 673 px reading, 661 ruling.
describe("a stuck head stays stuck while ruling", () => {
  const key = "orgcopy/0085";
  // One record's life: read (tall), Rule opens (the facts make it short), box closes.
  const walk = (steps: { measured: boolean; ruling: boolean }[]) => {
    let held: HeldTall | null = null;
    return steps.map(({ measured, ruling }) => {
      const stick = stickNow(key, measured, ruling, held);
      held = holdTall(key, measured, ruling, held);
      return stick;
    });
  };

  it("holds the reading answer when the ruling layout is shorter than the room", () => {
    expect(walk([{ measured: true, ruling: false }, { measured: false, ruling: true }, { measured: false, ruling: true }])).toEqual([true, true, true]);
  });

  it("measures again once the box closes", () => {
    expect(walk([{ measured: true, ruling: false }, { measured: false, ruling: true }, { measured: true, ruling: false }, { measured: false, ruling: false }])).toEqual([true, true, true, false]);
  });

  it("does not stick a short record that grows while ruling", () => {
    expect(walk([{ measured: false, ruling: false }, { measured: true, ruling: true }])).toEqual([false, false]);
  });

  it("ignores another record's answer", () => {
    expect(stickNow(key, false, true, { key: "orgcopy/0029", tall: true })).toBe(false);
    expect(holdTall(key, false, true, { key: "orgcopy/0029", tall: true })).toBeNull();
  });

  it("measures when there is nothing held", () => {
    expect(stickNow(key, true, true, null)).toBe(true);
  });
});

describe("the stuck head's bottom line is hard", () => {
  it("is a 1 px --border inset shadow with no blur and no spread", () => {
    const rule = stuckRules(css).find((r) => r.selector === ".dec-head.stuck");
    const decl = css.replace(/\/\*[\s\S]*?\*\//g, "").match(/\.dec-head\.stuck\s*\{([^}]*)\}/)![1];
    expect(rule).toBeDefined();
    expect(decl).toMatch(/box-shadow:\s*inset 0 -1px 0 var\(--border\)\s*;/);
  });
});
