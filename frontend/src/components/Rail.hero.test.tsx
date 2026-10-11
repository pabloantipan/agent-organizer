import { describe, expect, it, vi } from "vitest";
import { isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { heroBack, pressHero, RailHero } from "./Rail";

// The rail's hero (leftovers-20 R1, R2; initiatives-view I36). RailHero has
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
  walk(RailHero({ hero, back, active: !back, onPress }), [], out);
  return { out, onPress };
}

const pressable = (e: El) => e.type === "button" || typeof e.props.onClick === "function";

describe("the rail hero on an initiative (R1, R2)", () => {
  it("has one button, named Back to Initiatives, that opens Initiatives on this initiative", () => {
    const html = renderToStaticMarkup(<RailHero hero={hero} back active={false} onPress={() => undefined} />);
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

    const to = { openInitiatives: vi.fn(), setSelectedInitiative: vi.fn() };
    pressHero(heroBack("initiative", "init-a"), "init-a", to);
    expect(to.openInitiatives).toHaveBeenCalledWith("init-a");
    expect(to.setSelectedInitiative).not.toHaveBeenCalled();
  });

  it("keeps the client, id and counts outside any button and without a handler", () => {
    const { out, onPress } = tree(true);
    const summary = out.filter(({ el }) => ["eyebrow", "name", "stats", "stat"].includes(el.props.className ?? ""));
    expect(summary.length).toBeGreaterThanOrEqual(6);
    for (const { el, path } of summary) {
      expect(pressable(el)).toBe(false);
      expect(path.some(pressable)).toBe(false);
    }
    expect(out[0].el.type).toBe("section");
    expect(out[0].el.props.onClick).toBeUndefined();
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe("the rail hero on Home (R2)", () => {
  it("is one button that goes Home, with no back button", () => {
    const html = renderToStaticMarkup(<RailHero hero={{ ...hero, eyebrow: "Working on", name: "Home" }} back={false} active onPress={() => undefined} />);
    expect(html.match(/<button[^>]*>/g)).toHaveLength(1);
    expect(html).toMatch(/^<button class="rail-hero active" title="Home: what needs you, and every initiative">/);
    expect(html).not.toContain("Back to Initiatives");

    const { out, onPress } = tree(false);
    expect(out[0].el.type).toBe("button");
    out[0].el.props.onClick!();
    expect(onPress).toHaveBeenCalledTimes(1);

    const to = { openInitiatives: vi.fn(), setSelectedInitiative: vi.fn() };
    pressHero(heroBack("home", null), null, to);
    expect(to.setSelectedInitiative).toHaveBeenCalledWith(null);
    expect(to.openInitiatives).not.toHaveBeenCalled();
  });
});
