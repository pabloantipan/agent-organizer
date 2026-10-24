import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactElement, ReactNode } from "react";
import type { AgentGroup, CellThread } from "../hooks/useWails";

// leftovers-48 L1 (FR-1, review-view R42), driven through Conversation: a
// landing (the chat shown changes from outside the list: a review, a card,
// Message, the feed's later selection) scrolls the landed row into view once,
// nearest and instant, and moves no focus; a click on a row scrolls nothing.
// Vitest runs in Node with no DOM library, so Conversation is called as a
// function under stand-in hooks that keep state, refs and memos by position
// across calls and run its layout effects when their deps change, as React
// commits do. The tree it returns is walked for the chat list's rows; the
// list's ref is a stand-in nav that answers the effect's query with the row
// drawn current in that tree.

type Row = { name: string; current: boolean; onClick: () => void };
type Stand = { scrollIntoView: ReturnType<typeof vi.fn>; focus: ReturnType<typeof vi.fn> };
const h = vi.hoisted(() => ({
  i: 0,
  slots: [] as unknown[],
  layout: [] as { fn: () => void | (() => void); deps?: unknown[]; ran?: unknown[] }[],
  navRef: null as { current: unknown } | null,
}));

vi.mock("react", async (orig) => {
  const R = await orig<typeof import("react")>();
  const slot = <T,>(make: () => T): T => { const i = h.i++; if (!(i in h.slots)) h.slots[i] = make(); return h.slots[i] as T; };
  function useState<T>(init: T | (() => T)) {
    const i = h.i;
    const v = slot(() => (typeof init === "function" ? (init as () => T)() : init));
    // The chat list's ref is the one declared just before rowReveal's state.
    if (typeof init === "function" && (init as { name?: string }).name === "rowReveal") h.navRef = h.slots[i - 1] as { current: unknown };
    const set = (n: T | ((p: T) => T)) => { h.slots[i] = typeof n === "function" ? (n as (p: T) => T)(h.slots[i] as T) : n; };
    return [v, set] as const;
  }
  const useRef = <T,>(init: T) => slot(() => ({ current: init }));
  const useMemo = <T,>(make: () => T) => slot(make);
  const useCallback = <T,>(fn: T) => fn;
  const useId = () => slot(() => `id${h.i}`);
  const useEffect = () => undefined;
  function useLayoutEffect(fn: () => void | (() => void), deps?: unknown[]) {
    const i = h.i++;
    const prev = h.layout[i];
    h.layout[i] = { fn, deps, ran: prev?.ran };
  }
  const useSyncExternalStore = <T,>(_s: unknown, get: () => T) => get();
  const hooks = { useState, useRef, useMemo, useCallback, useId, useEffect, useLayoutEffect, useSyncExternalStore };
  return { ...R, ...hooks, default: { ...R, ...hooks } };
});
vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
const state: Record<string, unknown> = { slackDraft: null, clearSlackDraft: () => undefined, applyAgents: () => undefined, view: null, setResolved: () => undefined, openCardLanding: () => undefined };
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { Conversation } = await import("./Conversation");

const th = (id: string, o: Partial<CellThread>) => ({ id, subject: id, status: "open", kind: "question", participants: ["pablo"], opener: "pablo", to: "", age_seconds: 5, since_decision: 0, ...o }) as unknown as CellThread;
const group = {
  id: "init-a", human: "pablo", project: "organizer-fixture", can_post: false, discuss: "",
  cell: { agents: ["pablo", "po_ana", "dev_bruno"], reconciler: "" }, waiting: [], crew: [{ name: "pablo" }, { name: "po_ana" }, { name: "dev_bruno" }],
  threads: [th("T-sup10", { participants: ["pablo", "sup10"], to: "sup10" })],
} as unknown as AgentGroup;

const text = (n: ReactNode): string => (typeof n === "string" ? n : Array.isArray(n) ? n.map(text).join("") : n && typeof n === "object" && "props" in n ? text((n as ReactElement<{ children?: ReactNode }>).props.children) : "");
/** The chat list's rows in the tree Conversation returned. */
function rowsOf(tree: ReactNode): Row[] {
  const out: Row[] = [];
  let inNav = false;
  const walk = (n: ReactNode) => {
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (!n || typeof n !== "object" || !("props" in n)) return;
    const el = n as ReactElement<Record<string, unknown> & { children?: ReactNode }>;
    if (typeof el.type !== "string") return;
    const was = inNav;
    if (el.type === "nav" && el.props.className === "chats") inNav = true;
    if (inNav && el.type === "button" && /^chat\b/.test(String(el.props.className ?? ""))) {
      const name = [el.props.children].flat(3).find((c): c is ReactElement<{ className?: string; children?: ReactNode }> => !!c && typeof c === "object" && "props" in c && (c as ReactElement<{ className?: string }>).props.className === "chat-name");
      out.push({ name: name ? text(name.props.children) : "", current: el.props["aria-current"] === "true", onClick: el.props.onClick as () => void });
    } else walk(el.props.children);
    inNav = was;
  };
  walk(tree);
  return out;
}

let rows: Row[] = [];
const stands = new Map<string, Stand>();
const stand = (name: string) => { if (!stands.has(name)) stands.set(name, { scrollIntoView: vi.fn(), focus: vi.fn() }); return stands.get(name)!; };
const focusCalls: (string | null)[] = [];
/** One render and commit: call Conversation, then run each layout effect
 *  whose deps changed since it last ran, the list's ref standing for the nav. */
function commit(focus: string | null) {
  h.i = 0;
  const tree = Conversation({ group, focus, onFocus: (a) => { focusCalls.push(a); } });
  rows = rowsOf(tree);
  if (h.navRef) h.navRef.current = { querySelector: (q: string) => (q === '.chat[aria-current="true"]' ? (() => { const r = rows.find((x) => x.current); return r ? stand(r.name) : null; })() : null) };
  for (const e of h.layout) {
    if (!e) continue;
    if (e.deps && e.ran && e.deps.length === e.ran.length && e.deps.every((d, k) => Object.is(d, e.ran![k]))) continue;
    e.fn();
    e.ran = e.deps;
  }
}
const scrolls = () => [...stands].flatMap(([name, s]) => s.scrollIntoView.mock.calls.map((c) => [name, c[0]]));
const focused = () => [...stands.values()].some((s) => s.focus.mock.calls.length > 0);

beforeEach(() => { h.slots = []; h.layout = []; h.navRef = null; stands.clear(); focusCalls.length = 0; });

describe("L1 through Conversation: a landing shows its row, a click scrolls nothing", () => {
  it("a landing on sup10 under Others scrolls that row once, nearest, never smooth, focus untouched", () => {
    commit(null);
    expect(rows.find((r) => r.current)?.name).toBe("channel");
    stands.clear();
    // Message, a review's Open the thread or a card: the store's focus moves.
    commit("sup10");
    expect(rows.find((r) => r.current)?.name).toBe("sup10");
    expect(scrolls()).toEqual([["sup10", { block: "nearest" }]]);
    expect(focused()).toBe(false);
    // The feed's next tick redraws the same chat: nothing more.
    commit("sup10");
    expect(scrolls()).toHaveLength(1);
  });

  it("a click on a row in the list calls nothing; a landing after it scrolls again", () => {
    commit(null);
    stands.clear();
    rows.find((r) => r.name === "po_ana")!.onClick();
    expect(focusCalls).toEqual(["po_ana"]);
    commit("po_ana");
    expect(rows.find((r) => r.current)?.name).toBe("po_ana");
    expect(scrolls()).toEqual([]);
    rows.find((r) => r.name === "journal")!.onClick();
    commit(null);
    expect(rows.find((r) => r.current)?.name).toBe("journal");
    expect(scrolls()).toEqual([]);
    commit("sup10");
    expect(scrolls()).toEqual([["sup10", { block: "nearest" }]]);
    expect(focused()).toBe(false);
  });
});
