import { describe, expect, it } from "vitest";

// leftovers-82 FR-3, row V3 (run-report A16, AR55): the group head's
// chevron, name and ⋯ each sit in a 24 px line box (height or line-height)
// under a head that aligns its items to the top. The geometry itself is the
// UI row AR55.
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const read = (p: string) => fs.readFileSync(new URL(p, import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const css = read("../styles/global.css");
const tokens = read("../styles/tokens.css");

const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sels: sel.split(",").map((x) => x.trim().replace(/\s+/g, " ")), body }));
/** The declarations of every rule naming `selector` exactly, in order. */
const decls = (selector: string) => rules.filter((r) => r.sels.includes(selector)).map((r) => r.body).join(";");
/** A value in px, through one tier-2 token if it is one. */
const px = (v: string): number | null => {
  const t = /^var\((--[\w-]+)\)$/.exec(v.trim());
  if (t) {
    const m = new RegExp(`${t[1]}\\s*:\\s*([^;]+);`).exec(tokens);
    return m ? px(m[1]) : null;
  }
  const m = /^(\d+(?:\.\d+)?)px$/.exec(v.trim());
  return m ? Number(m[1]) : null;
};
/** The last value of `prop` among the declarations (the cascade's winner at equal specificity). */
const last = (body: string, prop: string) => {
  const all = [...body.matchAll(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`, "g"))];
  return all.length ? all[all.length - 1][1] : null;
};
const lineBox = (selector: string) => {
  const body = decls(selector);
  const h = last(body, "height");
  const lh = last(body, "line-height");
  return Math.max(h ? px(h) ?? 0 : 0, lh ? px(lh) ?? 0 : 0);
};

describe("leftovers-82 V3 (FR-3, AR55): the head's chevron, name and ⋯ in 24 px line boxes", () => {
  it("the head aligns its items to the top", () => {
    expect(decls(".rail-group-head")).toMatch(/align-items\s*:\s*flex-start/);
    expect(decls(".rail-group-head")).not.toMatch(/align-items\s*:\s*center/);
  });

  it("the chevron in a head: a 24 px box", () => {
    expect(lineBox(".rail-group-head > .rail-chevron")).toBe(24);
  });

  it("the name in a head: a 24 px line", () => {
    expect(lineBox(".rail-group-head .rail-group-name")).toBe(24);
  });

  it("the ⋯ tools in a head: a 24 px box", () => {
    expect(lineBox(".rail-group-head .rail-group-tools")).toBe(24);
  });
});
