import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { model } from "../../wailsjs/go/models";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// leftovers-36 N2, N6 (and N3's empty group) and leftovers-37 P1, P4: the
// rows of a long wait, the lead's and someone else's, rendered to markup with
// the store mocked.

const state: Record<string, unknown> = { needsMeFocus: null, ruleDraft: null, openRule: () => undefined, setRuleDraft: () => undefined, dropRule: () => undefined, openDecision: () => undefined };
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state), { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: {} }));
// useDraft reads browser storage through useSyncExternalStore, which markup
// rendering refuses without a server snapshot: no draft kept here.
// W6 keeps words for one record to see `Rule · draft`.
const kept = vi.hoisted(() => new Set<string>());
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: (k: string) => (kept.has(k) ? { words: "x" } : null) }));

const { DecisionRow, InboxRow, OthersRow, WaitingOnOthers } = await import("./Home");
const { VERBS, VERB_LIST } = await import("../lib/verbs");
const { longWait } = await import("../lib/queue");

const rec = (number: string, owner: string, raised: string, title: string) => ({ number, status: "proposed", owner, raised, title, options: [] }) as unknown as model.Decision;
const leadRow = (d: model.Decision, waited: number | null) => ({ kind: "decision" as const, key: `decision:camp/${d.number}`, initiative: "camp", since: new Date(2026, 9, 8), decision: d, waited });

/** The element whose id the button named by label points at, by its text. */
function described(html: string, label: string) {
  const btn = new RegExp(`<button[^>]*aria-label="${label}"[^>]*>`).exec(html)?.[0] ?? "";
  const id = /aria-describedby="([^"]+)"/.exec(btn)?.[1];
  expect(id, `${label} is described`).toBeTruthy();
  const el = new RegExp(`id="${id!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([^<]*)<`).exec(html);
  return el?.[1];
}

/** The text of the row's age column and whether it carries the long class. */
function ageOf(html: string) {
  const m = /<span class="(ib-age[^"]*)"[^>]*>([^<]*)<\/span>/.exec(html);
  expect(m, "the row has an age column").toBeTruthy();
  return { long: m![1].split(" ").includes("long"), text: m![2] };
}

const othersRow = (d: model.Decision, waited: number, since: Date) => ({ key: `others:camp/${d.number}`, initiative: "camp", owner: d.owner!, waited, since, decision: d });

describe("P1: records 25 and 6 days old, the lead's and alejandro's, at a fixed now", () => {
  // 2026-10-15 at noon: 2026-09-20 is 25 days back, 2026-10-09 is 6.
  const now = new Date(2026, 9, 15, 12);
  vi.useFakeTimers({ now, toFake: ["Date"] });
  const lead25 = rec("0007", "pablo", "2026-09-20", "Pick the store");
  const lead6 = rec("0008", "pablo", "2026-10-09", "Name the bucket");
  const theirs25 = rec("0005", "alejandro", "2026-09-20", "Who owns QA");
  const rows = {
    lead25: renderToStaticMarkup(<DecisionRow row={{ ...leadRow(lead25, longWait(lead25.raised, now)), since: new Date(2026, 8, 20) }} decision={lead25} />),
    lead6: renderToStaticMarkup(<DecisionRow row={{ ...leadRow(lead6, longWait(lead6.raised, now)), since: new Date(2026, 9, 9) }} decision={lead6} />),
    theirs25: renderToStaticMarkup(<OthersRow row={othersRow(theirs25, longWait(theirs25.raised, now)!, new Date(2026, 8, 20))} />),
  };
  vi.useRealTimers();

  it("every row shows the decision lozenge in the reason column, first in the row", () => {
    for (const [name, html] of Object.entries(rows)) {
      expect(/^<div[^>]*class="ib-row[^"]*"[^>]*><span class="lz waiting">decision<\/span>/.test(html), name).toBe(true);
    }
  });

  it("no row has an age lozenge or a dashed one", () => {
    for (const [name, html] of Object.entries(rows)) {
      expect(html, name).not.toContain("lz warning");
      expect(html, name).not.toContain("dashed");
      expect(html.match(/class="lz /g)?.length, name).toBe(1);
    }
  });

  it("the 25-day rows' age column has the long class, the 6-day row's has not", () => {
    expect(ageOf(rows.lead25)).toEqual({ long: true, text: "25d" });
    expect(ageOf(rows.theirs25)).toEqual({ long: true, text: "25d" });
    expect(ageOf(rows.lead6)).toEqual({ long: false, text: "6d" });
  });

  it("the age is said once on screen: no days in the drawn row besides the column", () => {
    for (const html of [rows.lead25, rows.theirs25]) {
      const drawn = html.replace(/<span id="[^"]*" hidden="">[^<]*<\/span>/, "").replace(/ title="[^"]*"/g, "").replace(/ aria-[a-z]+="[^"]*"/g, "");
      expect(drawn).not.toMatch(/\d+ days/);
    }
  });

  it("a long row's description contains waiting 25 days, in full", () => {
    expect(described(rows.lead25, "Rule camp 0007")).toBe("waiting 25 days, camp 0007, Pick the store");
    expect(described(rows.theirs25, "Open camp 0005")).toBe("waiting on alejandro, 25 days, camp 0005, Who owns QA");
    expect(rows.lead6).not.toContain("aria-describedby");
  });

  it("the others' row starts its subject owner alejandro · camp 0005 · title", () => {
    const subject = /<span class="ib-subject">(.*?)<\/span><span class="ib-context">/.exec(rows.theirs25)?.[1] ?? "";
    expect(subject.replace(/<[^>]+>/g, "")).toBe("owner alejandro · camp 0005 · Who owns QA");
  });

  // leftovers-38 O1 (needs-me-waits W11): the owner is said once, in the
  // others' subject; the lead's context line is as it was.
  const contextOf = (html: string) => /<span class="ib-context">([^<]*)<\/span>/.exec(html)?.[1];
  it("O1: the others' context starts at raised and holds no owner; the lead's is unchanged", () => {
    expect(contextOf(rows.theirs25)).toBe("raised 20 Sep");
    expect(contextOf(rows.theirs25)).not.toContain("owner ");
    expect(contextOf(rows.lead25)).toBe("owner pablo · raised 20 Sep");
    expect(contextOf(rows.lead6)).toBe("owner pablo · raised 9 Oct");
  });

  it("keeps Rule as the lead's verb and Open as the others'", () => {
    expect(rows.lead25).toMatch(/<button[^>]*>Rule<\/button>/);
    expect(rows.theirs25).toMatch(/<button[^>]*aria-label="Open camp 0005"[^>]*>Open<\/button>/);
  });
});

describe("leftovers-36 N2: a record of the lead's exactly 7 days old is long", () => {
  const d = rec("0007", "pablo", "2026-10-08", "Pick the store");
  it("keeps decision, long age column, described as waiting 7 days", () => {
    const html = renderToStaticMarkup(<DecisionRow row={leadRow(d, 7)} decision={d} />);
    expect(html).toContain('<span class="lz waiting">decision</span>');
    expect(ageOf(html).long).toBe(true);
    expect(described(html, "Rule camp 0007")).toBe("waiting 7 days, camp 0007, Pick the store");
  });
});

describe("N3, P4: the group", () => {
  const d = rec("0005", "alejandro", "2026-09-27", "Who owns QA");
  const row = othersRow(d, 18, new Date(2026, 8, 27));

  it("is headed by an h3 Waiting on others · <n>, then exactly the sub-line", () => {
    const html = renderToStaticMarkup(<WaitingOnOthers rows={[row]} />);
    const h3 = /^<h3[^>]*>(.*?)<\/h3>/.exec(html)?.[1] ?? "";
    expect(h3).toMatch(/^Waiting on others · <span[^>]*>1<\/span><span class="sec-sub">Theirs to rule\. Not counted in Needs me\.<\/span>$/);
    const sub = /<span class="sec-sub">([^<]*)<\/span>/.exec(h3)?.[1];
    expect(sub).toBe("Theirs to rule. Not counted in Needs me.");
  });

  it("is absent when empty", () => {
    expect(renderToStaticMarkup(<WaitingOnOthers rows={[]} />)).toBe("");
  });
});

describe("W6 (leftovers-41 FR-6, lf40 UF1): each Needs me row kind renders its verb from the one list", () => {
  const since = new Date(2026, 9, 10);
  const base = { initiative: "camp", since };
  const thread = { id: "01T", subject: "the store", status: "open", asked_by: "po_ana", messages: 2 } as never;
  const task = { number: "0009", title: "Ship it", state: "over", forecast: "2h", forecast_top: 120, elapsed_minutes: 300, quiet_minutes: 0, cards: [] } as never;
  const card = { initiative_id: "camp", slug: "pick", title: "Pick the store", next: "pablo: pick", local: true } as never;
  const seat = { name: "dev_bruno", capped: false, undelivered: 2 } as never;
  const launch = { initiative: "camp", kind: "crew", failed: 1, seats: [{ seat: "dev_bruno", state: "failed", reason: "no token" }] } as never;
  const cell = { project: "camp", agents: ["pablo", "po_ana"] } as never;
  const files = [{ path: "/r/working-on/x.md", reasons: ["no frontmatter"] }] as never;
  /** The verb the row's one action button draws. */
  const verbOf = (html: string) => {
    const acts = [...html.matchAll(/<button class="act"[^>]*>([^<]*)<\/button>/g)].map((m) => m[1]);
    expect(acts, "one verb per row").toHaveLength(1);
    return acts[0];
  };
  const render = (row: unknown) => verbOf(renderToStaticMarkup(<InboxRow row={row as never} />));
  const cases: [string, unknown, string][] = [
    ["decision", { ...base, kind: "decision", key: "decision:camp/0007", decision: rec("0007", "pablo", "2026-10-10", "Pick the store"), waited: null }, VERBS.rule],
    ["thread", { ...base, kind: "thread", key: "thread:01T", thread }, VERBS.answer],
    ["task, with a live supervisor", { ...base, kind: "task", key: "task:camp/0009", task, supervisor: { group: "camp", id: "sup9" } }, VERBS.agents],
    ["task, none", { ...base, kind: "task", key: "task:camp/0009", task, supervisor: null }, VERBS.open],
    ["card", { ...base, kind: "card", key: "card:camp/pick", card }, VERBS.open],
    ["seat", { ...base, kind: "seat", key: "seat:camp/dev_bruno", seat }, VERBS.agents],
    ["start", { ...base, kind: "start", key: "start:camp", launch }, VERBS.agents],
    ["launch, a persona missing", { ...base, since: null, kind: "launch", key: "launch:camp", cell, missing: "po_ana" }, VERBS.open],
    ["launch", { ...base, since: null, kind: "launch", key: "launch:camp", cell, missing: null }, VERBS.launch],
    ["unread", { ...base, since: null, kind: "unread", key: "unread:camp", path: "/r", files }, VERBS.show],
  ];
  for (const [kind, row, verb] of cases) {
    it(`${kind}: ${verb}`, () => {
      const v = render(row);
      expect(v).toBe(verb);
      expect(VERB_LIST).toContain(v);
    });
  }
  it("decision, words kept: Rule · draft", () => {
    kept.add("decision:camp/0007");
    try {
      expect(render(cases[0][1])).toBe(VERBS.ruleDraft);
    } finally {
      kept.clear();
    }
  });
  it("waiting on others: Open", () => {
    const d = rec("0005", "alejandro", "2026-09-20", "Who owns QA");
    expect(verbOf(renderToStaticMarkup(<OthersRow row={othersRow(d, 25, new Date(2026, 8, 20))} />))).toBe(VERBS.open);
  });
  it("Home draws no verb literal: every row's verb is read from the list", () => {
    const src = readFileSync(new URL("./Home.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain('import { ruleVerb, VERBS } from "../lib/verbs";');
    expect(src).not.toMatch(/>(Rule|Answer|Open|Agents|Launch|Show)<\/button>/);
  });
});
