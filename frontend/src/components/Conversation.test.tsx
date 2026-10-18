import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
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

const { Conversation } = await import("./Conversation");

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
    expect(landing).toMatch(/const chat = t \? chatOf\(t\) : null;\s+if \(chat !== focus\) onFocus\(chat\);\s+if \(!chat\) setView\(/);
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
