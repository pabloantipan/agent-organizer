// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { heroBack, pressHero, RailHero } from "./Rail";

// The rail's hero (leftovers-20 R1, R2, leftovers-21 H1; initiatives-view
// I36, I39). RailHero has
// no hooks, so calling it returns its element tree: walking that tree shows
// which elements carry a press handler and what each one calls.
type El = ReactElement<{ className?: string; onClick?: () => void; children?: ReactNode; [k: string]: unknown }>;

const hero = { eyebrow: "acme", name: "init-a", now: 2, blocked: 1, next: 3 };

function walk(node: ReactNode, path: El[], out: { el: El; path: El[] }[]) {
  if (Array.isArray(node)) return node.forEach((n) => walk(n, path, out));
  if (!isValidElement(node)) return;
  const el = node as El;
  if (typeof el.type === "function") return walk((el.type as (p: unknown) => ReactNode)(el.props), path, out);
  out.push({ el, path });
  walk(el.props.children, [...path, el], out);
}

function tree(back: boolean, onPress = vi.fn()) {
  const out: { el: El; path: El[] }[] = [];
  walk(RailHero({ hero, back, onBack: onPress }), [], out);
  return { out, onPress };
}

const noRole = (e: El) => e.type === "div" && e.props.role === undefined && e.props["aria-label"] === undefined && e.props.title === undefined;

const pressable = (e: El) => e.type === "button" || typeof e.props.onClick === "function";

describe("the rail hero on an initiative (R1, R2)", () => {
  it("has one button, named Back to Initiatives, that opens Initiatives on this initiative", () => {
    const html = renderToStaticMarkup(<RailHero hero={hero} back onBack={() => undefined} />);
    const buttons = html.match(/<button[^>]*>/g) ?? [];
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toContain('aria-label="Back to Initiatives"');
    expect(buttons[0]).toContain('class="hero-back"');
    expect(html.indexOf("<button")).toBeLessThan(html.indexOf('class="eyebrow"'));

    const { out, onPress } = tree(true);
    const handlers = out.filter(({ el }) => pressable(el));
    expect(handlers).toHaveLength(1);
    handlers[0].el.props.onClick!();
    expect(onPress).toHaveBeenCalledTimes(1);

    expect(heroBack("initiative", "init-a")).toBe(true);
    const to = { openInitiatives: vi.fn() };
    pressHero("init-a", to);
    expect(to.openInitiatives).toHaveBeenCalledWith("init-a");
  });

  it("keeps the client, id and counts outside any button and without a handler", () => {
    const { out, onPress } = tree(true);
    const summary = out.filter(({ el }) => ["eyebrow", "name", "stats", "stat"].includes(el.props.className ?? ""));
    expect(summary.length).toBeGreaterThanOrEqual(6);
    for (const { el, path } of summary) {
      expect(pressable(el)).toBe(false);
      expect(path.some(pressable)).toBe(false);
    }
    expect(noRole(out[0].el)).toBe(true);
    expect(out[0].el.props.onClick).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("the rail hero on Home (H1, I39)", () => {
  it("is a summary with no button, no role, no title and no press; the Home tab is the way Home", () => {
    const html = renderToStaticMarkup(<RailHero hero={{ ...hero, eyebrow: "Working on", name: "Home" }} back={false} onBack={() => undefined} />);
    expect(html).not.toContain("<button");
    expect(html).not.toMatch(/role=|title=|tabindex=|aria-label=/);
    expect(html).toMatch(/^<div class="rail-hero"><div class="eyebrow">Working on<\/div><div class="name">Home<\/div>/);
    expect(html).not.toContain("Back to Initiatives");

    const { out, onPress } = tree(false);
    expect(noRole(out[0].el)).toBe(true);
    expect(out.filter(({ el }) => pressable(el))).toHaveLength(0);
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("the rail hero's styles (H3, I39)", () => {
  it("give the summary no pointer and no hover state; only the back button has one", () => {
    const css = readFileSync(new URL("../styles/global.css", import.meta.url), "utf8") as string;
    const rules = css.match(/[^{}]*\.rail-hero[^{}]*\{[^}]*\}/g) ?? [];
    expect(rules.length).toBeGreaterThan(0);
    for (const r of rules) {
      const sel = r.slice(0, r.indexOf("{")).trim();
      if (sel.includes("hero-back")) continue;
      expect(sel, sel).not.toContain(":hover");
      expect(r, sel).not.toMatch(/cursor:\s*pointer/);
    }
  });
});
