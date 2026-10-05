import { describe, expect, it } from "vitest";
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
