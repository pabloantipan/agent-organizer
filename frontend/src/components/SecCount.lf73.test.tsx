import { describe, expect, it } from "vitest";
import { foldLabel } from "../lib/folds";

// leftovers-73 V2 (FR-3; run-report Amendment 9, AR38; design system, "A
// count after a title": never `(N)`): in every non-test file under
// components/, no `(` stands directly before a count span or a `.length}` in
// a title. Charter's `({pos.current + 1} of {stages.length})` is a position,
// not a count, and the scan allows it by its shape (`N of M`).
const fs: { readFileSync(p: string, enc: "utf8"): string; readdirSync(p: string): string[] } = await import("node:" + "fs");
const PAREN = /\((?:<span className="[^"]*\b(?:num|sec-count)\b[^"]*">)?\{[^{}]*\.length\}\)|\(<span className="[^"]*\b(?:num|sec-count)\b[^"]*">/g;
const POSITION = /^\(\{[^{}]*\} of \{[^{}]*\.length\}\)/;
function parenCounts(name: string, src: string): string[] {
  const hits: string[] = [];
  for (const m of src.matchAll(PAREN)) {
    if (POSITION.test(src.slice(m.index!))) continue;
    hits.push(`${name}:${src.slice(0, m.index!).split("\n").length}`);
  }
  return hits;
}

describe("leftovers-73 V2 (FR-3): no `(N)` count in components/", () => {
  it("the scan catches each `(N)` form and allows a position", () => {
    expect(parenCounts("x", `<span>Asleep ({asleepIds.length})</span>`)).toEqual(["x:1"]);
    expect(parenCounts("x", `<span className="rv-gcount">({g.rows.length})</span>`)).toEqual(["x:1"]);
    expect(parenCounts("x", `Needs me (<span className="num sec-count">{n}</span>)`)).toEqual(["x:1"]);
    expect(parenCounts("x", `<span className="num">({pos.current + 1} of {stages.length})</span>`)).toEqual([]);
    expect(parenCounts("x", `<SecCount title="Asleep" n={asleepIds.length} />`)).toEqual([]);
  });
  it("finds none in any non-test file", () => {
    const dir = new URL("./", import.meta.url).pathname;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && !f.includes(".test.")).sort();
    expect(files.length).toBeGreaterThan(20);
    expect(files.flatMap((f) => parenCounts(f, fs.readFileSync(dir + f, "utf8")))).toEqual([]);
  });
});

// Amendment 1: the collapsed rail's float list labels its folds by
// `foldLabel` (lib/folds.ts), a string, not markup; it reads `<word> · n` too.
describe("leftovers-73 V2 (FR-3, Amendment 1): foldLabel reads <word> · n", () => {
  it("Asleep · 3, Archived · 1, and the word alone while filtering", () => {
    expect(foldLabel("asleep", 3)).toBe("Asleep · 3");
    expect(foldLabel("archived", 1)).toBe("Archived · 1");
    expect(foldLabel("asleep", 0)).toBe("Asleep · 0");
    expect(foldLabel("archived")).toBe("Archived");
  });
});
