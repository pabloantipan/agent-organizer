import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AgentGroup, CellThread } from "../hooks/useWails";
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";

// leftovers-41 FR-5 (R30): the chat list's current row is the chat shown,
// whoever showed it, a review's Open the thread included. Vitest has no
// DOM, so effects do not run: the landing's choice of chat (onFocus with
// the thread's direct seat) is read from the source and the chat it picks
// is rendered; the harness row presses Open the thread in WKWebView.

vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
vi.mock("../stores/board.store", () => {
  const state = { slackDraft: null, clearSlackDraft: () => undefined, applyAgents: () => undefined, view: null, setResolved: () => undefined, openCardLanding: () => undefined };
  return { useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) };
});
// useDraft reads browser storage through useSyncExternalStore, which markup
// rendering refuses without a server snapshot: no draft kept here.
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { askedSeat, Conversation, unlistedLanding } = await import("./Conversation");
const { LIST_WAIT_MS } = await import("../lib/listWait");

const thread = { id: "01THREAD", subject: "rv-fixture: review at 2bd87db", status: "open", kind: "question", posters: ["pablo"], opener: "pablo", to: "fse", age_seconds: 5, messages: 1 } as unknown as CellThread;
const group = {
  id: "init-a", human: "pablo", project: "organizer-fixture", can_post: false, discuss: "",
  cell: { agents: ["pablo", "fse", "po_ana"], reconciler: "po_ana" }, threads: [thread], crew: [], waiting: [],
} as unknown as AgentGroup;

/** Each chat row's name and whether it carries aria-current="true". */
function rows(html: string) {
  return [...html.matchAll(/<button([^>]*)class="chat[^"]*"[^>]*>[\s\S]*?<span class="chat-name">([^<]*)<\/span>/g)].map((m) => ({ name: m[2], current: /aria-current="true"/.test(m[1]) }));
}
const current = (html: string) => rows(html).filter((r) => r.current).map((r) => r.name);

describe("W5 (leftovers-41 FR-5, R30): the chat list marks the chat shown", () => {
  it("the landing on a thread picks its chat: onFocus with the thread's direct seat, else a view", () => {
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    const landing = src.slice(src.indexOf("if (slackDraft.threadId) {"));
    expect(landing).toMatch(/if \(t\) \{\s+const chat = chatOf\(t\);\s+if \(chat !== focus\) onFocus\(chat\);\s+if \(!chat\) setView\(/);
  });
  it("after openSlack with a thread direct with fse (the chat the landing shows), fse's row is current and channel is not", () => {
    const h = renderToStaticMarkup(<Conversation group={group} focus="fse" onFocus={() => undefined} />);
    expect(current(h)).toEqual(["fse"]);
    expect(rows(h).find((r) => r.name === "channel")?.current).toBe(false);
    expect(h).toMatch(/<span class="chat-title">fse<\/span>/);
  });
  it("with no seat shown, channel is current, and only one row is", () => {
    const h = renderToStaticMarkup(<Conversation group={group} focus={null} onFocus={() => undefined} />);
    expect(current(h)).toEqual(["channel"]);
    expect(rows(h).map((r) => r.name)).toEqual(["needs me", "needs po_ana", "channel", "fse", "po_ana", "journal", "archive"]);
  });
  it("every row's current follows the one chat key the timeline reads", () => {
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    for (const k of ['"needs"', '"reconciler"', '"channel"', 'chatKey(a, "channel")', '"journal"', '"archive"']) expect(src).toContain(`aria-current={chat === ${k} ? "true" : undefined}`);
  });
});

/** Each chat row's name, aria-current and selected fill (.active). */
function filled(html: string) {
  return [...html.matchAll(/<button([^>]*)class="(chat[^"]*)"[^>]*>[\s\S]*?<span class="chat-name">([^<]*)<\/span>/g)]
    .map((m) => ({ name: m[3], current: /aria-current="true"/.test(m[1]), fill: /\bactive\b/.test(m[2]) }));
}

describe("K4 (leftovers-44 FR-3, R38): Open the thread never lands on archive", () => {
  afterEach(() => { vi.useRealTimers(); });
  // the chat shown, as Conversation's chatKey reads it, moved by show
  const harness = () => {
    const log: string[] = [];
    let chat = "seat:po_ana";
    const w = unlistedLanding({ show: (seat) => { chat = seat ? `seat:${seat}` : "channel"; log.push(`show ${chat}`); }, current: () => chat, land: (id) => log.push(`land ${id}`) });
    return { log, w, move: (c: string) => { chat = c; }, chat: () => chat };
  };
  it("the seat asked: the first message from the human to a seat, else any to a seat; none, null", () => {
    const seats = ["fse", "po_ana"];
    expect(askedSeat([{ from: "pablo", to: "fse" }], "pablo", seats)).toBe("fse");
    expect(askedSeat([{ from: "po_ana", to: "*" }, { from: "pablo", to: "fse" }], "pablo", seats)).toBe("fse");
    expect(askedSeat([{ from: "po_ana", to: "fse" }], "pablo", seats)).toBe("fse");
    expect(askedSeat([{ from: "fse", to: "pablo" }, { from: "pablo", to: "" }], "pablo", seats)).toBeNull();
    expect(askedSeat([], "pablo", seats)).toBeNull();
  });
  it("not in the feed: channel at once, the asked seat's direct chat once known, the thread selected once listed; never archive", () => {
    const { log, w, chat } = harness();
    w.start("01THREAD");
    expect(chat()).toBe("channel");
    w.feed(["01OTHER"]);
    w.asked("fse");
    expect(chat()).toBe("seat:fse");
    w.feed(["01OTHER", "01THREAD"]);
    expect(log).toEqual(["show channel", "show seat:fse", "land 01THREAD"]);
    expect(log.join(" ")).not.toContain("archive");
    // listed again later: nothing moves
    w.feed(["01THREAD"]);
    expect(log).toHaveLength(3);
  });
  it("no seat named: it stays on channel and lands there", () => {
    const { log, w } = harness();
    w.start("01THREAD");
    w.asked(null);
    w.feed(["01THREAD"]);
    expect(log).toEqual(["show channel", "land 01THREAD"]);
  });
  it("Pablo moves first: not selected, and the seat's chat does not take him back", () => {
    const a = harness();
    a.w.start("01THREAD");
    a.move("journal");
    a.w.asked("fse");
    a.w.feed(["01THREAD"]);
    expect(a.log).toEqual(["show channel"]);
    expect(a.chat()).toBe("journal");
    const b = harness();
    b.w.start("01THREAD");
    b.w.asked("fse");
    b.move("seat:po_ana");
    b.w.feed(["01THREAD"]);
    expect(b.log).toEqual(["show channel", "show seat:fse"]);
  });
  it("past LIST_WAIT_MS the chat it showed stands and a later listing moves nothing", () => {
    vi.useFakeTimers();
    const { log, w } = harness();
    w.start("01THREAD");
    w.asked("fse");
    vi.advanceTimersByTime(LIST_WAIT_MS + 1);
    w.feed(["01THREAD"]);
    expect(log).toEqual(["show channel", "show seat:fse"]);
  });
  it("the landing reads the thread's messages for the seat and never names archive", () => {
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    const landing = src.slice(src.indexOf("if (slackDraft.threadId) {"), src.indexOf("if (slackDraft.subject !== undefined)"));
    expect(landing).not.toContain("archive\"");
    expect(landing).toContain("unlisted.start(id, focus);");
    expect(landing).toContain("api.getCellThread(initiativeId, id).then((v) => unlisted.asked(askedSeat(v.messages ?? [], human, seats)), () => undefined);");
  });
  it("the thread not yet listed, on the asked seat's chat: that row is current and has the fill; channel and archive have neither", () => {
    const empty = { ...group, threads: [] } as unknown as AgentGroup;
    const h = filled(renderToStaticMarkup(<Conversation group={empty} focus="fse" onFocus={() => undefined} />));
    expect(h.filter((r) => r.current).map((r) => r.name)).toEqual(["fse"]);
    expect(h.filter((r) => r.fill).map((r) => r.name)).toEqual(["fse"]);
    expect(h.find((r) => r.name === "archive")).toEqual({ name: "archive", current: false, fill: false });
    // on channel (no seat named): the same row carries both
    const c = filled(renderToStaticMarkup(<Conversation group={empty} focus={null} onFocus={() => undefined} />));
    expect(c.filter((r) => r.current).map((r) => r.name)).toEqual(["channel"]);
    expect(c.filter((r) => r.fill).map((r) => r.name)).toEqual(["channel"]);
  });
});

describe("W2 (leftovers-46 FR-5; Amendment 10 AS3, R38 amended): Open the thread lands on the asked seat's chat at once", () => {
  it("the landing starts on the seat it was opened with: channel is never shown, and the thread is selected once listed", () => {
    const log: string[] = [];
    let chat = "seat:sup87";
    const w = unlistedLanding({ show: (seat) => { chat = seat ? `seat:${seat}` : "channel"; log.push(`show ${chat}`); }, current: () => chat, land: (id) => log.push(`land ${id}`) });
    w.start("01THREAD", "sup87");
    expect(chat).toBe("seat:sup87");
    w.asked("sup87");
    w.feed(["01THREAD"]);
    expect(log).toEqual(["show seat:sup87", "land 01THREAD"]);
    expect(log.join(" ")).not.toContain("channel");
  });
  it("no seat known: channel, as A9 had it", () => {
    const log: string[] = [];
    let chat = "seat:po_ana";
    const w = unlistedLanding({ show: (seat) => { chat = seat ? `seat:${seat}` : "channel"; log.push(`show ${chat}`); }, current: () => chat, land: (id) => log.push(`land ${id}`) });
    w.start("01THREAD", null);
    w.feed(["01THREAD"]);
    expect(log).toEqual(["show channel", "land 01THREAD"]);
  });
  it("the first render with the seat openSlack was given: that seat's row is current, channel is not; the landing starts there", () => {
    const empty = { ...group, threads: [] } as unknown as AgentGroup;
    const h = renderToStaticMarkup(<Conversation group={empty} focus="fse" onFocus={() => undefined} />);
    expect(current(h)).toEqual(["fse"]);
    expect(rows(h).find((r) => r.name === "channel")?.current).toBe(false);
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    expect(src).toContain("unlisted.start(id, focus);");
  });
});
