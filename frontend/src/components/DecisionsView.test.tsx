import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import fixture from "../../../testdata/questions/0037-big-picture-stage.md?raw";

// leftovers-51 W5 (FR-7, FR-8): the Ruled list with lf49's question record
// ruled `Q1 after-graph-performs-start-now, Q2 record-page`, built here from
// the fixture's frontmatter, and a plain ruled record. Vitest runs in Node
// with no DOM, so the view is drawn by a server render with the store mocked;
// a record shows open when the store lands on it (decisionFocus).

const state: Record<string, unknown> = {};
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state), { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: {} }));
// useDrafts reads browser storage through useSyncExternalStore, which markup
// rendering refuses without a server snapshot: no draft kept here.
vi.mock("../lib/drafts", async (orig) => {
  const real = await orig<typeof import("../lib/drafts")>();
  const none = { has: () => false, restore: () => ({}), edit: () => undefined, discard: () => undefined };
  return { ...real, useDrafts: () => none };
});

const { DecisionsView } = await import("./DecisionsView");

/** The fixture's options, from its frontmatter. */
const options: string[] = JSON.parse(fixture.split("\n").find((l) => l.startsWith("options: "))!.slice("options: ".length));
const CHOSEN = "Q1 after-graph-performs-start-now, Q2 record-page";

const question = { number: "0037", title: "A Big Picture stage", status: "ruled", raised: "2026-10-23", ruled: "2026-10-24", ruled_by: "pablo", owner: "pablo", options, chosen: CHOSEN, body: "", path: "working-on/decisions/0037-big-picture-stage.md" };
const plain = { number: "0036", title: "Pick the store", status: "ruled", raised: "2026-10-20", ruled: "2026-10-22", ruled_by: "pablo", owner: "pablo", options: ["accept as written", "send back"], chosen: "accept as written", body: "", path: "working-on/decisions/0036-pick-the-store.md" };

function draw(focus: string | null) {
  Object.keys(state).forEach((k) => delete state[k]);
  Object.assign(state, {
    view: { board: { initiatives: [{ id: "hestia", machine: "lodestar", local: true, decisions: [question, plain], cards: [] }] } },
    selectedInitiative: "hestia", select: () => undefined, decisionFocus: focus, decisionSeq: 0,
    decSections: { rule: true, ruled: true, timeline: false }, setDecSection: () => undefined,
  });
  return renderToStaticMarkup(<DecisionsView />);
}

/** One record's markup, by its number. */
const recordOf = (html: string, n: string) => {
  const start = html.indexOf(`data-dec="hestia/${n}"`);
  expect(start, `${n} drawn`).toBeGreaterThan(-1);
  const next = html.indexOf("data-dec=", start + 1);
  return html.slice(start, next < 0 ? undefined : next);
};
const lineOf = (rec: string) => /<button class="dec-line"[^>]*>[\s\S]*?<\/button>/.exec(rec)![0];
const chosenOnLine = (rec: string) => /<span class="dec-chosen"[^>]*>([^<]*)<\/span>/.exec(lineOf(rec))?.[1] ?? null;
const text = (s: string) => s.replace(/<[^>]*>/g, "\n").split("\n").map((t) => t.trim()).filter(Boolean);

describe("W5: the Ruled list speaks a question record (leftovers-51 FR-7, FR-8)", () => {
  it("closed, the line draws the answers whole before it measures, and its name keeps the full chosen (leftovers-52 D1)", () => {
    const rec = recordOf(draw(null), "0037");
    expect(chosenOnLine(rec)).toBe(`“${CHOSEN}”`);
    expect(lineOf(rec)).toMatch(/class="dec-opt answers"/);
    expect(/aria-label="([^"]*)"/.exec(lineOf(rec))![1]).toContain(`“${CHOSEN}”`);
    expect(/<span class="dec-chosen" title="([^"]*)"/.exec(rec)![1]).toBe(`“${CHOSEN}”`);
    expect(rec).not.toMatch(/>Chosen</);
  });

  it("closed, a plain ruled line keeps its one option, floored as a whole", () => {
    const rec = recordOf(draw(null), "0036");
    expect(chosenOnLine(rec)).toBe("“accept as written”");
    expect(lineOf(rec)).toMatch(/class="dec-opt floored"/);
  });

  it("open, the head shows Chosen with both answers in full and the line has no chosen", () => {
    const rec = recordOf(draw("hestia/0037"), "0037");
    expect(chosenOnLine(rec)).toBeNull();
    const head = /<div class="dec-head[^"]*">([\s\S]*?)<div class="dec-body">/.exec(rec)![1];
    const after = text(head.slice(head.indexOf("</button>")));
    expect(after.slice(0, 3)).toEqual(["Chosen", "Q1 after-graph-performs-start-now", "Q2 record-page"]);
    // leftovers-52 D2 (FR-5, UW3): the head says it, so the line's name does not
    const name = /aria-label="([^"]*)"/.exec(lineOf(rec))![1];
    expect(name).not.toContain("Q1");
    expect(name).not.toContain("“");
  });

  it("open, a plain ruled record's head shows its one option", () => {
    const rec = recordOf(draw("hestia/0036"), "0036");
    expect(chosenOnLine(rec)).toBeNull();
    const head = /<div class="dec-head[^"]*">([\s\S]*?)<div class="dec-body">/.exec(rec)![1];
    expect(text(head.slice(head.indexOf("</button>"))).slice(0, 2)).toEqual(["Chosen", "accept as written"]);
  });
});
