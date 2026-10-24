import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AgentGroup, CellThread } from "../hooks/useWails";

// leftovers-51 K1 to K3 (review-view Amendment 15, R46 to R48): every
// composer lists recipients from one function, the Chats head sits outside
// the chat list's scroller, and a click on a row the list cuts reveals it.
// Vitest runs in Node with no DOM library, so the composers are server
// renders and the rows are stand-ins handed to `rowReveal`.

vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
const state: Record<string, unknown> = { slackDraft: null, clearSlackDraft: () => undefined, applyAgents: () => undefined, view: null, setResolved: () => undefined, openCardLanding: () => undefined };
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { Conversation, NewThread, ReplyBox, RuleBox, recipientsOf, rowReveal } = await import("./Conversation");

/** The recipient select's options and groups, in order. */
const recipients = (html: string) => {
  const sel = /<select[^>]*aria-label="Recipient"[^>]*>([^]*?)<\/select>/.exec(html)?.[1] ?? "";
  return [...sel.matchAll(/<optgroup label="([^"]*)">|<option value="([^"]*)"/g)].map((m) => (m[1] !== undefined ? `# ${m[1]}` : m[2]));
};

const seats = ["po_ana", "dev_bruno"];
const composers = {
  "new thread": (to: string) => renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={seats} others={["sup10"]} to={to} onDone={() => undefined} />),
  "reply box": (to: string) => renderToStaticMarkup(<ReplyBox initiativeId="init-a" threadId="T-sup10" subject="s" status="open" human="pablo" seats={["pablo", ...seats]} others={["sup10"]} canPost wakesAll={2} defaultTo={to} replyTo={null} onClearReply={() => undefined} onSent={() => undefined} />),
  "rule box": (to: string) => renderToStaticMarkup(<RuleBox seats={seats} others={["sup10"]} defaultTo={to} where="s" busy={false} err={null} onRule={() => undefined} onCancel={() => undefined} />),
};

describe("K1 (FR-1): one recipient list for every composer", () => {
  it("recipientsOf: the roster, then Others, then an addressee in neither, last under Others", () => {
    expect(recipientsOf(seats, ["sup10"], "")).toEqual({ roster: seats, others: ["sup10"] });
    expect(recipientsOf(seats, ["sup10"], "sup10")).toEqual({ roster: seats, others: ["sup10"] });
    expect(recipientsOf(seats, ["sup10"], "po_ana")).toEqual({ roster: seats, others: ["sup10"] });
    expect(recipientsOf(seats, ["sup10"], "ghost")).toEqual({ roster: seats, others: ["sup10", "ghost"] });
    expect(recipientsOf(seats, [], "ghost")).toEqual({ roster: seats, others: ["ghost"] });
    expect(recipientsOf(seats, [], "")).toEqual({ roster: seats, others: [] });
  });
  it.each(Object.entries(composers))("%s in sup10's chat: sup10 once, under Others, after the roster", (_name, render) => {
    expect(recipients(render("sup10"))).toEqual(["", "po_ana", "dev_bruno", "# Others", "sup10"]);
  });
  it.each(Object.entries(composers))("%s: an addressee in neither goes last under Others", (_name, render) => {
    expect(recipients(render("ghost"))).toEqual(["", "po_ana", "dev_bruno", "# Others", "sup10", "ghost"]);
  });
  it.each(Object.entries(composers))("%s: a roster addressee is not appended", (_name, render) => {
    expect(recipients(render("dev_bruno"))).toEqual(["", "po_ana", "dev_bruno", "# Others", "sup10"]);
  });

  const th = (id: string, o: Partial<CellThread>) => ({ id, subject: id, status: "open", kind: "question", participants: ["pablo"], opener: "pablo", to: "", age_seconds: 5, since_decision: 0, ...o }) as unknown as CellThread;
  const group = {
    id: "init-a", human: "pablo", project: "organizer-fixture", can_post: true, discuss: "",
    cell: { agents: ["pablo", ...seats], reconciler: "" }, waiting: [], crew: [{ name: "pablo" }, { name: "po_ana" }, { name: "dev_bruno" }],
    threads: [th("T-sup10", { participants: ["pablo", "sup10"], to: "sup10" })],
  } as unknown as AgentGroup;
  it("the docked composer in sup10's chat, drawn by Conversation, lists sup10 once under Others", () => {
    const html = renderToStaticMarkup(<Conversation group={group} focus="sup10" onFocus={() => undefined} />);
    expect(recipients(html)).toEqual(["", "po_ana", "dev_bruno", "# Others", "sup10"]);
  });
});

describe("K2 (FR-2): the Chats head sits outside the chat list's scroller", () => {
  const group = {
    id: "init-a", human: "pablo", project: "organizer-fixture", can_post: true, discuss: "",
    cell: { agents: ["pablo", ...seats], reconciler: "" }, waiting: [], crew: [], threads: [],
  } as unknown as AgentGroup;
  it("the label and + come before the scroller opens, and every row is inside it", () => {
    const html = renderToStaticMarkup(<Conversation group={group} focus={null} onFocus={() => undefined} />);
    const nav = html.slice(html.indexOf('<nav class="chats">'), html.indexOf("</nav>"));
    const rows = nav.indexOf('<div class="chats-rows">');
    expect(rows).toBeGreaterThan(0);
    const head = nav.slice(0, rows);
    expect(head).toMatch(/<div class="chats-label"><span>Chats<\/span>/);
    expect(head).toMatch(/<button class="rail-icon"[^>]*aria-label="new thread"/);
    const inside = nav.slice(rows);
    expect(inside).not.toContain("<span>Chats</span>");
    for (const name of ["needs me", "channel", "po_ana", "dev_bruno", "journal", "archive"]) expect(inside).toContain(`<span class="chat-name">${name}</span>`);
    expect(inside).toContain('class="cell-search"');
  });
});

/** A chat-list row with a box, as far as a click can touch it. */
const row = (top: number, height = 30) => ({ scrollIntoView: vi.fn(), focus: vi.fn(), getBoundingClientRect: () => ({ top, bottom: top + height }) as DOMRect });
const list = { getBoundingClientRect: () => ({ top: 100, bottom: 500 }) as DOMRect };

describe("K3 (FR-3): a click reveals a row the list cuts; a visible row does not move", () => {
  it("a row cut at the bottom: scrollIntoView nearest, instant, once; the commit after scrolls nothing more", () => {
    const r = rowReveal();
    r.current("channel", row(120));
    const cut = row(480);
    r.click("seat:sup10", cut, list);
    expect(cut.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(cut.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    expect(cut.scrollIntoView.mock.calls[0][0]).not.toHaveProperty("behavior");
    r.current("seat:sup10", cut);
    expect(cut.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(cut.focus).not.toHaveBeenCalled();
  });
  it("a row cut at the top is revealed the same way", () => {
    const r = rowReveal();
    const cut = row(85);
    r.click("journal", cut, list);
    expect(cut.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });
  it("a wholly visible row: no scroll, on the click or the commit", () => {
    const r = rowReveal();
    r.current("channel", row(120));
    const shown = row(300);
    r.click("seat:po_ana", shown, list);
    r.current("seat:po_ana", shown);
    expect(shown.scrollIntoView).not.toHaveBeenCalled();
  });
  it("rows touching the edges, within half a pixel, are not cut", () => {
    const r = rowReveal();
    const top = row(99.6);
    const bottom = row(470.4);
    r.click("a", top, list);
    r.click("b", bottom, list);
    expect(top.scrollIntoView).not.toHaveBeenCalled();
    expect(bottom.scrollIntoView).not.toHaveBeenCalled();
  });
});
