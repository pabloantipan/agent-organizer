// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// R3 (leftovers-35 FR-2, launch-progress L29, the design system's Derived
// tokens): every --busy-* token is a twin of a role at the busy alpha,
// written as rgba because Safari 15 has no color-mix. Its comment names the
// role; this reads tokens.css, resolves the role to rgb, and fails when the
// twin's rgb is not the role's, or its alpha is not the role's at 45%. Vitest
// blanks CSS imports, so the stylesheet is read from disk.

/** What is inside a pressed control is drawn at 45% (launch-progress A8). */
const BUSY = 0.45;

type Rgba = [number, number, number, number];

/** The custom properties of the sheet, by name, with the comment on each line. */
function props(css: string): Map<string, { value: string; note: string }> {
  const out = new Map<string, { value: string; note: string }>();
  for (const m of css.matchAll(/(--[\w-]+)\s*:\s*([^;{}]+);[ \t]*(?:\/\*([^*]*)\*\/)?/g)) out.set(m[1], { value: m[2].trim(), note: (m[3] ?? "").trim() });
  return out;
}

function rgba(v: string): Rgba | null {
  const hex = v.match(/^#([0-9a-f]{6})$/i)?.[1];
  if (hex) return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).concat(1) as Rgba;
  const fn = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/);
  return fn ? [+fn[1], +fn[2], +fn[3], fn[4] === undefined ? 1 : +fn[4]] : null;
}

function resolve(p: ReturnType<typeof props>, name: string, seen: string[] = []): Rgba | null {
  const v = p.get(name)?.value;
  if (!v || seen.includes(name)) return null;
  const ref = v.match(/^var\((--[\w-]+)\)$/)?.[1];
  return ref ? resolve(p, ref, [...seen, name]) : rgba(v);
}

/** Every busy twin that does not follow its source: why, one line each. */
function busyDrift(css: string): string[] {
  const p = props(css);
  const bad: string[] = [];
  const twins = [...p.keys()].filter((k) => k.startsWith("--busy-"));
  if (twins.length === 0) bad.push("no --busy-* token");
  for (const t of twins) {
    const src = p.get(t)!.note.match(/^(--[\w-]+)$/)?.[1];
    if (!src) { bad.push(`${t}: no source comment`); continue; }
    const s = resolve(p, src);
    const w = rgba(p.get(t)!.value);
    if (!s || !w) { bad.push(`${t}: ${src} or the twin does not resolve to a colour`); continue; }
    if (s.slice(0, 3).join() !== w.slice(0, 3).join()) bad.push(`${t}: rgb ${w.slice(0, 3).join(",")} is not ${src}'s ${s.slice(0, 3).join(",")}`);
    if (Math.abs(w[3] - s[3] * BUSY) > 0.001) bad.push(`${t}: alpha ${w[3]} is not ${src}'s ${s[3]} at ${BUSY}`);
  }
  return bad;
}

const css: string = readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8");

describe("R3: every busy twin follows its source role (leftovers-35 FR-2)", () => {
  it("names its source in a comment and matches it at the busy alpha", () => {
    expect(busyDrift(css)).toEqual([]);
    expect([...props(css).keys()].filter((k) => k.startsWith("--busy-")).length).toBeGreaterThanOrEqual(8);
  });

  it("fails when --fg changes alone (a copy of the sheet, not the file)", () => {
    const changed = css.replace(/(\n\s*--fg:\s*)var\(--plum-12\);/, "$1#f4f1fa;");
    expect(changed).not.toBe(css);
    expect(busyDrift(changed)).toEqual(["--busy-fg: rgb 238,235,244 is not --fg's 244,241,250"]);
  });

  it("fails when a twin loses its source comment", () => {
    expect(busyDrift(css.replace("/* --fg-on-accent */", ""))).toEqual(["--busy-fg-on-accent: no source comment"]);
  });
});
