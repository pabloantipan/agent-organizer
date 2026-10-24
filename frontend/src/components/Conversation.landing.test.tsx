// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AgentGroup, CellThread } from "../hooks/useWails";

// leftovers-48 L1 to L3 (review-view Amendment 13, R42 to R44): a landing
// scrolls the chat list's current row into view and a pick in the list does
// not, state fills switch with no transition, and the new-thread picker
// lists the chat list's Others. Vitest runs in Node with no DOM library, so
// the list is a stand-in row handed to `rowReveal`, the stylesheet is read
// as text, and the picker is a server render.

vi.mock("../hooks/useWails", () => ({ api: new Proxy({}, { get: () => vi.fn(async () => ({})) }) }));
const state: Record<string, unknown> = { slackDraft: null, clearSlackDraft: () => undefined, applyAgents: () => undefined, view: null, setResolved: () => undefined, openCardLanding: () => undefined };
vi.mock("../stores/board.store", () => ({ useBoard: Object.assign((sel?: (s: unknown) => unknown) => (sel ? sel(state) : state), { getState: () => state, setState: () => undefined }) }));
vi.mock("../lib/drafts", async (orig) => ({ ...(await orig<typeof import("../lib/drafts")>()), useDraft: () => undefined, useDrafts: () => new Set<string>() }));

const { Conversation, NewThread, rowReveal } = await import("./Conversation");

/** A chat-list row as far as a landing can touch it. */
const row = () => ({ scrollIntoView: vi.fn(), focus: vi.fn() });

describe("L1: a landing shows its row, a pick in the list does not scroll", () => {
  it("a landing on a row scrolls it into view once, nearest, never smooth, focus untouched", () => {
    const r = rowReveal();
    r.current("channel", row());
    const sup10 = row();
    r.current("seat:sup10", sup10);
    expect(sup10.scrollIntoView).toHaveBeenCalledTimes(1);
    expect(sup10.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
    expect(sup10.scrollIntoView.mock.calls[0][0]).not.toHaveProperty("behavior");
    expect(sup10.focus).not.toHaveBeenCalled();
    // The same row again (a re-render, the feed's tick) scrolls nothing more.
    r.current("seat:sup10", sup10);
    expect(sup10.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("a click on a row calls nothing; the next landing scrolls again", () => {
    const r = rowReveal();
    r.current("channel", row());
    const po = row();
    r.click("seat:po_ana");
    r.current("seat:po_ana", po);
    expect(po.scrollIntoView).not.toHaveBeenCalled();
    expect(po.focus).not.toHaveBeenCalled();
    const sup10 = row();
    r.current("seat:sup10", sup10);
    expect(sup10.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("a click on the row already current does not swallow a later landing", () => {
    const r = rowReveal();
    r.current("channel", row());
    r.click("channel");
    const sup10 = row();
    r.current("seat:sup10", sup10);
    expect(sup10.scrollIntoView).toHaveBeenCalledTimes(1);
  });

  it("every row of the list says it was picked there before it shows its chat", () => {
    const src = readFileSync(new URL("./Conversation.tsx", import.meta.url), "utf8") as string;
    const nav = src.slice(src.indexOf('<nav className="chats"'), src.indexOf("</nav>"));
    expect(nav.match(/onClick=\{\(\) => listPick\("(needs|reconciler|channel|journal|archive)"\)\}/g)?.length).toBe(5);
    expect(nav).not.toMatch(/onClick=\{\(\) => pick(Person)?\(/);
    expect(src).toMatch(/onClick=\{\(\) => \{ reveal\.click\(chatKey\(a, "channel"\)\); pickPerson\(a\); \}\}/);
  });
});

const css = readFileSync(new URL("../styles/global.css", import.meta.url), "utf8") as string;
/** Every rule as its selector list and body, comments dropped; a rule inside
 *  an @media block keeps only its own selectors. */
const rules = css.replace(/\/\*[^]*?\*\//g, "").split("}").map((chunk) => {
  const i = chunk.lastIndexOf("{");
  return i < 0 ? null : { sels: chunk.slice(0, i).split(",").map((s) => s.trim()), body: chunk.slice(i + 1) };
}).filter((r): r is { sels: string[]; body: string } => !!r);
/** The transition the last rule naming `sel` exactly sets, or null. */
const transitionOf = (sel: string) => {
  let t: string | null = null;
  for (const r of rules) if (r.sels.includes(sel)) { const m = /(?:^|;)\s*transition:\s*([^;]+)/.exec(r.body); if (m) t = m[1].trim(); }
  return t;
};

describe("L2: state fills switch with no transition, hover keeps its own", () => {
  // The fills named on the card: each a current or selected mark on a button.
  const fills: [base: string, on: string][] = [
    [".chat", ".chat.active"],
    ["button.person", "button.person.active"],
    [".strip-all", ".strip-all.active"],
    [".strip-item", ".strip-item.active"],
    [".tiny-btn[aria-pressed]", '.tiny-btn[aria-pressed="true"]'],
  ];
  it.each(fills)("%s: no transition on or off, hovered or not", (base, on) => {
    expect(transitionOf(on)).toBe("none");
    expect(transitionOf(`${on}:hover`)).toBe("none");
    // A transition is read from the style after the change: the fill leaving
    // eases unless the base drops it too.
    expect(transitionOf(base)).toBe("none");
  });
  it.each(fills)("%s:hover keeps the ease on background, border and colour", (base) => {
    const t = transitionOf(`${base}:hover`) ?? "";
    for (const p of ["background", "border-color", "color"]) expect(t).toMatch(new RegExp(`(^|, )${p} var\\(--dur-fast\\)`));
  });
  it("button keeps its transition", () => {
    const t = rules.find((r) => r.sels.length === 1 && r.sels[0] === "button")?.body ?? "";
    expect(t).toMatch(/transition: background var\(--dur-fast\) var\(--ease-out\), border-color var\(--dur-fast\) var\(--ease-out\), color var\(--dur-fast\) var\(--ease-out\)/);
  });
});

/** The recipient select's options and groups, in order. */
const recipients = (html: string) => {
  const sel = /<select[^>]*aria-label="Recipient"[^>]*>([^]*?)<\/select>/.exec(html)?.[1] ?? "";
  return [...sel.matchAll(/<optgroup label="([^"]*)">|<option value="([^"]*)"/g)].map((m) => (m[1] !== undefined ? `# ${m[1]}` : m[2]));
};

describe("L3: the new-thread picker lists Others", () => {
  it("Others [sup10]: an Others group holding sup10 after the roster", () => {
    const html = renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={["po_ana", "dev_bruno"]} others={["sup10"]} to="" onDone={() => undefined} />);
    expect(recipients(html)).toEqual(["", "po_ana", "dev_bruno", "# Others", "sup10"]);
  });
  it("Others [sup10] with sup10 the addressee: listed once, under Others", () => {
    const html = renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={["po_ana"]} others={["sup10"]} to="sup10" onDone={() => undefined} />);
    expect(recipients(html)).toEqual(["", "po_ana", "# Others", "sup10"]);
  });
  it("Others empty: no group", () => {
    const html = renderToStaticMarkup(<NewThread initiativeId="init-a" draftKey="k" seats={["po_ana", "dev_bruno"]} others={[]} to="" onDone={() => undefined} />);
    expect(recipients(html)).toEqual(["", "po_ana", "dev_bruno"]);
    expect(html).not.toContain("<optgroup");
  });

  const th = (id: string, o: Partial<CellThread>) => ({ id, subject: id, status: "open", kind: "question", participants: ["pablo"], opener: "pablo", to: "", age_seconds: 5, since_decision: 0, ...o }) as unknown as CellThread;
  const groupOf = (threads: CellThread[]) => ({
    id: "init-a", human: "pablo", project: "organizer-fixture", can_post: true, discuss: "",
    cell: { agents: ["pablo", "po_ana"], reconciler: "" }, threads, waiting: [], crew: [{ name: "pablo" }, { name: "po_ana" }],
  }) as unknown as AgentGroup;
  const docked = (threads: CellThread[], focus: string | null) => renderToStaticMarkup(<Conversation group={groupOf(threads)} focus={focus} onFocus={() => undefined} />);

  it("the docked form offers what the chat list's Others shows at that moment", () => {
    const sup10 = th("T-sup10", { participants: ["pablo", "sup10"], to: "sup10" });
    // The channel holds no thread (sup10's is direct), so the dock is the new-thread form.
    expect(recipients(docked([sup10], null))).toEqual(["", "po_ana", "# Others", "sup10"]);
    expect(recipients(docked([{ ...sup10, status: "closed" } as CellThread], null))).toEqual(["", "po_ana"]);
  });
});
