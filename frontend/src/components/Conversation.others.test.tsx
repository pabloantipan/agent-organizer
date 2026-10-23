import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AgentGroup, CellThread } from "../hooks/useWails";

// leftovers-47 FR-7 to FR-9 (review-view Amendment 12, R41): a direct chat
// with a name outside the roster (a supervisor) has a row under Others, a
// landing on it makes that row current at once, and the row leaves once the
// name has no open thread with the human and its chat is not shown. Vitest
// has no DOM: the list is rendered as markup, and what changes between
// renders is `othersOf` over one kept order.

vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
const state: Record<string, unknown> = { slackDraft: null, clearSlackDraft: () => undefined, applyAgents: () => undefined, view: null, setResolved: () => undefined, openCardLanding: () => undefined };
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { askedSeat, Conversation, othersOf, unlistedLanding } = await import("./Conversation");
const { SlackView } = await import("./SlackView");

const th = (id: string, o: Partial<CellThread>) => ({ id, subject: id, status: "open", kind: "question", participants: ["pablo"], opener: "pablo", to: "", age_seconds: 5, since_decision: 0, ...o }) as unknown as CellThread;
// sup87 has answered; aglaea was opened to and has not; sup9's is closed.
const sup87 = th("T-sup87", { participants: ["pablo", "sup87"], to: "sup87" });
const aglaea = th("T-aglaea", { to: "aglaea" });
const sup9 = th("T-sup9", { participants: ["pablo", "sup9"], to: "sup9", status: "closed" });
const mine = th("T-ru", { participants: ["pablo", "ru-build"], to: "ru-build" });
const groupOf = (threads: CellThread[]) => ({
  id: "init-a", human: "pablo", project: "organizer-fixture", can_post: false, discuss: "",
  cell: { agents: ["pablo", "ru-build"], reconciler: "" }, threads, waiting: [],
  crew: [{ name: "pablo" }, { name: "ru-build", deaf: true, agent: { state: "running" } }],
}) as unknown as AgentGroup;

/** The chat list as drawn: sub-labels and rows in order, a row as name and current. */
function list(html: string) {
  const nav = html.slice(html.indexOf('<nav class="chats">'), html.indexOf("</nav>"));
  return [...nav.matchAll(/<div class="chats-label sub"><span>([^<]*)<\/span>|<button([^>]*)class="chat[^"]*"[^>]*>([\s\S]*?)<\/button>/g)]
    .map((m) => (m[1] ? `# ${m[1]}` : `${/aria-current="true"/.test(m[2]) ? "*" : ""}${/<span class="chat-name">([^<]*)/.exec(m[3])?.[1]}`));
}
const others = (html: string) => { const l = list(html); const i = l.indexOf("# Others"); return i < 0 ? null : l.slice(i + 1, l.indexOf("# More")); };
const render = (threads: CellThread[], focus: string | null) => renderToStaticMarkup(<Conversation group={groupOf(threads)} focus={focus} onFocus={() => undefined} />);

describe("O1 (FR-7, FR-9): Others lists the names outside the roster with an open direct thread", () => {
  it("sup87 and aglaea in first-seen order, under People's seats, not sup9's closed one", () => {
    const h = render([mine, sup87, sup9, aglaea], null);
    expect(list(h)).toEqual(["needs me", "*channel", "# People", "ru-build", "# Others", "sup87", "aglaea", "# More", "journal", "archive"]);
    expect(h).toContain('<div class="chats-label sub"><span>Others</span></div>');
  });
  it("first seen is kept: a name seen first stays first whatever the feed's order", () => {
    const seen: string[] = [];
    expect(othersOf([aglaea, mine], "pablo", ["ru-build"], null, seen)).toEqual(["aglaea"]);
    expect(othersOf([sup87, aglaea, mine], "pablo", ["ru-build"], null, seen)).toEqual(["aglaea", "sup87"]);
  });
  it("each row is a seat's row: @, the name, the count, opening the direct chat; no health words", () => {
    const h = render([mine, sup87, aglaea], null);
    const row = /<button[^>]*title="direct with sup87"[^>]*>[\s\S]*?<\/button>/.exec(h)?.[0] ?? "";
    const seat = /<button[^>]*title="direct with ru-build"[^>]*>[\s\S]*?<\/button>/.exec(h)?.[0] ?? "";
    expect(row.replace(/sup87/g, "X")).toBe(seat.replace(/ru-build/g, "X"));
    expect(row).toMatch(/<span class="chat-(n|fresh)">1<\/span>/);
    for (const w of ["deaf", "capped", "live", "running", "not picking up"]) expect(row).not.toContain(w);
  });
  it("the People panel on the right has neither", () => {
    Object.assign(state, { agents: { groups: [groupOf([mine, sup87, aglaea])] }, selectedInitiative: "init-a", slackFocus: null, setSlackFocus: () => undefined, widthClass: "wide", reviewBack: null, backToReview: () => undefined });
    const h = renderToStaticMarkup(<SlackView />);
    const panel = h.slice(h.indexOf("</nav>"));
    expect(panel).toContain("Chat with ru-build");
    expect(panel).not.toContain("sup87");
    expect(panel).not.toContain("aglaea");
  });
  it("with no such thread the group is absent", () => {
    expect(others(render([mine, sup9], null))).toBeNull();
    expect(render([mine], null)).not.toContain("Others");
  });
});

describe("O2 (FR-8): an open naming sup87 draws its row at once", () => {
  it("before its thread is in the feed, sup87's row is under Others and the one current row on the first render", () => {
    const h = render([mine], "sup87");
    expect(others(h)).toEqual(["*sup87"]);
    expect(list(h).filter((r) => r.startsWith("*"))).toEqual(["*sup87"]);
    expect(h).toMatch(/<span class="chat-title">sup87<\/span>/);
  });
  it("the landing keeps sup87: the asked seat outside the roster moves nothing, and the listing lands it", () => {
    const log: string[] = [];
    let chat = "channel";
    const w = unlistedLanding({ show: (seat) => { chat = seat ? `seat:${seat}` : "channel"; log.push(`show ${chat}`); }, current: () => chat, land: (id) => log.push(`land ${id}`) });
    w.start("T-sup87", "sup87");
    w.asked(askedSeat([{ from: "pablo", to: "sup87" }], "pablo", ["ru-build"]));
    w.feed(["T-sup87"]);
    w.stop();
    expect(log).toEqual(["show seat:sup87", "land T-sup87"]);
  });
});

describe("O3 (FR-9): the row leaves once its thread closes, unless its chat is shown", () => {
  it("closed while another chat is shown: the row and the group go", () => {
    const seen: string[] = [];
    expect(othersOf([mine, sup87], "pablo", ["ru-build"], "ru-build", seen)).toEqual(["sup87"]);
    expect(othersOf([mine, { ...sup87, status: "closed" }], "pablo", ["ru-build"], "ru-build", seen)).toEqual([]);
    expect(othersOf([mine], "pablo", ["ru-build"], "ru-build", seen)).toEqual([]);
    expect(others(render([mine], "ru-build"))).toBeNull();
  });
  it("closed while its chat is shown: the row stays, current; it goes once another chat is shown", () => {
    const seen: string[] = [];
    expect(othersOf([mine, sup87], "pablo", ["ru-build"], "sup87", seen)).toEqual(["sup87"]);
    expect(othersOf([mine], "pablo", ["ru-build"], "sup87", seen)).toEqual(["sup87"]);
    expect(others(render([mine], "sup87"))).toEqual(["*sup87"]);
    expect(othersOf([mine], "pablo", ["ru-build"], null, seen)).toEqual([]);
  });
});
