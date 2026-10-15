import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// leftovers-34 F5 (FR-2, Amendment 1): after the result, each busy control's
// focus lands on a named target, never the body. Vitest runs in Node with no
// DOM (Busy.controls.test says why), so a control is drawn by a server
// render whose `useState` and `useRef` calls are seeded by position (the
// refs are stand-in elements), the press runs against a fake call that
// resolves, and the result handler moves focus on the stand-ins. Where the
// move is an effect (a server render runs none), the effect's own exported
// function is driven: `landPosted` (new thread, branch), `landNewAgent`
// (New agent), `focusAfter` (Start's race). The heading after a queued
// Start is the live row F3.

const h = vi.hoisted(() => ({
  n: 0, r: 0,
  seeds: new Map<number, unknown>(),
  refs: new Map<number, unknown>(),
  trace: null as unknown[] | null,
  calls: [] as { busy: boolean; onPress: () => void }[],
  api: {} as Record<string, ReturnType<typeof vi.fn>>,
  draft: {} as Record<string, unknown>,
  state: {} as Record<string, unknown>,
  retireProps: null as null | { onClose: () => void },
}));

vi.mock("react", async (orig) => {
  const R = await orig<typeof import("react")>();
  function useState<T>(init: T | (() => T)) {
    const [v, set] = R.useState(init);
    const i = h.n++;
    return [h.seeds.has(i) ? (h.seeds.get(i) as T) : v, set] as const;
  }
  function useRef<T>(init: T) {
    const ref = R.useRef(init);
    const i = h.r++;
    h.trace?.push(i);
    if (h.refs.has(i)) ref.current = h.refs.get(i) as T;
    return ref;
  }
  return { ...R, default: { ...R, useState, useRef }, useState, useRef };
});

vi.mock("../lib/busy", async (orig) => {
  const real = await orig<typeof import("../lib/busy")>();
  return { ...real, busyButton: (o: { busy: boolean; onPress: () => void }) => { h.calls.push(o); return real.busyButton(o); } };
});

// Every api call resolves, unless a test sets its own.
vi.mock("../hooks/useWails", () => ({
  api: new Proxy({}, { get: (_t, name: string) => (h.api[name] ??= vi.fn(async () => ({}))) }),
}));

vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(h.state) : h.state), {
    getState: () => h.state,
    setState: (p: Record<string, unknown>) => Object.assign(h.state, p),
  });
  return { useBoard };
});

vi.mock("../lib/drafts", async (orig) => {
  const real = await orig<typeof import("../lib/drafts")>();
  return { ...real, useDraft: () => h.draft };
});

vi.mock("./Retire", async (orig) => {
  const real = await orig<typeof import("./Retire")>();
  return { ...real, Retire: (p: { onClose: () => void }) => { h.retireProps = p; return null; } };
});

const { Crew, focusAfter, startCrew } = await import("./Crew");
const { landNewAgent } = await import("./AgentsView");
const { RuleDecisionBox } = await import("./RuleDecisionBox");
const { MyNotes } = await import("./CardDrawer");
const { ReplyBox, NewThread, landPosted } = await import("./Conversation");

/** A stand-in document: focus() on an element makes it active; an element
 *  that leaves (`leave`) while active leaves the body active. */
type El = { name: string; isConnected: boolean; focus: () => void; leave: () => void; querySelector: (q: string) => El | null; contains: (x: unknown) => boolean };
function dom() {
  const body = { name: "BODY" };
  const doc = { activeElement: body as unknown, body };
  const el = (name: string, kids: Record<string, El> = {}): El => {
    const e: El = {
      name,
      isConnected: true,
      focus: () => { if (e.isConnected) doc.activeElement = e; },
      leave: () => { e.isConnected = false; if (doc.activeElement === e) doc.activeElement = body; },
      querySelector: (q: string) => kids[q] ?? null,
      contains: (x: unknown) => x === e || Object.values(kids).includes(x as El),
    };
    return e;
  };
  (globalThis as { document?: unknown }).document = doc;
  return { doc, body, el };
}

function seeded(node: React.ReactElement, seeds: Record<number, unknown> = {}, refs: Record<number, unknown> = {}) {
  h.n = 0; h.r = 0;
  h.seeds = new Map(Object.entries(seeds).map(([k, v]) => [Number(k), v]));
  h.refs = new Map(Object.entries(refs).map(([k, v]) => [Number(k), v]));
  h.calls = [];
  return renderToStaticMarkup(node);
}

/** The positions of a render's `useRef` calls, as seeds below were found. */
export function traceRefs(node: React.ReactElement) {
  h.trace = [];
  seeded(node);
  const t = h.trace.length;
  h.trace = null;
  return t;
}

const settle = () => new Promise((r) => setTimeout(r, 5));

const groupOf = () => ({
  id: "init-a",
  cell: { project: "p", state: "running", agents: ["po_a", "dev_b"], human: "pablo", reconciler: "po_a" },
  retirable: [], agents: [],
  crew: [
    { name: "po_a", session: "p-probe-a", agent: { state: "running", session: "p-probe-a", pid: 1, tty: "s001", uptime: "1m" } },
    { name: "dev_b", session: "p-probe-b" },
  ],
}) as never;

beforeEach(() => {
  for (const k of Object.keys(h.state)) delete h.state[k];
  for (const k of Object.keys(h.api)) delete h.api[k];
  h.draft = {};
  h.retireProps = null;
  (globalThis as { CSS?: unknown }).CSS = { escape: (s: string) => s };
  (globalThis as { window?: unknown }).window = { setTimeout, clearTimeout };
});

describe("F5: after the result, focus lands on a named target, never the body (leftovers-34 Amendment 1)", () => {
  it("Start, the race: the confirm goes and focus lands on the first seat's Attach", async () => {
    const { doc, body, el } = dom();
    const start = el("Start");
    const attach = el("Attach po_a");
    const box = { querySelector: (q: string) => (q.endsWith('button[aria-label^="Attach "]') ? attach : null) } as unknown as ParentNode;
    start.focus();
    await startCrew("init-a", {
      create: async () => ({ lines: [], running: [{ seat: "dev_b", session: "p-probe-b" }] }),
      queued: () => undefined,
      none: () => { start.leave(); focusAfter(box)?.focus(); },
      say: () => undefined,
      failed: () => undefined,
    });
    expect(doc.activeElement).toBe(attach);
    expect(doc.activeElement).not.toBe(body);
  });

  it("Start, queued: Start stays busy (Starting…) until the list is drawn, whose heading takes focus (F3 live)", async () => {
    h.state.clearAgentsLanding = () => undefined;
    let queued = false;
    await startCrew("init-a", { create: async () => ({ lines: ["l"], running: [] }), queued: () => { queued = true; }, none: () => undefined, say: () => undefined, failed: () => undefined });
    expect(queued).toBe(true);
    // asking 0, busy 1 (resolved: false), awaitList 2 (queued: true)
    const html = seeded(<Crew group={groupOf()} />, { 0: true, 1: false, 2: true });
    expect(html).toMatch(/<button class="tiny-btn primary" aria-disabled="true">Starting…<\/button>/);
  });

  it("New agent's Start: the pressed button's seat row once it runs", () => {
    const { doc, el } = dom();
    const busyBtn = el("Starting · 2 s");
    const row = el("organizer-probe-fox");
    busyBtn.focus();
    const page = { querySelector: (q: string) => (q === 'ul.agents > li[data-session="organizer-probe-fox"]' ? row : null) };
    expect(landNewAgent(page as never, "organizer-probe-fox")).toBe(true);
    expect(doc.activeElement).toBe(row);
    expect(landNewAgent({ querySelector: () => null } as never, "gone")).toBe(false);
  });

  it("the rule box's Rule: the record (its opener) once the ruling is written", async () => {
    const { doc, body, el } = dom();
    const opener = el("Rule 0007");
    const rule = el("Rule");
    Object.assign(h.state, { widthClass: "wide", refresh: async () => undefined, agents: { groups: [groupOf()] } });
    const dec = { number: "0007", title: "t", status: "proposed", options: ["a", "b"], owner: "pablo" } as never;
    seeded(<RuleDecisionBox initiative="init-a" decision={dec} opener={{ current: opener as never }} onClose={() => undefined} />, { 0: { chosen: "a", words: "because" } });
    rule.focus();
    h.calls[h.calls.length - 1].onPress();
    await settle();
    expect(h.api.ruleDecision).toHaveBeenCalledTimes(1);
    rule.leave(); // the ruled record leaves the queue, the box with it
    await settle();
    expect(doc.activeElement).toBe(opener);
    expect(doc.activeElement).not.toBe(body);
  });

  it("Retire's run: closing its report lands on the crew block's Retire…", async () => {
    const { doc, body, el } = dom();
    const retireBtn = el("Retire…");
    const close = el("Close");
    const box = el("crew", { 'button[data-crew="retire"]': retireBtn });
    h.state.clearAgentsLanding = () => undefined;
    // retiring is Crew's useState 5; box is its useRef 3, past useConfirmFocus's three.
    seeded(<Crew group={groupOf()} />, { 5: true }, { 3: box });
    expect(h.retireProps).not.toBeNull();
    close.focus();
    close.leave();
    h.retireProps!.onClose();
    await settle();
    expect(doc.activeElement).toBe(retireBtn);
    expect(doc.activeElement).not.toBe(body);
  });

  it("the comment Save: the comment field once saved", async () => {
    const { doc, body, el } = dom();
    const field = el("Comment on C");
    const save = el("Save · draft");
    const addNote = vi.fn(async () => undefined);
    Object.assign(h.state, { view: { order: { notes: {} } }, addNote, editNote: () => undefined, account: null, agents: { groups: [] } });
    h.draft = { text: "a comment" };
    const n = traceRefs(<MyNotes card={{ initiative_id: "init-a", slug: "c", title: "C" } as never} readOnly={null} />);
    expect(n).toBe(6); // two useImeEscape (two each), then field 4, save 5
    seeded(<MyNotes card={{ initiative_id: "init-a", slug: "c", title: "C" } as never} readOnly={null} />, {}, { 4: field, 5: save });
    save.focus();
    h.calls[h.calls.length - 1].onPress();
    await settle();
    expect(addNote).toHaveBeenCalledTimes(1);
    save.leave();
    expect(doc.activeElement).toBe(field);
    expect(doc.activeElement).not.toBe(body);
  });

  it("the docked Send: the reply field once sent", async () => {
    const { doc, body, el } = dom();
    const field = el("Message to dev_b");
    const send = el("Send · draft");
    h.draft = { body: "hello" };
    const box = () => <ReplyBox initiativeId="init-a" threadId="t1" subject="s" status="open" human="pablo" seats={["pablo", "dev_b"]} canPost wakesAll={2} defaultTo="dev_b" replyTo={null} onClearReply={() => undefined} onSent={() => undefined} />;
    const n = traceRefs(box());
    expect(n).toBe(4); // useImeEscape (two), then the field 2, sendBtn 3
    seeded(box(), {}, { 2: field, 3: send });
    send.focus();
    h.calls[h.calls.length - 1].onPress();
    await settle();
    expect(h.api.postToCell).toHaveBeenCalledTimes(1);
    send.leave(); // disabled now: the box is empty
    expect(doc.activeElement).toBe(field);
    expect(doc.activeElement).not.toBe(body);
  });

  for (const kind of ["new thread", "branch"] as const) {
    it(`a ${kind}: Send keeps focus until the thread is drawn, then its divider`, async () => {
      const { doc, body, el } = dom();
      const send = el("Sending…");
      const divider = el("Thread c: a subject, open");
      h.api.postToCell = vi.fn(async () => ({ thread_id: "t9" }));
      h.draft = { subject: "c: a subject", body: "hello", to: "dev_b" };
      const done = vi.fn();
      const quote = kind === "branch" ? ({ id: "m1", thread_id: "t1", from: "dev_b", kind: "question", body: "q" } as never) : undefined;
      seeded(<NewThread initiativeId="init-a" draftKey="k" seats={["dev_b"]} to="dev_b" quote={quote} onDone={done} />);
      send.focus();
      h.calls[h.calls.length - 1].onPress();
      await settle();
      expect(done).toHaveBeenCalledWith("t9");
      // Not drawn yet: the form stays, busy, with focus on its Send.
      const page = { getElementById: (id: string) => (drawn && id === "thread-t9" ? { querySelector: () => divider } : null) };
      let drawn = false;
      expect(landPosted(page as never, "t9")).toBe(false);
      expect(doc.activeElement).toBe(send);
      // The feed carries the thread: the divider takes focus, then the form goes.
      drawn = true;
      expect(landPosted(page as never, "t9")).toBe(true);
      send.leave();
      expect(doc.activeElement).toBe(divider);
      expect(doc.activeElement).not.toBe(body);
    });
  }
});
