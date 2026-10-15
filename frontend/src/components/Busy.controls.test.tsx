import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

// leftovers-34 F2 (FR-2, launch-progress L27): each of the seven controls
// that waits on the service follows the busy rule, with a pending fake
// call. Vitest runs in Node with no DOM (a DOM library would change
// package.json, outside the card's boundary), so:
// - a control is drawn by a server render; its busy and open states are
//   React state, seeded by the order of its `useState` calls (`seeded`),
//   since a server render runs no click. A changed order fails here loudly:
//   the control is not found.
// - the press is the props the control handed `busyButton` (recorded), run
//   against the pending fake; the render after it is the busy markup.
// - focus is the stand-in of busy.test: a button that turns `disabled`
//   while focused drops focus to the body, as WebKit does.
// The live press in WKWebView is F3.

const h = vi.hoisted(() => ({
  n: 0,
  seeds: new Map<number, unknown>(),
  trace: null as unknown[] | null,
  calls: [] as { busy: boolean; disabled?: boolean; onPress: () => void }[],
  pending: new Map<string, ReturnType<typeof vi.fn>>(),
  draft: {} as Record<string, unknown>,
  state: {} as Record<string, unknown>,
}));

vi.mock("react", async (orig) => {
  const R = await orig<typeof import("react")>();
  function useState<T>(init: T | (() => T)) {
    const [v, set] = R.useState(init);
    const i = h.n++;
    h.trace?.push(typeof init === "function" ? "fn" : init);
    return [h.seeds.has(i) ? (h.seeds.get(i) as T) : v, set] as const;
  }
  return { ...R, default: { ...R, useState }, useState };
});

vi.mock("../lib/busy", async (orig) => {
  const real = await orig<typeof import("../lib/busy")>();
  return {
    ...real,
    busyButton: (o: { busy: boolean; disabled?: boolean; onPress: () => void }) => { h.calls.push(o); return real.busyButton(o); },
  };
});

// A call the service never answers, per api function.
const never = (name: string) => {
  const f = vi.fn(() => new Promise(() => undefined));
  h.pending.set(name, f);
  return f;
};
vi.mock("../hooks/useWails", () => ({
  api: new Proxy({}, { get: (_t, name: string) => h.pending.get(name) ?? never(name) }),
}));

vi.mock("../stores/board.store", () => {
  const useBoard = Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(h.state) : h.state), {
    getState: () => h.state,
    setState: (p: Record<string, unknown>) => Object.assign(h.state, p),
  });
  return { useBoard };
});

// useDraft is a useSyncExternalStore with no server snapshot: the draft is
// set here instead.
vi.mock("../lib/drafts", async (orig) => {
  const real = await orig<typeof import("../lib/drafts")>();
  return { ...real, useDraft: () => h.draft };
});

const { Crew } = await import("./Crew");
const { DraftCell, NewAgent } = await import("./AgentsView");
const { RuleDecisionBox } = await import("./RuleDecisionBox");
const { Retire } = await import("./Retire");
const { MyNotes } = await import("./CardDrawer");
const { ReplyBox, NewThread } = await import("./Conversation");

const real = await vi.importActual<typeof import("../lib/busy")>("../lib/busy");

/** A stand-in button and document (as busy.test's): a button that turns
 *  `disabled` while focused drops focus to the body; aria-disabled keeps it. */
function standIn(label: string) {
  const body = { tag: "body" };
  const doc = { activeElement: body as unknown, body };
  const el = {
    label,
    attrs: {} as Record<string, unknown>,
    focus: () => { if (!el.attrs.disabled) doc.activeElement = el; },
    apply: (p: Record<string, unknown>) => {
      el.attrs = p;
      if (p.disabled && doc.activeElement === el) doc.activeElement = body;
    },
  };
  return { doc, el };
}

/** Renders with the `useState` calls at the given positions seeded. */
function seeded(node: React.ReactElement, seeds: Record<number, unknown> = {}) {
  h.n = 0;
  h.seeds = new Map(Object.entries(seeds).map(([k, v]) => [Number(k), v]));
  h.calls = [];
  return renderToStaticMarkup(node);
}

/** The initial values of the render's `useState` calls, in order: how the
 *  seeds below were found. */
export function traceStates(node: React.ReactElement) {
  h.trace = [];
  seeded(node);
  const t = h.trace;
  h.trace = null;
  return t;
}

/** The button whose visible text ends with `text`, and its attributes. */
function buttonOf(html: string, text: string) {
  const re = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;
  for (let m: RegExpExecArray | null; (m = re.exec(html));) {
    const label = m[2].replace(/<[^>]+>/g, "").trim();
    if (label === text) {
      const attrs: Record<string, string | true> = {};
      for (const a of m[1].matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attrs[a[1]] = a[2] ? a[2] : true; // a bare or empty attribute is present
      return { label, attrs };
    }
  }
  return null;
}

/** One control under the rule: drawn idle with focus, pressed against the
 *  pending fake, drawn busy. */
function check(o: {
  idle: () => string; busy: () => string; label: string; gerund: string; call: string;
  /** the recorded busyButton call that is this control (default the last) */
  pick?: (calls: typeof h.calls) => (typeof h.calls)[number];
}) {
  const pick = o.pick ?? ((c) => c[c.length - 1]);
  const idleHtml = o.idle();
  const idle = buttonOf(idleHtml, o.label);
  expect(idle, `${o.label} drawn`).not.toBeNull();
  const press = pick(h.calls);
  const { doc, el } = standIn(o.label);
  el.apply(idle!.attrs);
  el.focus();
  expect(doc.activeElement).toBe(el);
  const call = h.pending.get(o.call) ?? never(o.call);
  call.mockClear();
  press.onPress();
  expect(call).toHaveBeenCalledTimes(1);
  const busyHtml = o.busy();
  const busy = buttonOf(busyHtml, o.gerund);
  expect(busy, `${o.gerund} drawn`).not.toBeNull();
  expect(busy!.attrs["aria-disabled"]).toBe("true");
  expect(busy!.attrs.disabled).toBeUndefined();
  el.apply(busy!.attrs);
  expect(doc.activeElement).toBe(el);
  expect(doc.activeElement).not.toBe(doc.body);
  // A press while busy goes nowhere.
  const again = pick(h.calls);
  expect(again.busy).toBe(true);
  real.busyButton(again).onClick();
  expect(call).toHaveBeenCalledTimes(1);
}

beforeEach(() => {
  for (const k of Object.keys(h.state)) delete h.state[k];
  h.draft = {};
  (globalThis as { CSS?: unknown }).CSS = { escape: (s: string) => s };
});
afterEach(() => { h.seeds = new Map(); });

const groupOf = () => ({
  id: "init-a",
  cell: { project: "p", state: "running", agents: ["po_a", "dev_b"], human: "pablo", reconciler: "po_a" },
  retirable: [],
  agents: [],
  crew: [
    { name: "po_a", session: "p-probe-a", agent: { state: "running", session: "p-probe-a", pid: 1, tty: "s001", uptime: "1m" } },
    { name: "dev_b", session: "p-probe-b" },
  ],
}) as never;

// The positions of each control's `useState` calls (traceStates):
// Crew: asking 0, busy 1. DraftCell: asking 1, busy 2. RuleDecisionBox: its
// own chosen and words 0, busy 1. Retire: plan 6, busy 8. MyNotes: busy 2.
// ReplyBox: busy 2. NewThread: busy 3.
const words = { chosen: "a", words: "because" };
const plan = { keep: ["po_a"], sessions: [], threads: [], tokens: [], files: [], problems: [] };
export const SEEDS = {
  crewIdle: { 0: true }, crewBusy: { 0: true, 1: true },
  draftIdle: { 1: true }, draftBusy: { 1: true, 2: true },
  ruleIdle: { 0: words }, ruleBusy: { 0: words, 1: true },
  retireIdle: { 6: plan }, retireBusy: { 6: plan, 8: true },
  notesBusy: { 2: true }, replyBusy: { 2: true }, newBusy: { 3: true },
};

describe("F2: every control that waits on the service keeps focus (leftovers-34 FR-2)", () => {
  it("Crew's Start: Starting…, aria-disabled, focus kept while CreateCrew is pending", () => {
    h.state.agentsLanding = null;
    h.state.clearAgentsLanding = () => undefined;
    h.state.openDecision = () => undefined;
    check({
      idle: () => seeded(<Crew group={groupOf()} />, SEEDS.crewIdle),
      busy: () => seeded(<Crew group={groupOf()} />, SEEDS.crewBusy),
      label: "Start", gerund: "Starting…", call: "createCrew",
    });
  });

  it("Draft the cell's Open: Opening…, focus kept while DraftCell is pending", () => {
    h.state.view = {};
    check({
      idle: () => seeded(<DraftCell initiativeId="init-a" />, SEEDS.draftIdle),
      busy: () => seeded(<DraftCell initiativeId="init-a" />, SEEDS.draftBusy),
      label: "Open", gerund: "Opening…", call: "draftCell",
    });
  });

  it("New agent's Start: Starting…, focus kept while CreateAgent is pending, a second press starts nothing (Amendment 1)", () => {
    Object.assign(h.state, { applyAgents: () => undefined, agents: { groups: [], launches: [] } });
    // open 0, name 1, note 2, target 3, useLiveRegion 4-5, useNow 6, starting 7
    check({
      idle: () => seeded(<NewAgent initiativeId="init-a" />, { 0: true }),
      busy: () => seeded(<NewAgent initiativeId="init-a" />, { 0: true, 7: true }),
      label: "Start", gerund: "Starting…", call: "createAgent",
    });
  });

  it("the rule box's Rule: Ruling…, focus kept while RuleDecision is pending", () => {
    Object.assign(h.state, { widthClass: "wide", refresh: async () => undefined, agents: { groups: [groupOf()] } });
    const dec = { number: "0007", title: "t", status: "proposed", options: ["a", "b"], owner: "pablo" } as never;
    const box = () => <RuleDecisionBox initiative="init-a" decision={dec} onClose={() => undefined} />;
    check({
      idle: () => seeded(box(), SEEDS.ruleIdle),
      busy: () => seeded(box(), SEEDS.ruleBusy),
      label: "Rule", gerund: "Ruling…", call: "ruleDecision",
    });
  });

  it("the rule box's words stay focusable while ruling: readonly, never disabled (Amendment 1, U3)", () => {
    Object.assign(h.state, { widthClass: "wide", refresh: async () => undefined, agents: { groups: [groupOf()] } });
    const dec = { number: "0007", title: "t", status: "proposed", options: ["a", "b"], owner: "pablo" } as never;
    const html = seeded(<RuleDecisionBox initiative="init-a" decision={dec} onClose={() => undefined} />, SEEDS.ruleBusy);
    const ta = html.match(/<textarea\b[^>]*>/)![0];
    expect(ta).toMatch(/\breadOnly=""|\breadonly=""/);
    expect(ta).not.toMatch(/\bdisabled/);
  });

  it("Retire's run: Retiring…, focus kept while Retire is pending", () => {
    const r = () => <Retire group={groupOf()} onClose={() => undefined} />;
    check({
      idle: () => seeded(r(), SEEDS.retireIdle),
      busy: () => seeded(r(), SEEDS.retireBusy),
      label: "Retire", gerund: "Retiring…", call: "retire",
    });
  });

  it("the card back's comment save: Saving…, focus kept while AddNote is pending", () => {
    const addNote = vi.fn(() => new Promise(() => undefined));
    h.pending.set("addNote", addNote);
    Object.assign(h.state, { view: { order: { notes: {} } }, addNote, editNote: () => undefined, account: null, agents: { groups: [] } });
    h.draft = { text: "a comment" };
    const n = () => <MyNotes card={{ initiative_id: "init-a", slug: "c", title: "C" } as never} readOnly={null} />;
    check({
      idle: () => seeded(n()),
      busy: () => seeded(n(), SEEDS.notesBusy),
      label: "Save · draft", gerund: "Saving…", call: "addNote",
    });
  });

  it("Conversations' Send in the docked box: Sending…, focus kept while PostToCell is pending", () => {
    h.draft = { body: "hello" };
    const b = () => <ReplyBox initiativeId="init-a" threadId="t1" subject="s" status="open" human="pablo" seats={["pablo", "dev_b"]} canPost wakesAll={2} defaultTo="dev_b" replyTo={null} onClearReply={() => undefined} onSent={() => undefined} />;
    check({
      idle: () => seeded(b()),
      busy: () => seeded(b(), SEEDS.replyBusy),
      label: "Send · draft", gerund: "Sending…", call: "postToCell",
    });
  });

  it("Conversations' Send in a new thread (Start): Sending…, focus kept while PostToCell is pending", () => {
    h.draft = { subject: "c: a subject", body: "hello", to: "dev_b" };
    const t = () => <NewThread initiativeId="init-a" draftKey="k" seats={["dev_b"]} to="dev_b" onDone={() => undefined} />;
    check({
      idle: () => seeded(t()),
      busy: () => seeded(t(), SEEDS.newBusy),
      label: "Start · draft", gerund: "Sending…", call: "postToCell",
    });
  });

  it("a control disabled for another reason keeps disabled: Send with no body", () => {
    h.draft = {};
    const html = seeded(<ReplyBox initiativeId="init-a" threadId="t1" subject="s" status="open" human="pablo" seats={["pablo", "dev_b"]} canPost wakesAll={2} defaultTo="dev_b" replyTo={null} onClearReply={() => undefined} onSent={() => undefined} />);
    const send = buttonOf(html, "Send");
    expect(send!.attrs.disabled).toBe(true);
    expect(send!.attrs["aria-disabled"]).toBeUndefined();
  });
});

