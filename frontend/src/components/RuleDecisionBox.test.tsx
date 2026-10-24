import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import fixture from "../../../testdata/questions/0037-big-picture-stage.md?raw";

// leftovers-49 Q4 (FR-2, FR-3): the rule box on a question record draws one
// radio group per question and rules with one pick per question. Vitest runs
// in Node with no DOM (Busy.controls.test says why), so the box is drawn by a
// server render with its draft held here (the `draft` prop, as Home keeps
// it), a click is the radio's own onChange, caught as the JSX is built, and
// the press of Rule is the props it handed `busyButton`.

const h = vi.hoisted(() => ({
  radios: new Map<string, () => void>(),
  calls: [] as { busy: boolean; disabled?: boolean; onPress: () => void }[],
  api: {} as Record<string, ReturnType<typeof vi.fn>>,
  state: {} as Record<string, unknown>,
}));

// A radio's onChange, by its group and value: the click. Vitest builds the
// JSX with the dev runtime.
vi.mock("react/jsx-dev-runtime", async (orig) => {
  const R = await orig<typeof import("react/jsx-dev-runtime")>();
  return {
    ...R,
    jsxDEV: (type: unknown, props: Record<string, unknown>, ...rest: unknown[]) => {
      if (type === "input" && props.type === "radio") h.radios.set(`${props.name}=${props.value}`, props.onChange as () => void);
      return (R.jsxDEV as (...a: unknown[]) => unknown)(type, props, ...rest);
    },
  };
});

vi.mock("../lib/busy", async (orig) => {
  const real = await orig<typeof import("../lib/busy")>();
  return { ...real, busyButton: (o: { busy: boolean; disabled?: boolean; onPress: () => void }) => { h.calls.push(o); return real.busyButton(o); } };
});

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

const { RuleDecisionBox } = await import("./RuleDecisionBox");

/** The fixture's options: hestia 0037, two questions of three alternatives. */
function fixtureOptions(): string[] {
  const line = fixture.split("\n").find((l) => l.startsWith("options: "))!;
  return JSON.parse(line.slice("options: ".length));
}

/** The box over a draft held here; draw() renders it as it stands. */
function box(options: string[], body?: string) {
  const draft = { chosen: "", words: "", set: (p: { chosen?: string; words?: string }) => Object.assign(draft, p) };
  const dec = { number: "0037", title: "A Big Picture stage", status: "proposed", options, owner: "pablo", body } as never;
  const draw = () => {
    h.radios.clear();
    h.calls = [];
    return renderToStaticMarkup(<RuleDecisionBox initiative="hestia" decision={dec} draft={draft} onClose={() => undefined} />);
  };
  const click = (label: string, alt: string) => {
    const k = [...h.radios.keys()].find((k) => k.endsWith(`${label ? `-${label}` : ""}=${alt}`));
    expect(k, `${label} ${alt} drawn`).toBeDefined();
    h.radios.get(k!)!();
  };
  const rule = () => h.calls[h.calls.length - 1];
  return { draft, draw, click, rule };
}

/** Each fieldset's legend and its radios' values. */
function groups(html: string) {
  return [...html.matchAll(/<fieldset\b[^>]*>([\s\S]*?)<\/fieldset>/g)].map((m) => ({
    legend: /<legend[^>]*>([^<]*)<\/legend>/.exec(m[1])?.[1],
    radios: [...m[1].matchAll(/<input type="radio"[^>]*value="([^"]*)"/g)].map((r) => r[1]),
  }));
}

beforeEach(() => {
  h.api = {};
  Object.keys(h.state).forEach((k) => delete h.state[k]);
  Object.assign(h.state, { widthClass: "wide", refresh: async () => undefined, agents: { groups: [] } });
});

describe("RuleDecisionBox on a question record (leftovers-49 Q4)", () => {
  it("draws one radio group per question, legend Q<n>, one radio per alternative", () => {
    const { draw } = box(fixtureOptions());
    expect(groups(draw())).toEqual([
      { legend: "Q1", radios: ["after-graph-performs-start-now", "after-graph-performs-wait", "before-graph-performs"] },
      { legend: "Q2", radios: ["record-page", "neo4j-perspective", "organizer-view"] },
    ]);
  });

  it("keeps Rule disabled until both are picked and words typed, then rules Q1 …, Q2 …", async () => {
    const b = box(fixtureOptions());
    b.draw();
    expect(b.rule().disabled).toBe(true);
    b.click("Q1", "after-graph-performs-start-now");
    b.draft.words = "as recommended";
    b.draw();
    expect(b.rule().disabled, "Q2 not picked").toBe(true);
    b.click("Q2", "neo4j-perspective");
    b.click("Q2", "record-page"); // a second pick in Q2 replaces the first
    b.draft.words = "   ";
    b.draw();
    expect(b.rule().disabled, "no words").toBe(true);
    b.draft.words = "as recommended";
    const html = b.draw();
    expect(b.rule().disabled).toBe(false);
    expect(html).toMatch(/checked="" value="after-graph-performs-start-now"/);
    expect(html).toMatch(/checked="" value="record-page"/);
    b.rule().onPress();
    await new Promise((r) => setTimeout(r, 0));
    expect(h.api.ruleDecision).toHaveBeenCalledWith("hestia", "0037", "Q1 after-graph-performs-start-now, Q2 record-page", "as recommended");
  });

  it("a question of one alternative draws one radio, not preselected (Amendment 1)", async () => {
    const b = box(["Q1 amend-exit", "Q2 threads-and-specs-ok | strip-code-blocks | exclude-threads"]);
    const html = b.draw();
    expect(groups(html)).toEqual([
      { legend: "Q1", radios: ["amend-exit"] },
      { legend: "Q2", radios: ["threads-and-specs-ok", "strip-code-blocks", "exclude-threads"] },
    ]);
    expect(html).not.toMatch(/checked=""/);
    b.draft.words = "as recommended";
    b.click("Q2", "threads-and-specs-ok");
    b.draw();
    expect(b.rule().disabled, "Q1 not picked").toBe(true);
    b.click("Q1", "amend-exit");
    b.draw();
    expect(b.rule().disabled).toBe(false);
    b.rule().onPress();
    await new Promise((r) => setTimeout(r, 0));
    expect(h.api.ruleDecision).toHaveBeenCalledWith("hestia", "0037", "Q1 amend-exit, Q2 threads-and-specs-ok", "as recommended");
  });

  it("a plain record still draws one group of its options and rules the one picked", async () => {
    const b = box(["tray", "fsnotify", "none"]);
    expect(groups(b.draw())).toEqual([{ legend: "Chosen option", radios: ["tray", "fsnotify", "none"] }]);
    b.click("", "fsnotify");
    b.draft.words = "because";
    b.draw();
    b.rule().onPress();
    await new Promise((r) => setTimeout(r, 0));
    expect(h.api.ruleDecision).toHaveBeenCalledWith("hestia", "0037", "fsnotify", "because");
  });
});

/** The fixture's body, below its frontmatter, as the scan hands it. */
const fixtureBody = fixture.split("\n---\n").slice(1).join("\n---\n");

/** Each fieldset's legend as text, markup dropped. */
const legends = (html: string) => [...html.matchAll(/<legend[^>]*>([\s\S]*?)<\/legend>/g)].map((m) => m[1].replace(/<[^>]*>/g, ""));

/** Rule's description: the text of the element its aria-describedby names. */
function ruleDescription(html: string): string | null {
  const btn = /<button class="primary"[^>]*>/.exec(html)?.[0] ?? "";
  const id = /aria-describedby="([^"]+)"/.exec(btn)?.[1];
  if (!id) return null;
  return new RegExp(`id="${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([^<]*)<`).exec(html)?.[1] ?? null;
}

const placeholder = (html: string) => /<textarea[^>]*placeholder="([^"]*)"/.exec(html)?.[1];

describe("RuleDecisionBox speaks a question record (leftovers-51)", () => {
  it("W6: names each group Q<n> · <the record's **Q<n>. …** words>, Q<n> alone without the line", () => {
    expect(fixtureBody).toContain("**Q1. Where in the order?**");
    expect(legends(box(fixtureOptions(), fixtureBody).draw())).toEqual(["Q1 · Where in the order?", "Q2 · Where does the view live?"]);
    const noQ1 = fixtureBody.replace("**Q1. Where in the order?**", "");
    expect(legends(box(fixtureOptions(), noQ1).draw())).toEqual(["Q1", "Q2 · Where does the view live?"]);
    expect(legends(box(fixtureOptions()).draw())).toEqual(["Q1", "Q2"]);
  });

  it("W7: beside a disabled Rule the foot names what is missing, and Rule is described by it", () => {
    const b = box(fixtureOptions(), fixtureBody);
    let html = b.draw();
    expect(html).not.toMatch(/aria-live/);
    expect(ruleDescription(html)).toBe("Q1 and Q2 not answered yet. Your words are missing.");
    b.click("Q1", "after-graph-performs-start-now");
    b.draft.words = "as recommended";
    html = b.draw();
    expect(b.rule().disabled).toBe(true);
    expect(ruleDescription(html)).toBe("Q2 not answered yet.");
    b.click("Q2", "record-page");
    b.draft.words = "";
    expect(ruleDescription(b.draw())).toBe("Your words are missing.");
    b.draft.words = "as recommended";
    html = b.draw();
    expect(b.rule().disabled).toBe(false);
    expect(ruleDescription(html)).toBeNull();
    expect(html).not.toMatch(/rb-missing/);
  });

  it("W7: with nothing picked and no words, the foot reads Q1 and Q2 not answered yet first", () => {
    const html = box(fixtureOptions(), fixtureBody).draw();
    expect(/<span[^>]*class="rb-missing"[^>]*>([^<]*)</.exec(html)?.[1]).toBe("Q1 and Q2 not answered yet. Your words are missing.");
  });

  it("W8: the words placeholder follows the record", () => {
    expect(placeholder(box(fixtureOptions(), fixtureBody).draw())).toBe("Why these answers, in your words. They go under ## Ruling.");
    expect(placeholder(box(["tray", "fsnotify", "none"]).draw())).toBe("Why this option, in your words. They go under ## Ruling.");
  });

  it("a plain record keeps today's foot: no missing line beside a disabled Rule", () => {
    const html = box(["tray", "fsnotify", "none"]).draw();
    expect(ruleDescription(html)).toBeNull();
    expect(html).not.toMatch(/rb-missing/);
  });
});
