import { describe, expect, it } from "vitest";
// node:fs has no types in this project (no @types/node), as stuckHead.test.ts.
// @ts-ignore
import { readFileSync } from "node:fs";

// Memory pressure in amber (docs/ux/specs/ram-indicator.md Amendment 2,
// 0109, card ram-ring-amber R3): the top bar's high text and critical chip,
// the popover's pressure line and the floating icon panel's memory line take
// --warning (--amber-9), the chip's text --fg-on-warning, never the tone.
// Read from the stylesheets themselves, tokens resolved, contrast computed
// by WCAG 2 relative luminance and logged.

const css = (name: string): string => readFileSync(new URL(`../styles/${name}`, import.meta.url), "utf8");
const uncomment = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const tokens = uncomment(css("tokens.css"));
const memory = uncomment(css("memory.css"));

const defs = new Map<string, string>();
for (const m of tokens.matchAll(/(--[\w-]+):\s*([^;]+);/g)) if (!defs.has(m[1])) defs.set(m[1], m[2].trim());

/** A token's value with var() followed to the hex it ends at. */
function resolve(v: string): string {
  for (let i = 0; i < 10; i++) {
    const m = /^var\((--[\w-]+)\)$/.exec(v.trim());
    if (!m) return v.trim().toLowerCase();
    const next = defs.get(m[1]);
    if (next === undefined) throw new Error(`no token ${m[1]}`);
    v = next;
  }
  throw new Error(`token loop at ${v}`);
}

/** The declarations of the one rule whose selector is exactly `sel`. */
function rule(sel: string): Record<string, string> {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = new RegExp(`(?:^|\\n|\\})\\s*${esc}\\s*\\{([^}]*)\\}`).exec(memory);
  if (!m) throw new Error(`no rule ${sel}`);
  const out: Record<string, string> = {};
  for (const d of m[1].split(";")) {
    const i = d.indexOf(":");
    if (i > 0) out[d.slice(0, i).trim()] = d.slice(i + 1).trim();
  }
  return out;
}

function luminance(hex: string): number {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const AMBER = "#ffb020";

describe("memory pressure is amber (Amendment 2)", () => {
  it("--warning is --amber-9 and --fg-on-warning is the ground's ink", () => {
    expect(resolve("var(--warning)")).toBe(AMBER);
    expect(resolve("var(--fg-on-warning)")).toBe("#1a1523");
  });

  const cases: { what: string; sel: string; fg: string; bg?: string; on: string }[] = [
    { what: "top bar, high text", sel: ".memory button.memory-btn.high", fg: "color", on: "var(--bg)" },
    { what: "top bar, critical chip", sel: ".memory button.memory-btn.critical", fg: "color", bg: "background", on: "" },
    { what: "top bar, critical chip on hover", sel: ".memory button.memory-btn.critical:hover", fg: "color", bg: "background", on: "" },
    { what: "popover, pressure line", sel: ".memory-pressure.high, .memory-pressure.critical", fg: "color", on: "var(--surface-overlay)" },
    { what: "float list, memory line at high", sel: ".fl-memory-line", fg: "color", on: "var(--surface-overlay)" },
    { what: "float list, memory line at critical", sel: ".fl-memory-line.critical", fg: "color", bg: "background", on: "" },
  ];

  for (const c of cases) {
    it(`${c.what}: amber, contrast >= 4.5:1`, () => {
      const r = rule(c.sel);
      const fg = resolve(r[c.fg]);
      const bg = resolve(c.bg ? r[c.bg] : c.on);
      if (c.bg) {
        expect(bg, `${c.sel} fill`).toBe(AMBER);
        expect(r[c.fg]).toBe("var(--fg-on-warning)");
      } else {
        expect(fg, `${c.sel} text`).toBe(AMBER);
      }
      const ratio = contrast(fg, bg);
      console.log(`R3 contrast: ${c.what}: ${fg} on ${bg} = ${ratio.toFixed(2)}:1`);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  }

  it("no memory rule draws in the tone any more", () => {
    expect(memory).not.toMatch(/var\(--tone\)|var\(--fg-on-tone\)/);
  });
});
