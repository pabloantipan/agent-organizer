// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readdirSync, readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AgentGroup, CellThread } from "../hooks/useWails";

// leftovers-48 L1 and L3 (review-view Amendment 13, R42 and R44): a landing
// scrolls the chat list's current row into view and a pick in the list does
// not, and the new-thread picker lists the chat list's Others; leftovers-51
// K4 (Amendment 15, R49): hover eases both ways, a state mark never eases. Vitest runs in Node with no DOM library, so
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
});

// Every stylesheet, global.css first: a mark in shell.css or usage.css that
// sets no transition rides button's from global.css (F2).
const dir = new URL("../styles/", import.meta.url);
const sheets = ["global.css", ...(readdirSync(dir) as string[]).filter((f) => f.endsWith(".css") && f !== "global.css").sort()];
const css = sheets.map((f) => readFileSync(new URL(f, dir), "utf8") as string).join("\n");
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

describe("K4 (leftovers-51 FR-4, supersedes leftovers-48 L2): hover eases in and out alike on button's base rule; a state mark has no transition, hover included", () => {
  const fills: [base: string, on: string, drawn?: string][] = [
    ["button.person", "button.person.active", ".person.active"],
    [".strip-all", ".strip-all.active"],
    [".strip-item", ".strip-item.active"],
    [".tiny-btn[aria-pressed]", '.tiny-btn[aria-pressed="true"]'],
    [".seg button", ".seg button.on"],
    [".subtabs button", ".subtabs button.on"],
    [".places .place-tab", ".places .place-tab.on"],
    [".gear", ".gear.on"],
    [".gear", ".gear.open"],
    [".stg", ".stg.current"],
    [".fl-row", ".fl-row.on"],
    [".week-list button", '.week-list button[aria-current="true"]'],
    [".ib-act .act", '.ib-act .act[aria-expanded="true"]'],
    [".ihead-details", '.ihead-details[aria-expanded="true"]'],
    [".memory button.memory-btn", '.memory button.memory-btn[aria-expanded="true"]', '.memory button.memory-btn[aria-expanded="true"]:not(.critical)'],
    [".ic-more", '.ic-more[aria-expanded="true"]'],
  ];
  const EASE = /^background var\(--dur-fast\) var\(--ease-out\), border-color var\(--dur-fast\) var\(--ease-out\), color var\(--dur-fast\) var\(--ease-out\)$/;
  it("the base button rule carries the 100 ms ease, and no later rule naming button alone replaces it", () => {
    expect(transitionOf("button")).toMatch(EASE);
    expect(css).toMatch(/--dur-fast:\s*100ms/);
  });
  it.each(fills)("%s:hover sets no transition of its own, so hover in and out both ride button's (%s)", (base) => {
    expect(transitionOf(base)).toBeNull();
    expect(transitionOf(`${base}:hover`)).toBeNull();
  });
  it.each(fills)("%s: the mark %s is a fill some stylesheet draws", (_base, on, drawn) => {
    expect(rules.some((r) => r.sels.includes(drawn ?? on) && /(^|;)\s*(background|color|border-color|box-shadow):/.test(r.body))).toBe(true);
  });
  it.each(fills)("%s → %s: transition none, hovered or not", (_base, on) => {
    expect(transitionOf(on)).toBe("none");
    expect(transitionOf(`${on}:hover`)).toBe("none");
  });
  // The chat row (Amendment 2, review-view A16, R43 and R49 amended): the
  // mark is its own layer, so a leaving mark is gone in the next frame and
  // hover eases the row's own background-color both ways on one curve.
  /** The value the last rule naming `sel` exactly gives `prop`, and that rule's index. */
  const declOf = (sel: string, prop: string) => {
    let v: string | null = null, at = -1;
    rules.forEach((r, i) => { if (!r.sels.includes(sel)) return; const m = new RegExp(`(?:^|;)\\s*${prop}:\\s*([^;]+)`).exec(r.body); if (m) { v = m[1].trim(); at = i; } });
    return { v: v as string | null, at };
  };
  it(".chat: hover eases the row's own background-color over 100 ms on --ease-out, in and out (R49 amended, C2)", () => {
    expect(transitionOf(".chat")).toBe("background-color var(--dur-fast) var(--ease-out)");
    expect(transitionOf(".chat:hover")).toBeNull();
    expect(declOf(".chat:hover", "background").v).toBe("var(--panel)");
    expect(css).not.toMatch(/\.chat[^{]*\{[^}]*--ease-exit/);
  });
  it(".chat.active: the fill and outline are a ::before under the content with no transition", () => {
    expect(declOf(".chat", "position").v).toBe("relative");
    expect(declOf(".chat", "z-index").v).toBe("0");
    const layer = ".chat.active::before";
    expect(declOf(layer, "content").v).toBe('""');
    expect(declOf(layer, "position").v).toBe("absolute");
    expect(declOf(layer, "inset").v).toBe("-1px");
    expect(declOf(layer, "z-index").v).toBe("-1");
    expect(declOf(layer, "background").v).toBe("var(--accent-soft)");
    expect(declOf(layer, "border").v).toBe("1px solid var(--border-accent)");
    expect(transitionOf(layer)).toBe("none");
  });
  it(".chat.active leaves the row's own background and border as the base has them, so the leaving row has no fill in the next frame (R43 amended)", () => {
    // Removing the class removes the layer, which no transition can hold;
    // the row's own properties do not change, so its transition runs nothing.
    expect(declOf(".chat.active", "background").v).toBe(declOf(".chat", "background").v);
    expect(declOf(".chat.active", "border-color").v).toBe("transparent");
    expect(declOf(".chat", "border").v).toBe("1px solid transparent");
    expect(rules.some((r) => r.sels.some((x) => /^\.chat(\.|:|$)/.test(x) && x !== ".chat.active::before") && /(?:^|;)\s*(background|border-color):\s*var\(--(accent-soft|border-accent)\)/.test(r.body))).toBe(false);
    expect(transitionOf(".chat.active")).toBe("none");
    expect(transitionOf(".chat.active:hover")).toBe("none");
  });
  it("on the current row the fill does not change on hover", () => {
    expect(declOf(".chat.active", "background").at).toBeGreaterThan(declOf(".chat:hover", "background").at);
    expect(declOf(".chat.active:hover", "background").v).toBeNull();
    expect(declOf(".chat.active::before", "background").at).toBeGreaterThan(-1);
    expect(rules.some((r) => r.sels.some((x) => x.startsWith(".chat") && x.includes(":hover") && x.includes("::before")))).toBe(false);
  });
  // The rail's row is a button (Rail.tsx folded and role rows) whose base
  // rule carries its own ease (global.css .rail-item, and the reduced-motion
  // block), so hover leaves as it came; its selected mark never eases.
  it(".rail-item → .rail-item.active: transition none, hovered or not; the base eases, its hover sets none of its own", () => {
    expect(rules.some((r) => r.sels.includes(".rail-item.active") && /(^|;)\s*background:/.test(r.body))).toBe(true);
    expect(transitionOf(".rail-item.active")).toBe("none");
    expect(transitionOf(".rail-item.active:hover")).toBe("none");
    expect(transitionOf(".rail-item")).toMatch(/^background /);
    expect(transitionOf(".rail-item:hover")).toBeNull();
  });
  it("disabled, by attribute or by aria, has no transition, hover included", () => {
    expect(transitionOf("button:disabled")).toBe("none");
    expect(transitionOf('button[aria-disabled="true"]:not(.na-busy)')).toBe("none");
    expect(transitionOf('button[aria-disabled="true"]:not(.na-busy):hover')).toBe("none");
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
