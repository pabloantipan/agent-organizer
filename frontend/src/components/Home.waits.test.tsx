import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { model } from "../../wailsjs/go/models";

// leftovers-36 N2, N6 (and N3's empty group): the rows of a long wait, the
// lead's and someone else's, rendered to markup with the store mocked.

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

describe("N2: a record of the lead's exactly 7 days old", () => {
  const d = rec("0007", "pablo", "2026-10-08", "Pick the store");
  const html = renderToStaticMarkup(<DecisionRow row={leadRow(d, 7)} decision={d} />);

  it("says waiting 7 days in .lz.warning before the id", () => {
    const lz = html.indexOf('<span class="lz warning">waiting 7 days</span>');
    expect(lz).toBeGreaterThanOrEqual(0);
    expect(lz).toBeLessThan(html.indexOf('<span class="mono">camp 0007</span>'));
  });

  it("keeps Rule as its verb", () => {
    expect(html).toMatch(/<button[^>]*>Rule<\/button>/);
  });

  it("under 7 days the row is as today: the decision lozenge, no age", () => {
    const fresh = renderToStaticMarkup(<DecisionRow row={leadRow(d, null)} decision={d} />);
    expect(fresh).toContain('<span class="lz waiting">decision</span>');
    expect(fresh).not.toContain("days");
    expect(fresh).not.toContain("aria-describedby");
  });
});

describe("N6: accessible names and descriptions (FR-5)", () => {
  it("the lead's row: Rule <initiative> <NNNN>, described by its line", () => {
    const d = rec("0007", "pablo", "2026-09-27", "Pick the store");
    const html = renderToStaticMarkup(<DecisionRow row={leadRow(d, 18)} decision={d} />);
    expect(described(html, "Rule camp 0007")).toBe("waiting 18 days, camp 0007, Pick the store");
  });

  it("someone else's row: Open <initiative> <NNNN>, described by its line", () => {
    const d = rec("0005", "alejandro", "2026-09-27", "Who owns QA");
    const html = renderToStaticMarkup(<OthersRow row={{ key: "others:camp/0005", initiative: "camp", owner: "alejandro", waited: 18, since: new Date(2026, 8, 27), decision: d }} />);
    expect(described(html, "Open camp 0005")).toBe("waiting on alejandro, 18 days, camp 0005, Who owns QA");
    expect(html).toMatch(/<button[^>]*aria-label="Open camp 0005"[^>]*>Open<\/button>/);
  });
});

describe("N3, N4: the group", () => {
  const d = rec("0005", "alejandro", "2026-09-27", "Who owns QA");
  const row = { key: "others:camp/0005", initiative: "camp", owner: "alejandro", waited: 18, since: new Date(2026, 8, 27), decision: d };

  it("is headed by an h3 Waiting on others · <n>, its row drawn waiting on <owner>, the age, id and title", () => {
    const html = renderToStaticMarkup(<WaitingOnOthers rows={[row]} />);
    expect(html.replace(/<[^>]+>/g, "")).toMatch(/^Waiting on others · 1/);
    expect(html).toMatch(/^<h3[^>]*>Waiting on others · <span[^>]*>1<\/span><\/h3>/);
    const at = ['<span class="lz waiting dashed">waiting on alejandro</span>', '<span class="lz warning">18 days</span>', '<span class="mono">camp 0005</span>', "</span> · Who owns QA"].map((m) => html.indexOf(m));
    expect(at.every((x, i) => x >= 0 && (i === 0 || at[i - 1] < x)), String(at)).toBe(true);
  });

  it("is absent when empty", () => {
    expect(renderToStaticMarkup(<WaitingOnOthers rows={[]} />)).toBe("");
  });
});
