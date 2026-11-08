import { describe, expect, it } from "vitest";

// leftovers-80 FR-2, row V2 (run-report A14, AR50): the refusal line wraps as
// prose at 180 px and grows the group header, so the next header starts below
// its last line. Neither the rename wrapper nor the line may clip it or fix
// its height. The geometry itself is the UI row AR50.
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const css = fs.readFileSync(new URL("../styles/global.css", import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** Every rule whose selector list names `cls` as a whole class. */
const rulesOf = (cls: string) =>
  [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
    .filter(([, sel]) => sel.split(",").some((s) => new RegExp(`\\.${cls}(?![\\w-])`).test(s)))
    .map(([, sel, body]) => ({ sel: sel.trim(), body }));

describe("leftovers-80 V2 (FR-2, AR50): the refusal line wraps whole", () => {
  for (const cls of ["rail-rename", "rail-rename-line"]) {
    it(`.${cls}: no nowrap, no hidden overflow, no fixed height`, () => {
      const rules = rulesOf(cls);
      expect(rules.length).toBeGreaterThan(0);
      for (const { body } of rules) {
        expect(body).not.toMatch(/white-space\s*:\s*(nowrap|pre)\b/);
        expect(body).not.toMatch(/(^|[;\s])overflow(-[xy])?\s*:\s*(hidden|clip)/);
        expect(body).not.toMatch(/(^|[;\s])(max-)?height\s*:/);
        expect(body).not.toMatch(/text-overflow\s*:/);
      }
    });
  }

  it("the line wraps as prose at 180 px, a long name too", () => {
    const line = rulesOf("rail-rename-line").find((r) => r.sel === ".rail-rename-line")!.body;
    expect(line).toMatch(/max-width\s*:\s*180px/);
    expect(line).toMatch(/white-space\s*:\s*normal/);
    expect(line).toMatch(/overflow-wrap\s*:\s*break-word/);
  });

  it("the wrapper resets the title's white-space: pre for what it holds", () => {
    expect(rulesOf("rail-rename").find((r) => r.sel === ".rail-rename")!.body).toMatch(/white-space\s*:\s*normal/);
  });
});
