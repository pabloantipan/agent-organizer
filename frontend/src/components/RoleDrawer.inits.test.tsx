import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// D2 (leftovers-25 FR-11, tab-reaches-links T18). The drawer's initiatives
// are an inline list of links, 8px apart, with no commas; the 2px ring on
// the padding edge then sits 6px from the next item's box.
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { RoleDrawer } = await import("./RoleDrawer");
const rolesCss = readFileSync(new URL("../styles/roles.css", import.meta.url), "utf8") as string;

function drawer(initiatives: string[]) {
  store.useBoard.setState({
    agents: { groups: [], roles: [{ name: "Hermes", here: true, state: "not_running", mail: [], sessions: [], initiatives }] },
    roleOpen: "Hermes", openRole: () => undefined, openInitiative: () => undefined, openSlackThread: () => undefined,
  });
  return renderToStaticMarkup(<RoleDrawer />);
}

describe("D2: the drawer's initiatives are a list with no commas", () => {
  it("renders a ul with one link per initiative and no comma text", () => {
    const html = drawer(["organizer", "agent-slack", "camp"]);
    const list = html.match(/<ul class="rd-inits">(.*?)<\/ul>/)?.[1] ?? "";
    expect(list.match(/<li><a href="#" class="rd-init mono"[^>]*>[^<]+<\/a><\/li>/g)).toHaveLength(3);
    expect(list.replace(/<[^>]*>/g, "")).toBe("organizeragent-slackcamp");
    expect(list).not.toContain(",");
  });

  it("lays the list inline with an 8px gap and no bullets", () => {
    const rule = rolesCss.match(/\.rd-inits \{([^}]*)\}/)?.[1] ?? "";
    expect(rule).toMatch(/display: flex;/);
    expect(rule).toMatch(/gap: var\(--space-2\);/);
    expect(rule).toMatch(/list-style: none;/);
    expect(rolesCss).toMatch(/\.rd-init \{[^}]*padding-inline: 2px;/);
  });

  it("draws the 2px ring on the padding edge, inside the 8px gap", () => {
    expect(rolesCss).toMatch(/\.rd-init:focus-visible \{ outline: 2px solid var\(--focus-ring\); outline-offset: 0;/);
    const tokens = readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8") as string;
    expect(tokens).toMatch(/--space-2: 8px;/);
  });
});
