import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { model } from "../../wailsjs/go/models";

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
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => null }));

const { DecisionRow, OthersRow, WaitingOnOthers } = await import("./Home");
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
