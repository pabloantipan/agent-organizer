import { renderToStaticMarkup } from "react-dom/server";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

// leftovers-19 FR-1, FR-2, FR-3, FR-5, FR-6 (initiatives-view Amendment 4,
// I28-I32): Settings names itself, the rail's back link follows `placeOf`,
// and the bar's rules for Sync, the title and Needs me. No DOM library is a
// dependency, so Settings renders to markup; its config arrives in an
// effect, so the loaded state hands the first `useState(null)` a config.

let loaded: unknown = null;
vi.mock("react", async (orig) => {
  const react = await orig<typeof import("react")>();
  let first = true;
  const useState = ((init: unknown) => {
    if (init === null && first && loaded) { first = false; return react.useState(loaded); }
    return react.useState(init);
  }) as typeof react.useState;
  return { ...react, default: react, useState, __reset: () => { first = true; } };
});
const state: Record<string, unknown> = {};
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign(() => state, { getState: () => state });
  return { useBoard };
});
vi.mock("../hooks/useWails", () => ({ api: { getConfig: () => new Promise(() => undefined), configPath: () => new Promise(() => undefined), getLock: () => new Promise(() => undefined) } }));

const react = (await import("react")) as unknown as { __reset: () => void };
const { Settings } = await import("./Settings");
const { heroBack, pressHero } = await import("./Rail");

const css = (p: string) => readFileSync(new URL(p, import.meta.url), "utf8") as string;
const global = css("../styles/global.css");
const shell = css("../styles/shell.css");
/** The declarations of the rule whose selector is exactly `sel`. */
const rule = (text: string, sel: string) => {
  const m = text.match(new RegExp(`(?:^|\\n|\\})\\s*${sel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\{([^}]*)\\}`));
  return m ? m[1] : null;
};

beforeEach(() => {
  for (const k of Object.keys(state)) delete state[k];
  Object.assign(state, { refresh: () => undefined, account: null, authMode: "off", setAccount: () => undefined, setOfflineChoice: () => undefined, lock: null, setLock: () => undefined });
  loaded = null;
  react.__reset();
});

const firstHeading = (html: string) => html.match(/<h([1-6])[^>]*>([^<]*)<\/h\1>/);

describe("Settings names itself (L1, I28)", () => {
  it("starts its body with an h1 Settings while it loads", () => {
    const html = renderToStaticMarkup(<Settings />);
    expect(html).toMatch(/^<div class="settings"><h1 class="settings-title">Settings<\/h1>/);
  });

  for (const authMode of ["off", "firebase"]) {
    it(`starts with the h1 above ${authMode === "off" ? "Identity" : "Account"} once loaded (auth ${authMode})`, () => {
      state.authMode = authMode;
      loaded = { roots: [], ignore_dirs: [] };
      const html = renderToStaticMarkup(<Settings />);
      const h = firstHeading(html)!;
      expect([h[1], h[2]]).toEqual(["1", "Settings"]);
      expect(html).toMatch(/^<div class="settings"><h1 class="settings-title">Settings<\/h1><div class="settings-block"><div class="section-label">/);
      expect(html.indexOf("Settings</h1>")).toBeLessThan(html.indexOf(authMode === "off" ? ">Identity<" : ">Account<"));
      expect(html.match(/<h1/g)).toHaveLength(1);
    });
  }

  it("draws the h1 at the page-title size", () => {
    expect(rule(global, ".settings .settings-title")).toMatch(/font-size: var\(--font-size-2xl\);[^]*font-weight: var\(--weight-semibold\);[^]*color: var\(--fg\)/);
  });
});

describe("the rail's back link follows placeOf (L2, I29)", () => {
  it("reads ← Initiatives on an initiative, whichever door opened it", () => {
    expect(heroBack("initiative", "init-a")).toBe(true);
    for (const screen of ["home", "initiatives", "usage", "settings"] as const) expect(heroBack(screen, null), screen).toBe(false);
    expect(heroBack("initiative", null)).toBe(false);
  });

  it("opens Initiatives on the initiative's card; elsewhere the hero is Home", () => {
    const to = { openInitiatives: vi.fn(), setSelectedInitiative: vi.fn() };
    pressHero(true, "init-a", to);
    expect(to.openInitiatives).toHaveBeenCalledWith("init-a");
    expect(to.setSelectedInitiative).not.toHaveBeenCalled();
    const home = { openInitiatives: vi.fn(), setSelectedInitiative: vi.fn() };
    pressHero(false, null, home);
    expect(home.setSelectedInitiative).toHaveBeenCalledWith(null);
    expect(home.openInitiatives).not.toHaveBeenCalled();
  });

  it("says Initiatives in the markup, not Home", () => {
    const src = css("./Rail.tsx");
    // leftovers-20 FR-3 made it a button of its own (Rail.hero.test.tsx).
    expect(src).toMatch(/className="hero-back"[^>]*aria-label="Back to Initiatives"[^>]*>\s*<ArrowLeft size=\{12\} aria-hidden="true" \/> Initiatives/);
    expect(src).not.toMatch(/<ArrowLeft size=\{12\}[^>]*\/> Home/);
  });
});

describe("the bar's rules (L3, L5, L6)", () => {
  it("colours stale in the magenta tone and gives Sync no fill of its own (L3)", () => {
    expect(rule(global, ".topbar .sync-stale")).toMatch(/color: var\(--tone\)/);
    expect(global).not.toMatch(/\.topbar[^{]*sync[^{]*\{[^}]*background/);
  });

  it("marks the title by weight and ink, no underline (L5, I32)", () => {
    const b = rule(shell, ".crumbs b")!;
    expect(b).toMatch(/color: var\(--fg\)/);
    expect(b).toMatch(/font-weight: var\(--weight-semibold\)/);
    expect(b).toMatch(/text-decoration: none/);
    expect(b).not.toMatch(/box-shadow|border-bottom/);
    // The tabs it stands against: --fg-muted at the button's 500.
    expect(rule(shell, ".places .place-tab")).toMatch(/color: var\(--fg-muted\)/);
    expect(global).toMatch(/\nbutton \{[^}]*font-weight: var\(--weight-medium\)/);
  });

  it("has no selected rule for Needs me (L6)", () => {
    // Spelled apart so the row's own grep over frontend/src stays empty.
    const dead = ["needs-me", "on"].join(".");
    expect(shell).not.toContain(dead);
    expect(global).not.toContain(dead);
  });
});
