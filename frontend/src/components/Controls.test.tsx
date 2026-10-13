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
  ({ id, client: "acme", project: id, agents: [], crew: [], threads: [], live: 0, working: 0, cell: cell ? { project: id, state: "in_definition" } : null });

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

/** The text of the element whose id is given, as a description reads it:
 *  the tags are balanced by name, the markup dropped, the spaces collapsed. */
function textOf(html: string, id: string): string {
  const at = html.indexOf(`id="${id}"`);
  if (at < 0) return "";
  const open = html.lastIndexOf("<", at);
  const tag = html.slice(open + 1).match(/^\w+/)![0];
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = open;
  let depth = 0, m: RegExpExecArray | null;
  while ((m = re.exec(html))) { depth += m[1] ? -1 : 1; if (depth === 0) break; }
  return html.slice(open, m ? m.index : html.length).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

const msg = { id: "m1", thread_id: "t1", subject: "lf24: the rail", kind: "decision", from: "pablo", to: "rk", body: "Do it.\nNext action: rk builds", created_at: Date.UTC(2026, 9, 13, 10) } as never;

describe("F1-F5 are buttons or links (leftovers-24)", () => {
  it("F1: an Agents group title is a plain button named Show only <id>, described by its facts", () => {
    const html = views(AgentsView);
    expect(html).toMatch(/<button type="button" class="agent-group-title" aria-label="Show only init-a" aria-describedby="([^"]+)"/);
    expect(html).toContain('aria-label="Show only init-b"');
    expect(html).not.toContain("aria-pressed");
    const id = html.match(/aria-label="Show only init-a" aria-describedby="([^"]+)"/)![1];
    const facts = html.match(new RegExp(`<span class="agent-group-title-facts" id="${id}">(.*?)</span></button>`))![1];
    expect(facts.replace(/<[^>]+>/g, "")).toMatch(/^0 agents · 0 live · 0 working · 0 seats (\S.* )?in definition$/);
  });

  it("FR-5: Conversations has no cell list (leftovers-25)", () => {
    expect(views(SlackView)).not.toMatch(/cell-row|class="cells"|Conversations of/);
    const src = readFileSync(new URL("./SlackView.tsx", import.meta.url), "utf8") as string;
    expect(src).not.toMatch(/cell-row|!selectedInitiative\)/);
  });

  it("F3: a person is a button named Chat with <seat>, current when shown, described by what it draws", () => {
    const seats = [{ name: "rk-build", watcher: "alive", agent: { state: "working", context: { window_size: 200000, used_percent: 42, input_tokens: 84000 } }, owes: [{ id: "t1" }] }, { name: "ds-build", watcher: "alive", deaf: true, undelivered: 3 }] as never;
    const html = renderToStaticMarkup(<People seats={seats} human="pablo" focus="ds-build" onFocus={() => undefined} onClose={() => undefined} />);
    expect(html).toMatch(/<button type="button" class="person [^"]*" aria-label="Chat with rk-build" aria-describedby="[^"]+"(?! aria-current)/);
    expect(html).toMatch(/<button type="button" class="person [^"]*active" aria-label="Chat with ds-build" aria-describedby="[^"]+" aria-current="true"/);
    const said = (seat: string) => html.match(new RegExp(`aria-label="Chat with ${seat}" aria-describedby="([^"]+)"`))![1]
      .split(" ").map((id) => textOf(html, id)).filter(Boolean).join(" | ");
    expect(said("rk-build")).toBe("session live, mail alive, owes 1 message, context 42%");
    expect(said("ds-build")).toBe("session off, mail deaf");
  });

  it("F4: a search hit is a button whose name starts with the subject", () => {
    const html = renderToStaticMarkup(<SearchHit m={msg} onOpen={() => undefined} />);
    expect(html).toMatch(/^<button type="button" class="hit"><span class="convo-subj">lf24: the rail<\/span>/);
  });

  it("F5: a ruling is a button named Open the thread <subject>, described by who ruled, when, the words, next", () => {
    const html = renderToStaticMarkup(<RulingButton dec={msg} subject="lf24: the rail" onOpen={() => undefined} />);
    expect(html).toMatch(/^<button type="button" class="q-ruling" title="open the thread" aria-label="Open the thread lf24: the rail" aria-describedby="([^"]+)">/);
    const id = html.match(/aria-describedby="([^"]+)"/)![1];
    const said = html.slice(html.indexOf(`<span id="${id}">`)).replace(/<[^>]+>/g, "");
    expect(said).toMatch(/^pablo ruled .+: Do it\. · next rk builds$/);
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
