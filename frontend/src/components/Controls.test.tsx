import { describe, expect, it, vi } from "vitest";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";

// leftovers-24 FR-1 to FR-5 (tab-reaches-links Amendment 1 §2, T6): each of
// F1-F5 is a button or a link with its name, and none of the three files
// keeps a span, li or div that answers a click.

// zustand answers a server render with the store's initial state, so the
// store is a plain object here that the tests set (as Rail.roving.test).
const store = vi.hoisted(() => {
  const state: Record<string, unknown> = {};
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), {
    getState: () => state,
    setState: (p: Record<string, unknown>) => Object.assign(state, p),
  });
  return { state, useBoard };
});
vi.mock("../stores/board.store", () => ({ useBoard: store.useBoard }));
const { AgentsView } = await import("./AgentsView");
const { SlackView, People } = await import("./SlackView");
const { SearchHit, RulingButton } = await import("./Conversation");

const group = (id: string, cell: boolean) =>
  ({ id, client: "acme", project: id, agents: [], crew: [], threads: [], cell: cell ? { project: id, state: "running" } : null });

function views(Component: () => React.ReactNode) {
  store.useBoard.setState({
    selectedInitiative: null, setSelectedInitiative: () => undefined, applyAgents: () => undefined,
    openSlack: () => undefined, agentFocus: null, clearAgentFocus: () => undefined,
    slackFocus: null, setSlackFocus: () => undefined, widthClass: "wide",
    view: { board: { initiatives: [], columns: {} }, order: {} },
    agents: { groups: [group("init-a", true), group("init-b", true)], unassigned: [] },
  });
  return renderToStaticMarkup(<Component />);
}

const msg = { id: "m1", thread_id: "t1", subject: "lf24: the rail", kind: "decision", from: "pablo", to: "rk", body: "Do it.\nNext action: rk builds", created_at: Date.UTC(2026, 9, 13, 10) } as never;

describe("F1-F5 are buttons or links (leftovers-24)", () => {
  it("F1: an Agents group title is a button, aria-pressed, named Show only <id>", () => {
    const html = views(AgentsView);
    expect(html).toMatch(/<button type="button" class="agent-group-title" aria-pressed="false" aria-label="Show only init-a"/);
    expect(html).toContain('aria-label="Show only init-b"');
  });

  it("F2: a Conversations cell row is a link named Conversations of <id>", () => {
    const html = views(SlackView);
    expect(html).toMatch(/<li><a class="cell-row ?" href="#init-a" aria-label="Conversations of init-a"/);
    expect(html).not.toMatch(/<li[^>]*class="cell-row/);
  });

  it("F3: a person is a button named Chat with <seat>, current when shown", () => {
    const seats = [{ name: "rk-build", watcher: "alive" }, { name: "ds-build", watcher: "alive" }] as never;
    const html = renderToStaticMarkup(<People seats={seats} human="pablo" focus="ds-build" onFocus={() => undefined} onClose={() => undefined} />);
    expect(html).toMatch(/<button type="button" class="person [^"]*" aria-label="Chat with rk-build"(?! aria-current)/);
    expect(html).toMatch(/<button type="button" class="person [^"]*active" aria-label="Chat with ds-build" aria-current="true"/);
  });

  it("F4: a search hit is a button whose name starts with the subject", () => {
    const html = renderToStaticMarkup(<SearchHit m={msg} onOpen={() => undefined} />);
    expect(html).toMatch(/^<button type="button" class="hit"><span class="convo-subj">lf24: the rail<\/span>/);
  });

  it("F5: a ruling is a button named Open the thread <subject>", () => {
    const html = renderToStaticMarkup(<RulingButton dec={msg} subject="lf24: the rail" onOpen={() => undefined} />);
    expect(html).toMatch(/^<button type="button" class="q-ruling" title="open the thread" aria-label="Open the thread lf24: the rail">/);
  });

  it("no span, li or div answers a click in the three files (T6, Amendment 1)", () => {
    const sites = ["AgentsView.tsx", "SlackView.tsx", "Conversation.tsx"].flatMap((f) =>
      (readFileSync(new URL(`./${f}`, import.meta.url), "utf8") as string).split("\n")
        .filter((l: string) => /<(span|li|div)\b[^>]*\bonClick=/.test(l))
        .map((l: string) => `${f}: ${l.trim().slice(0, 60)}`));
    expect(sites).toEqual([]);
  });

  it("the thread divider replies through a button named Reply into <subject>", () => {
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain('<div className="tl-divider" tabIndex={-1} role="group"');
    expect(src).toContain('<button type="button" className="tl-subj" aria-label={`Reply into ${subj}`}');
  });
});
