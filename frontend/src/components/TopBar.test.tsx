import { renderToStaticMarkup } from "react-dom/server";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";

// T1 (leftovers-17 FR-3, FR-4): the top bar by kind, over each screen and
// both auth modes. No DOM library is a dependency here, so the bar renders
// to markup with the store mocked; effects do not run, so Compact and Help
// open are proven on their own pieces (AppControls, Where).

const state: Record<string, unknown> = {};
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign(() => state, { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({ FloatAvailable: () => Promise.resolve(false), FloatCompact: () => Promise.resolve(), Help: () => Promise.resolve(null) }));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: { version: () => Promise.resolve("v1.2.3") } }));

const { TopBar, Where, AppControls } = await import("./TopBar");

const noop = () => undefined;
const view = { board: { machines: [{}, {}] }, pulled_at: "2026-10-01T00:00:00Z" };

function bar(over: Record<string, unknown> = {}) {
  Object.assign(state, {
    screen: "home", selectedInitiative: null, widthClass: "regular", view, loading: false, syncing: false,
    error: null, lastMessage: null, account: { signed_in: true, email: "p@x" }, lock: null, authMode: "off", syncNote: null,
    agents: null, memoryOpen: false,
    goHome: noop, openSettings: noop, openUsage: noop, openInitiatives: noop, refresh: noop, sync: noop,
    setAccount: noop, setLock: noop, setOfflineChoice: noop, setMemoryOpen: noop,
  }, over);
  return renderToStaticMarkup(<TopBar />);
}

/** The index of each marker in the markup, so order reads as numbers. */
const at = (html: string, ...marks: string[]) => marks.map((m) => {
  const i = html.indexOf(m);
  expect(i, `${m} in the bar`).toBeGreaterThanOrEqual(0);
  return i;
});
const ascending = (xs: number[]) => xs.every((x, i) => i === 0 || xs[i - 1] < x);
const current = (html: string) => [...html.matchAll(/<button[^>]*aria-current="page"[^>]*>([^<]*)<\/button>/g)].map((m) => m[1]);
/** Every element marked current, by its text or its aria-label. */
const marks = (html: string) => [...html.matchAll(/<(\w+)([^>]*)aria-current="page"([^>]*)>([^<]*)/g)].map((m) => (m[2] + m[3]).match(/aria-label="([^"]*)"/)?.[1] ?? m[4]);
const where = (screen: string, selectedInitiative: string | null = "organizer") =>
  renderToStaticMarkup(<Where screen={screen as never} selectedInitiative={selectedInitiative} go={() => noop} goHome={noop} openInitiatives={noop} openUsage={noop} />);

beforeEach(() => { for (const k of Object.keys(state)) delete state[k]; });

describe("the top bar by kind (leftovers-17 FR-3)", () => {
  it("reads brand · Places · crumb · memory, sync · Needs me, Rescan, Sync · Settings, left to right", () => {
    const html = bar({ authMode: "firebase", screen: "initiative", selectedInitiative: "organizer" });
    expect(ascending(at(html,
      'class="brand"', 'aria-label="Places"', ">Home<", ">Initiatives<", ">Usage<", 'class="crumbs"', ">organizer<",
      'class="tb-group tb-mac"', "memory-btn", "2 machines · remote",
      'class="tb-group tb-work"', 'class="needs-me', "Rescan<", "Sync<",
      'class="tb-group tb-app"', 'aria-label="Help"', 'aria-label="Settings"'))).toBe(true);
  });

  it("marks one current per screen; an initiative's title, with Initiatives its parent (K1, I22)", () => {
    expect(marks(bar({ screen: "home" }))).toEqual(["Home"]);
    expect(marks(bar({ screen: "initiatives" }))).toEqual(["Initiatives"]);
    expect(marks(bar({ screen: "usage" }))).toEqual(["Usage"]);
    // An initiative, whichever door opened it: the screen is the same.
    const init = bar({ screen: "initiative", selectedInitiative: "organizer" });
    expect(marks(init)).toEqual(["organizer"]);
    expect(init).toMatch(/<button type="button" class="place-tab parent"[^>]*>Initiatives<\/button>/);
    expect(init).not.toMatch(/aria-current="page"[^>]*>Initiatives</);
    expect(marks(bar({ screen: "settings" }))).toEqual(["Settings"]);
    expect(bar({ screen: "settings" })).toMatch(/class="ghost gear on"[^>]*aria-label="Settings" aria-current="page"/);
  });

  it("opens Help over a screen without taking its mark (L4, I31)", () => {
    for (const screen of ["home", "initiatives", "usage", "initiative", "settings"]) {
      const html = where(screen) + renderToStaticMarkup(<AppControls floats help settings={screen === "settings"} onCompact={noop} onHelp={noop} onSettings={noop} />);
      // `?` is expanded and selected, never current.
      expect(html, screen).toMatch(/<button class="ghost gear open"[^>]*aria-label="Help" aria-expanded="true">/);
      expect(html.match(/<button[^>]*aria-label="Help"[^>]*>/)![0]).not.toContain("aria-current");
      // The screen under it keeps its one mark.
      const under = { home: "Home", initiatives: "Initiatives", usage: "Usage", initiative: "organizer", settings: "Settings" }[screen];
      expect(marks(html), screen).toEqual([under]);
    }
    const closed = renderToStaticMarkup(<AppControls floats={false} help={false} settings={false} onCompact={noop} onHelp={noop} onSettings={noop} />);
    expect(closed).toMatch(/<button class="ghost gear "[^>]*aria-label="Help" aria-expanded="false"/);
  });

  it("never marks Needs me, on any screen (K1, U3)", () => {
    for (const screen of ["home", "initiatives", "usage", "initiative", "settings"]) {
      const html = bar({ screen, selectedInitiative: "organizer" });
      expect(html).toMatch(/<button class="needs-me"/);
      expect(html).not.toMatch(/needs-me\s+on/);
    }
  });

  it("shows the id after the places with no slash, and no crumb elsewhere (K2, I23)", () => {
    for (const screen of ["home", "initiatives", "usage", "settings"]) expect(bar({ screen })).not.toContain('class="crumbs"');
    const init = bar({ screen: "initiative", selectedInitiative: "organizer" });
    expect(init).toMatch(/<\/nav><span class="crumbs"><b class="mono crumb-id" title="organizer" aria-current="page">organizer<\/b><\/span>/);
    expect(init).not.toContain("crumb-sep");
    expect(init).not.toMatch(/>\/</);
    expect(bar({ screen: "initiative", selectedInitiative: null })).toMatch(/<b title="Agents" aria-current="page">Agents<\/b>/);
  });

  it("keeps the tabs in the same place on every screen (K2)", () => {
    const head = (html: string) => html.slice(0, html.indexOf("</nav>")).replace(/ (class|aria-current)="[^"]*"/g, "");
    const home = head(bar({ screen: "home" }));
    for (const screen of ["initiatives", "usage", "initiative", "settings"]) expect(head(bar({ screen, selectedInitiative: "organizer" }))).toBe(home);
  });

  it("orders the app's controls Compact, Help, Settings", () => {
    const html = renderToStaticMarkup(<AppControls floats help={false} settings onCompact={noop} onHelp={noop} onSettings={noop} />);
    expect(ascending(at(html, 'aria-label="Compact to icon"', 'aria-label="Help"', 'aria-label="Settings"'))).toBe(true);
    expect(renderToStaticMarkup(<AppControls floats={false} help={false} settings={false} onCompact={noop} onHelp={noop} onSettings={noop} />)).not.toContain("Compact");
  });

  it("draws no rule between groups", () => {
    expect(bar()).not.toMatch(/init-sep|<hr|role="separator"/);
  });
});

// B1 (leftovers-20 FR-1, FR-2; A5 §1, I35): current is a line, open is a
// surface. The current gear is `.on`, the open `?` is `.open`, and the two
// rules in shell.css draw them apart.
describe("current against open in the bar (B1)", () => {
  const shell = readFileSync(new URL("../styles/shell.css", import.meta.url), "utf8") as string;
  const rule = (sel: string) => {
    const m = shell.match(new RegExp(`^${sel.replace(/\./g, "\\.")} \\{([^}]*)\\}`, "m"));
    expect(m, sel).not.toBeNull();
    return m![1];
  };
  const help = (html: string) => html.match(/<button class="([^"]*)"[^>]*aria-label="Help"/)![1].split(/\s+/);
  const gear = (html: string) => html.match(/<button class="([^"]*)"[^>]*aria-label="Settings"/)![1].split(/\s+/);
  const controls = (help: boolean, settings: boolean) =>
    renderToStaticMarkup(<AppControls floats={false} help={help} settings={settings} onCompact={noop} onHelp={noop} onSettings={noop} />);

  it("marks the gear on Settings as current and `?` open as open, never the other's class", () => {
    expect(gear(controls(false, true))).toContain("on");
    expect(gear(controls(false, true))).not.toContain("open");
    expect(help(controls(true, false))).toContain("open");
    expect(help(controls(true, false))).not.toContain("on");
    // Help over Settings: both show, and differ.
    const both = controls(true, true);
    expect(gear(both)).toEqual(["ghost", "gear", "on"]);
    expect(help(both)).toEqual(["ghost", "gear", "open"]);
    // Neither: no mark at all.
    const none = controls(false, false);
    expect(gear(none)).not.toContain("on");
    expect(help(none)).not.toContain("open");
  });

  it("draws the current gear as the tabs' 2 px accent underline with no fill", () => {
    const on = rule(".gear.on");
    expect(on).toContain("box-shadow: inset 0 -2px 0 var(--accent)");
    expect(on).not.toMatch(/background/);
    // The same line as the current place tab.
    expect(rule(".places .place-tab.on")).toContain("box-shadow: inset 0 -2px 0 var(--accent)");
  });

  it("draws `?` open as the selected surface with no underline", () => {
    const open = rule(".gear.open");
    expect(open).toContain("background: var(--surface-selected)");
    expect(open).not.toMatch(/box-shadow/);
  });
});

describe("the sync line only with auth: firebase (FR-4)", () => {
  it("is gone with auth off on every screen, and Sync with it", () => {
    for (const screen of ["home", "initiative", "settings", "usage", "initiatives"]) {
      const html = bar({ authMode: "off", screen, selectedInitiative: "organizer" });
      expect(html).not.toContain("machines · remote");
      expect(html).not.toContain("Sync<");
    }
    expect(bar({ authMode: "off", syncNote: "auth off" })).not.toContain("auth off");
  });

  it("shows with firebase, and a sync note in its place", () => {
    expect(bar({ authMode: "firebase" })).toContain("2 machines · remote");
    expect(bar({ authMode: "firebase", syncNote: "token expired" })).toMatch(/class="meta warn"[^>]*>token expired/);
  });

  it("keeps an error with either mode", () => {
    expect(bar({ authMode: "off", error: "scan failed" })).toContain('class="meta err">scan failed');
  });
});

describe("one line at 1024 (FR-5)", () => {
  it("never writes the version in the bar; the brand's hover holds it", () => {
    for (const widthClass of ["compact", "regular", "wide"]) {
      const html = bar({ widthClass });
      expect(html).not.toContain("brand-version");
      expect(html).toMatch(/<span class="brand" title="Deltagos[^"]*">Deltagos<\/span>/);
    }
  });

  it("folds the firebase sync line into Sync's name and hover at compact, not the brand's", () => {
    const html = bar({ authMode: "firebase", widthClass: "compact" });
    expect(html).toMatch(/<span class="brand" title="Deltagos">/);
    expect(html).not.toContain('class="meta">2 machines');
    expect(html).toMatch(/<button class="ghost" title="Sync\. 2 machines, remote [^"\n]+\nPush this machine, pull all" aria-label="Sync\. 2 machines, remote [^"]+">/);
  });

  it("takes the memory button's short form at compact", () => {
    const memory = { free_bytes: 7.8 * 1024 ** 3, total_bytes: 32 * 1024 ** 3, used_bytes: 0, pressure: "normal" };
    const agents = { memory };
    expect(bar({ widthClass: "regular", agents })).toContain("GB free</span>");
    const compact = bar({ widthClass: "compact", agents });
    expect(compact).toMatch(/memory-text num">[\d.]+ GB<\/span>/);
  });
});

describe("the signed-in bar at 1024 (K3, I24)", () => {
  const email = "someone.longername@example.com"; // 30 characters
  const id = "ccint-camp-monorepo-xy"; // 22 characters
  const fb = (over: Record<string, unknown> = {}) => bar({
    authMode: "firebase", widthClass: "compact", screen: "initiative", selectedInitiative: id,
    account: { signed_in: true, email }, view: { board: { machines: [{}] }, pulled_at: new Date(Date.now() - 2 * 3600e3).toISOString() },
    agents: { memory: { free_bytes: 7.8 * 1024 ** 3, total_bytes: 32 * 1024 ** 3, used_bytes: 0, pressure: "normal" } }, ...over,
  });

  it("checks its own fixtures", () => {
    expect(email).toHaveLength(30);
    expect(id).toHaveLength(22);
  });

  it("folds in order: memory short, the sync line into Sync, the account an icon last, the title clamped", () => {
    const html = fb();
    expect(html).toMatch(/<header class="topbar fold">/);
    expect(html).toMatch(/memory-text num">[\d.]+ GB<\/span>/);
    expect(html).not.toContain("machine · remote");
    expect(html).toMatch(/aria-label="Sync\. 1 machine, remote 2h ago">/);
    expect(html).toMatch(/> Sync<\/button>/);
    // Rescan folds to its glyph, keeping its name (not in A3 §2; measured).
    expect(html).toMatch(/<button class="ghost gear" title="Rescan local disk" aria-label="Rescan"><svg[^]*?<\/svg><\/button>/);
    // The account: an icon named with the email, its hover the email, last.
    expect(html).toMatch(new RegExp(`<button class="ghost gear account-btn" title="${email}" aria-label="Account ${email}" aria-haspopup="menu" aria-expanded="false"><svg`));
    expect(html).not.toContain(`> ${email}<`);
    expect(ascending(at(html, 'class="tb-group tb-app"', 'aria-label="Help"', 'aria-label="Settings"', "account-btn"))).toBe(true);
    expect(html.slice(html.indexOf("account-btn"))).toMatch(/^[^]*<\/span><\/span><\/header>$/);
    // The title keeps its hover; the css clamps it to 12ch under .topbar.fold.
    expect(html).toContain(`<b class="mono crumb-id" title="${id}" aria-current="page">${id}</b>`);
  });

  it("reads Sync · stale past a day, stale in magenta on a quiet button", () => {
    const html = fb({ view: { board: { machines: [{}] }, pulled_at: new Date(Date.now() - 3 * 86400e3).toISOString() } });
    expect(html).toMatch(/<button class="ghost" title="Sync\. 1 machine, remote 3d ago\n[^"]*" aria-label="Sync\. 1 machine, remote 3d ago"><svg[^]*?<\/svg> Sync · <span class="sync-stale">stale<\/span><\/button>/);
    expect(fb()).not.toContain("sync-stale");
  });

  it("draws Sync as a ghost in every state, never the accent fill (L3, I30)", () => {
    const old = { board: { machines: [{}] }, pulled_at: new Date(Date.now() - 3 * 86400e3).toISOString() };
    const states = { fresh: fb(), stale: fb({ view: old }), syncing: fb({ syncing: true }), staleSyncing: fb({ view: old, syncing: true }), regular: fb({ widthClass: "regular" }), regularStale: fb({ widthClass: "regular", view: old }) };
    for (const [name, html] of Object.entries(states)) {
      const sync = html.match(/<button[^>]*>(?:(?!<\/button>)[^])*Sync(?:(?!<\/button>)[^])*<\/button>|<button[^>]*>(?:(?!<\/button>)[^])*syncing…<\/button>/)![0];
      expect(sync, name).toMatch(/^<button class="ghost"/);
      expect(html, name).not.toContain('class="primary"');
    }
    expect(states.stale).toContain('<span class="sync-stale">stale</span>');
    expect(states.fresh).not.toContain("stale");
  });

  it("does not fold at regular: the line, the email and the account before Help", () => {
    const html = fb({ widthClass: "regular" });
    expect(html).not.toContain("topbar fold");
    expect(html).toContain("1 machine · remote 2h ago");
    expect(html).not.toContain("account-btn");
    expect(html).toContain("</svg> Rescan</button>");
    expect(ascending(at(html, `${email}<`, 'aria-label="Help"'))).toBe(true);
    expect(html).not.toContain("sync-stale");
  });

  it("does not fold with auth off at compact: no account, no Sync", () => {
    const html = fb({ authMode: "off" });
    expect(html).not.toContain("topbar fold");
    expect(html).not.toContain("account");
    expect(html).not.toContain("Sync");
  });
});

describe("the review crumb's card title (review-map v2 FR-21)", () => {
  const css = readFileSync(new URL("../styles/review.css", import.meta.url), "utf8") as string;
  const rule = (sel: string) => css.match(new RegExp(`(^|\\n)${sel.replace(/[.*]/g, (c) => `\\${c}`)} \\{([^}]*)\\}`))?.[2] ?? "";
  it("shrink-wraps: no fixed basis or width, min-width 0, at most 32ch", () => {
    const card = rule(".crumbs .crumb-card");
    expect(card).toContain("flex: 0 1 auto");
    expect(card).toContain("min-width: 0");
    expect(card).toContain("max-width: 32ch");
    expect(card).not.toMatch(/(^|[\s;])width:|flex-basis/);
    // the zero width that keeps the bar inside the window is the crumbs', not the title's
    expect(rule(".review-where .crumbs")).toContain("width: 0");
  });
  it("carries the full title in its name, however much the bar shows", () => {
    const title = "Greet acme by name on the board, and a title much longer than thirty-two characters";
    const html = renderToStaticMarkup(<Where screen="initiative" selectedInitiative="init-a" review={{ initiative: "init-a", title }} go={() => noop} goHome={noop} openInitiatives={noop} openUsage={noop} />);
    expect(html).toContain(`<span class="crumb-card" title="${title}">${title}</span>`);
  });
});
