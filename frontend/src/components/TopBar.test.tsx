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

const { TopBar, Where, AppControls, placeOf } = await import("./TopBar");

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

  it("marks one place current per screen, Home for an initiative and Settings", () => {
    expect(current(bar({ screen: "home" }))).toEqual(["Home"]);
    expect(current(bar({ screen: "initiatives" }))).toEqual(["Initiatives"]);
    expect(current(bar({ screen: "usage" }))).toEqual(["Usage"]);
    expect(current(bar({ screen: "initiative", selectedInitiative: "organizer" }))).toEqual(["Home"]);
    expect(current(bar({ screen: "settings" }))).toEqual(["Home"]);
  });

  it("puts the crumb after the places only inside a place", () => {
    for (const screen of ["home", "initiatives", "usage"]) expect(bar({ screen })).not.toContain('class="crumbs"');
    const init = bar({ screen: "initiative", selectedInitiative: "organizer" });
    expect(init).toMatch(/<span class="crumb-sep">\/<\/span><b class="mono crumb-id" title="organizer">organizer<\/b>/);
    expect(bar({ screen: "initiative", selectedInitiative: null })).toMatch(/\/<\/span><b title="Agents">Agents<\/b>/);
    expect(bar({ screen: "settings" })).toMatch(/\/<\/span><b title="Settings">Settings<\/b>/);
  });

  it("keeps the old crumbs' places: an initiative, Agents and Settings under Home", () => {
    expect(placeOf("initiative")).toBe("home");
    expect(placeOf("settings")).toBe("home");
    expect(placeOf("initiatives")).toBe("initiatives");
    expect(placeOf("usage")).toBe("usage");
  });

  it("adds / Help after the crumb while Help is open, the place still marked", () => {
    const html = renderToStaticMarkup(<Where screen="initiative" selectedInitiative="organizer" help go={() => noop} goHome={noop} openInitiatives={noop} openUsage={noop} />);
    expect(html).toMatch(/organizer<\/b><span class="crumb-sep">\/<\/span><b>Help<\/b>/);
    expect(current(html)).toEqual(["Home"]);
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

  it("folds the firebase sync line into the brand's hover at compact", () => {
    const html = bar({ authMode: "firebase", widthClass: "compact" });
    expect(html).toMatch(/class="brand" title="Deltagos\n2 machines · remote/);
    expect(html).not.toContain('class="meta">2 machines');
  });

  it("takes the memory button's short form at compact", () => {
    const memory = { free_bytes: 7.8 * 1024 ** 3, total_bytes: 32 * 1024 ** 3, used_bytes: 0, pressure: "normal" };
    const agents = { memory };
    expect(bar({ widthClass: "regular", agents })).toContain("GB free</span>");
    const compact = bar({ widthClass: "compact", agents });
    expect(compact).toMatch(/memory-text num">[\d.]+ GB<\/span>/);
  });
});
