import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// leftovers-61 D3 (FR-3, DS3): the header says the records waiting on the
// cells once beside the lead's count, `N decisions waiting · 1 with the
// cells`, muted (no badge, no lozenge), and pressing it opens Decisions on
// the oldest of them, so at that group. Drawn by a server render with the
// store mocked, as DecisionsView.test does; the press is the button's own
// onClick, caught as the JSX is built.

const h = vi.hoisted(() => ({ clicks: new Map<string, () => void>(), opened: [] as string[][] }));
vi.mock("react/jsx-dev-runtime", async (orig) => {
  const R = await orig<typeof import("react/jsx-dev-runtime")>();
  return {
    ...R,
    jsxDEV: (type: unknown, props: Record<string, unknown>, ...rest: unknown[]) => {
      if (type === "button" && typeof props.className === "string" && props.className.includes("ihead-")) h.clicks.set(props.className, props.onClick as () => void);
      return (R.jsxDEV as (...a: unknown[]) => unknown)(type, props, ...rest);
    },
  };
});
const state: Record<string, unknown> = {};
vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: typeof state) => unknown) => (sel ? sel(state) : state), { getState: () => state });
  return { useBoard };
});
vi.mock("../../wailsjs/go/main/App", () => ({}));
vi.mock("../../wailsjs/runtime/runtime", () => ({ EventsOn: () => () => undefined }));
vi.mock("../hooks/useWails", () => ({ api: {} }));

const { InitiativeHeader } = await import("./InitiativeHeader");

const rec = (number: string, status: string, more: Record<string, unknown> = {}) => ({ number, title: `t${number}`, status, owner: "pablo", raised: "2026-10-01", ...more });

function draw(decisions: unknown[]) {
  h.clicks.clear();
  h.opened = [];
  Object.keys(state).forEach((k) => delete state[k]);
  const i = { id: "init-a", local: true, status: "active", path: "/h/init-a", decisions, stages: [], problems: [] };
  Object.assign(state, {
    sub: "overview", view: { board: { initiatives: [i] } }, agents: { groups: [] }, headerOpen: false, widthClass: "wide",
    openInitiative: () => undefined, openStage: () => undefined, openInitiatives: () => undefined, setHeaderOpen: () => undefined,
    openDecision: (id: string, n: string) => h.opened.push([id, n]),
  });
  return renderToStaticMarkup(<InitiativeHeader initiative={i as never} />);
}
const cellsButton = (html: string) => /<button class="linkish ihead-cells"[^>]*>([^<]*)<\/button>/.exec(html);
const pills = (html: string) => html.replace(/<[^>]*>/g, "\n").split("\n").map((t) => t.trim()).filter(Boolean);

describe("leftovers-61 D3: the header's with the cells", () => {
  const ds = [rec("0002", "proposed"), rec("0003", "proposed"), rec("0013", "awaiting-cells", { owner: "operator", raised: "2026-10-20" }), rec("0014", "applied", { ruled: "2026-10-21" })];
  it("reads `2 decisions waiting on you · 1 with the cells`, the second part muted text, not a lozenge", () => {
    const html = draw(ds);
    const t = pills(html);
    const k = t.indexOf("2 decisions waiting on you");
    expect(k).toBeGreaterThan(-1);
    expect(t[k + 1]).toBe("· 1 with the cells");
    expect(cellsButton(html)).not.toBeNull();
    expect(cellsButton(html)![0]).not.toMatch(/\blz\b|badge/);
  });
  it("reads `1 with the cells` alone when nothing waits on the lead", () => {
    const html = draw(ds.filter((d) => d.status !== "proposed"));
    expect(cellsButton(html)![1]).toBe("1 with the cells");
    expect(html).not.toContain("decisions waiting");
    expect(html).not.toContain("decision waiting");
  });
  it("is absent when nothing waits on the cells", () => {
    expect(cellsButton(draw(ds.filter((d) => d.number !== "0013")))).toBeNull();
  });
  it("pressing it opens Decisions on 0013, in With the cells", () => {
    draw(ds);
    h.clicks.get("linkish ihead-cells")!();
    expect(h.opened).toEqual([["init-a", "0013"]]);
  });
});
