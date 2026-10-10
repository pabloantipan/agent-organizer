import { renderToStaticMarkup } from "react-dom/server";
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
const where = (screen: string, help = false, selectedInitiative: string | null = "organizer") =>
  renderToStaticMarkup(<Where screen={screen as never} selectedInitiative={selectedInitiative} help={help} go={() => noop} goHome={noop} openInitiatives={noop} openUsage={noop} />);

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

  it("marks Help alone while it is open, over any screen (K1)", () => {
    for (const screen of ["home", "initiatives", "usage", "initiative", "settings"]) {
      const html = where(screen, true) + renderToStaticMarkup(<AppControls floats help settings={screen === "settings"} onCompact={noop} onHelp={noop} onSettings={noop} />);
      expect(marks(html), screen).toEqual(["Help"]);
      expect(html).not.toContain("place-tab on");
      expect(html).not.toContain("place-tab parent");
      expect(html).toMatch(/class="ghost gear on"[^>]*aria-label="Help" aria-current="page"/);
    }
  });

  it("never marks Needs me, on any screen (K1, U3)", () => {
    for (const screen of ["home", "initiatives", "usage", "initiative", "settings"]) {
      const html = bar({ screen, selectedInitiative: "organizer" });
      expect(html).toMatch(/<button class="needs-me"/);
      expect(html).not.toMatch(/needs-me on/);
    }
  });

  it("shows the id after the places with no slash, and no crumb elsewhere (K2, I23)", () => {
    for (const screen of ["home", "initiatives", "usage", "settings"]) expect(bar({ screen })).not.toContain('class="crumbs"');
    const init = bar({ screen: "initiative", selectedInitiative: "organizer" });
    expect(init).toMatch(/<\/nav><span class="crumbs"><b class="mono crumb-id" title="organizer" aria-current="page">organizer<\/b><\/span>/);
    expect(init).not.toContain("crumb-sep");
    expect(init).not.toMatch(/>\/</);
    expect(bar({ screen: "initiative", selectedInitiative: null })).toMatch(/<b title="Agents" aria-current="page">Agents<\/b>/);
    for (const screen of ["home", "initiative", "settings"]) expect(where(screen, true)).not.toContain('class="crumbs"');
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
  const email = "someone@example.com"; // 30 characters
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
