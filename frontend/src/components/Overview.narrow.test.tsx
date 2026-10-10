import { describe, expect, it } from "vitest";
import { OV_STACK_BELOW, ovStacks } from "./Overview";

// The stylesheets as text: vitest blanks css imports, `?raw` included, and
// the app's tsconfig has no node types, so fs comes in untyped.
const fs: { readFileSync(p: URL, enc: "utf8"): string } = await import("node:" + "fs");
const css = (name: string) => fs.readFileSync(new URL(`../styles/${name}`, import.meta.url), "utf8");
const overviewCss = css("overview.css");
const helpCss = css("help.css");
const globalCss = css("global.css");

// leftovers-18 FR-8 (I27): Overview's columns follow its own pane, not the window.
describe("Overview stacks by its pane (leftovers-18 FR-8)", () => {
  it("stacks the FSE column under 880 px of pane and not from it", () => {
    expect(OV_STACK_BELOW).toBe(880);
    expect(ovStacks(780)).toBe(true); // 1024 with the rail open
    expect(ovStacks(879)).toBe(true);
    expect(ovStacks(880)).toBe(false);
    expect(ovStacks(1240)).toBe(false); // 1440, capped
  });

  it("does not stack before the pane is laid out", () => {
    expect(ovStacks(0)).toBe(false);
  });

  it("keeps no window media query for the columns", () => {
    const s = overviewCss;
    expect(s).not.toMatch(/@media/);
    expect(s).toMatch(/\.ov\.stacked\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);\s*\}/);
  });
});

// leftovers-18 FR-9 (I27): Help's body holds a measure and breaks long words;
// tables and code keep theirs and scroll in their own box.
describe("Help's body at 1024 (leftovers-18 FR-9)", () => {
  const s = helpCss;
  it("holds the body to min(72ch, 100%) and breaks anywhere", () => {
    expect(s).toMatch(/\.help-doc > \* \{ max-width: min\(72ch, 100%\); \}/);
    expect(s).toMatch(/\.help-doc \{[^}]*overflow-wrap: anywhere;/);
    expect(s).not.toMatch(/max-width: 760px/);
  });
  it("does not inherit the top bar's nowrap, since Help mounts inside it", () => {
    expect(s).toMatch(/\.help \{[^}]*white-space: normal;/);
  });
  it("lets tables and code scroll in their own box with whole words", () => {
    expect(s).toMatch(/\.help-doc :where\(pre, table\) \{ overflow-wrap: normal; \}/);
    expect(s).toMatch(/\.help-doc pre \{[^}]*overflow-x: auto;/);
    expect(globalCss).toMatch(/\.markdown :where\(pre, table\) \{ overflow-x: auto; max-width: 100%; \}/);
  });
});
