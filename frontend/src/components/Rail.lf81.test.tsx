import { describe, expect, it } from "vitest";

// leftovers-81 FR-2, row V2 (run-report A15, AR52): the group head's items
// sit at its top, so its tools stay by the first line of a field three lines
// high. The geometry itself is the UI row AR52.
const fs: { readFileSync(p: string, enc: "utf8"): string } = await import("node:" + "fs");
const css = fs.readFileSync(new URL("../styles/global.css", import.meta.url).pathname, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("leftovers-81 V2 (FR-2, AR52): the group head aligns its items to the top", () => {
  it(".rail-group-head: align-items: flex-start", () => {
    const rule = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].find(([, sel]) => sel.trim() === ".rail-group-head");
    expect(rule).toBeDefined();
    expect(rule![2]).toMatch(/align-items\s*:\s*flex-start\s*;/);
    expect(rule![2]).not.toMatch(/align-items\s*:\s*center/);
  });
});
