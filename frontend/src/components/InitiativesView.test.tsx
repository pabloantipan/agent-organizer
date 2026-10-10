// Vitest blanks CSS modules, so the stylesheet is read from disk; the
// frontend has no Node types (vitest runs in Node).
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { merge } from "../../wailsjs/go/models";
import { escapeCloses } from "../lib/focus";
import { CardDetails, detailsAfter, InitiativesView, pressOf } from "./InitiativesView";
import { InitiativeHeader } from "./InitiativeHeader";

// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const useBoard = store.useBoard;

// C1 and C2 (docs/specs/leftovers-17.md). No DOM library is a dependency
// here, so presses are proved on the decision the card's handler makes
// (pressOf over the element pressed), the markup on the server render, and
// Escape on the handler the open card carries. The review build covers the
// rest by AX on its own process (progress.md).

const init = (over: Partial<merge.BoardInitiative>): merge.BoardInitiative => ({
  id: "organizer", title: "", description: "", machine: "lodestar", local: true, path: "/r/organizer", status: "active",
  goal: "One board for every initiative", measure: "Pablo opens it first each day", target: "2026-10-31",
  scope: { in: ["the board", "agents"], out: ["Jira"] },
  stages: [
    { id: "s1", title: "first", outcome: "o1", done: "2026-09-01" },
    { id: "s2", title: "second", outcome: "o2", done: "2026-09-10" },
    { id: "one-window", title: "one-window", outcome: "the app in one window", current: true },
    { id: "s4", title: "fourth" },
    { id: "s5", title: "fifth" },
  ],
  repos_state: [{ name: "organizer", branch: "main", dirty: 0, last_commit: "1h" }],
  problems: [], decisions: [], also_on: [], specs: [], ...over,
} as unknown as merge.BoardInitiative);

const viewOf = (inits: merge.BoardInitiative[]) => ({ board: { initiatives: inits, columns: {} }, order: {} }) as never;

// A stand-in for the element pressed: it answers closest() for the
// selectors it is (the tag and attributes it carries, or an ancestor's).
const el = (...is: string[]) => ({
  closest: (sel: string) => (sel.split(",").map((x) => x.trim()).some((x) => is.includes(x)) ? {} : null),
});

describe("C1: a press on the card's body opens it; its buttons never do (FR-1)", () => {
  it("the body opens; the id link, Sleep, Wake and Details keep their own press", () => {
    expect(pressOf(el("div"), false)).toBe("open");
    expect(pressOf(el("a"), false)).toBe("own");
    expect(pressOf(el("button"), false)).toBe("own"); // Sleep, Wake, Details
    expect(pressOf(el("div", ".ic-note"), false)).toBe("own");
  });

  it("with Sleep's confirm open the press goes to the confirm, never opens", () => {
    expect(pressOf(el("div"), true)).toBe("confirm");
    expect(pressOf(el("div", "[role=group]"), true)).toBe("own");
    expect(pressOf(el("button"), true)).toBe("own");
  });

  const html = (() => {
    useBoard.setState({ view: viewOf([init({}), init({ id: "camp", status: "paused", goal: "" })]), agents: null });
    return renderToStaticMarkup(<InitiativesView />);
  })();
  const cards = [...html.matchAll(/<article\b[\s\S]*?<\/article>/g)].map((m) => m[0]);

  it("one link per card, named Open <id>, the id its text", () => {
    expect(cards).toHaveLength(2);
    for (const [c, id] of [[cards[0], "organizer"], [cards[1], "camp"]]) {
      const links = [...c.matchAll(/<a\b[^>]*>([^<]*)<\/a>/g)];
      expect(links).toHaveLength(1);
      expect(links[0][0]).toContain(`aria-label="Open ${id}"`);
      expect(links[0][1]).toBe(id);
    }
    expect(cards[1]).toContain('title="open camp, read-only"');
  });

  it("the body is one press target and Details sits in the card's foot, folded", () => {
    for (const c of cards) {
      expect(c).toMatch(/<div class="ic-main">/);
      expect(c).toMatch(/<div class="ic-foot"><button class="ic-more" aria-expanded="false" aria-label="Details of \w+">Details/);
      expect(c).not.toContain("ic-details");
    }
  });

  it("the body's press and the link open the initiative on Overview (asleep reads read-only there)", () => {
    // What the body's handler and the link's call: openInitiative(id, "overview").
    const src = readFileSync(new URL("./InitiativesView.tsx", import.meta.url), "utf8") as string;
    expect(src.match(/openInitiative\(c\.id, "overview"\)/g)).toHaveLength(2);
  });
});

describe("C2: Details, the Charter and the Workspace (FR-2)", () => {
  const text = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const details = (i: merge.BoardInitiative, readOnly = false) => renderToStaticMarkup(<CardDetails id="d" i={i} readOnly={readOnly} />);

  it("the Charter's fields verbatim: goal in full, measure, target in words, scope in and out, stage with outcome and n of m", () => {
    const t = text(details(init({})));
    expect(t).toContain("Charter");
    expect(t).toContain("Goal One board for every initiative");
    expect(t).toContain("Measure Pablo opens it first each day");
    expect(t).toContain("Target 31 Oct");
    expect(t).toContain("In scope the board agents");
    expect(t).toContain("Out of scope Jira");
    expect(t).toContain("Stage one-window — “the app in one window” (3 of 5)");
  });

  it("each missing field is its own `no … yet`", () => {
    const t = text(details(init({ goal: "", measure: "", target: "", scope: { in: [], out: [] }, stages: [] })));
    for (const w of ["no goal yet", "no measure yet", "no target yet", "no scope yet", "no roadmap yet"]) expect(t).toContain(w);
    const noOutcome = text(details(init({ stages: [{ id: "x", title: "x", current: true }] as never })));
    expect(noOutcome).toContain("Stage x — no outcome yet (1 of 1)");
  });

  it("the Workspace is Home's chevron detail, as is", () => {
    const h = details(init({}));
    expect(h).toContain("Workspace");
    expect(h).toContain('class="init-detail"');
    expect(h).toContain("Repos");
    expect(h).toContain("Review with agent");
  });

  it("not awake, the Workspace drops its agent start by InitiativeDetail's readOnly (0042; leftovers-18 FR-6)", () => {
    expect(details(init({ status: "paused" }), true)).not.toContain("Review with agent");
    expect(details(init({}), false)).toContain("Review with agent");
  });

  it("the header and the card render the same Charter component; the header's leaves out target and stage (leftovers-18 FR-4)", () => {
    const i = init({});
    useBoard.setState({ view: viewOf([i]), agents: null, headerOpen: true, sub: "overview", widthClass: "wide" } as never);
    const head = renderToStaticMarkup(<InitiativeHeader initiative={i} />);
    const charterOf = (h: string) => {
      const at = h.indexOf("data-charter=");
      expect(at).toBeGreaterThan(-1);
      const from = h.lastIndexOf("<div", at);
      // Up to the next sibling after the charter: the header's source line, or the card's Workspace.
      const to = Math.min(...[h.indexOf('class="ihead-source"', at), h.indexOf('class="ic-ws', at)].filter((x) => x > 0));
      return text(h.slice(from, h.lastIndexOf("<", to)));
    };
    const card = charterOf(details(i));
    expect(card.length).toBeGreaterThan(40);
    const strip = (t: string) => t.replace(/ Target 31 Oct/, "").replace(/ Stage one-window — “the app in one window” \(3 of 5\)/, "");
    expect(charterOf(head)).toBe(strip(card.replace(/ Workspace$/, "")));
  });

  it("one open at a time: Details on the same card closes, on another replaces it", () => {
    expect(detailsAfter(null, "a")).toBe("a");
    expect(detailsAfter("a", "a")).toBe(null);
    expect(detailsAfter("a", "b")).toBe("b");
  });

  it("Escape closes them and nothing else does", () => {
    const close = vi.fn();
    const stop = vi.fn();
    escapeCloses(close)({ key: "Enter", stopPropagation: stop } as never);
    expect(close).not.toHaveBeenCalled();
    escapeCloses(close)({ key: "Escape", stopPropagation: stop } as never);
    expect(close).toHaveBeenCalledOnce();
    // The open card carries it, and closing lands focus on its Details button.
    const src = readFileSync(new URL("./InitiativesView.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain('onKeyDown={open ? escapeCloses(() => closeDetails(c.id)) : undefined}');
    expect(src).toContain('const closeDetails = (id: string) => { setDetails(null); focusIn(id, ".ic-more"); };');
  });

  it("the open card spans its row; Charter and Workspace stack below 1280", () => {
    const css = readFileSync(new URL("../styles/initiatives.css", import.meta.url), "utf8") as string;
    expect(css).toContain(".ic.open { grid-column: 1 / -1; }");
    expect(css).toMatch(/\.ic-details \{[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
    expect(css).toContain("@media (max-width: 1279px) { .ic-details { grid-template-columns: minmax(0, 1fr); } }");
  });
});
