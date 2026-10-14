// Vitest blanks CSS modules, even with ?raw, so the stylesheet is read from
// disk; the frontend has no Node types (vitest runs in Node).
// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { announce, Crew, launchHeading, launchTotal, saidOf, seatWord, type Launch } from "./Crew";
import { agentStart, startingButton } from "./AgentsView";
import { failedStartLine, needsMeRows } from "../lib/queue";
import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";

// leftovers-27 FR-6, FR-7 (launch-progress L1-L7). The key presses, focus
// and the live region over time are the harness rows V1-V4 on the review
// build; these are the words, the states and the Needs me row they rest on.

const T0 = Date.parse("2026-10-14T12:00:00Z");
const seat = (name: string, state: string, over: Record<string, unknown> = {}) =>
  ({ seat: name, session: `p-probe-${name}`, state, launch_line: `'p-probe' '${name}' '/r'`, ...over });
const launch = (seats: ReturnType<typeof seat>[], over: Partial<Launch> = {}): Launch => {
  const running = seats.filter((s) => s.state === "running").length;
  const failed = seats.filter((s) => s.state === "failed").length;
  const done = !seats.some((s) => ["queued", "starting", "retrying"].includes(s.state));
  return { initiative: "init-a", kind: "crew", seats, seen: failed === 0, running, failed, done, ...over } as unknown as Launch;
};

describe("seat words (L1, L5)", () => {
  it("draws each state as a word with a shape, the seconds apart", () => {
    const at = new Date(T0 - 34_000).toISOString();
    expect(seatWord(seat("a", "queued"), T0)).toMatchObject({ shape: "", word: "waiting", count: "" });
    expect(seatWord(seat("a", "starting", { started_at: at }), T0)).toMatchObject({ shape: "…", word: "starting", count: " · 34 s" });
    expect(seatWord(seat("a", "retrying", { started_at: at }), T0 + 7000)).toMatchObject({ shape: "↻", word: "trying again", count: " · 41 s" });
    expect(seatWord(seat("a", "running"), T0)).toMatchObject({ shape: "✓", word: "running" });
    expect(seatWord(seat("a", "failed"), T0)).toMatchObject({ shape: "✕", word: "didn't start" });
    expect(seatWord(seat("a", "skipped"), T0)).toMatchObject({ shape: "", word: "off" });
  });

  it("heads the list with how many run", () => {
    const l = launch([seat("a", "running"), seat("b", "starting"), seat("c", "queued")]);
    expect(launchHeading(l)).toBe("Starting crew · 1 of 3 running");
  });
});

describe("the live region (L2)", () => {
  it("says each result once and the total once, nothing per second", () => {
    const steps = [
      launch([seat("a", "starting"), seat("b", "queued"), seat("c", "queued")]),
      launch([seat("a", "starting"), seat("b", "queued"), seat("c", "queued")]),
      launch([seat("a", "running"), seat("b", "starting"), seat("c", "queued")]),
      launch([seat("a", "running"), seat("b", "retrying"), seat("c", "queued")]),
      launch([seat("a", "running"), seat("b", "failed", { reason: "x" }), seat("c", "starting")]),
      launch([seat("a", "running"), seat("b", "failed", { reason: "x" }), seat("c", "running")]),
      launch([seat("a", "running"), seat("b", "failed", { reason: "x" }), seat("c", "running")]),
    ];
    let said = saidOf(undefined);
    const out: string[][] = [];
    for (const l of steps) { const r = announce(said, l); said = r.said; out.push(r.lines); }
    expect(out).toEqual([[], [], ["a running"], [], ["b didn't start"], ["c running", "2 of 3 running, 1 didn't start"], []]);
  });

  it("says a retried seat's new result, and nothing already said after a remount", () => {
    const failed = launch([seat("a", "running"), seat("b", "failed")]);
    const said = saidOf(failed);
    expect(announce(said, failed).lines).toEqual([]);
    const again = announce(said, launch([seat("a", "running"), seat("b", "starting")]));
    expect(again.lines).toEqual([]);
    expect(announce(again.said, launch([seat("a", "running"), seat("b", "running")])).lines).toEqual(["b running", "2 of 2 running"]);
  });

  it("counts the seats Stop starting skipped as off in the total (L4)", () => {
    expect(launchTotal(launch([seat("a", "running"), seat("b", "skipped"), seat("c", "skipped")]))).toBe("1 of 3 running, 2 off");
  });
});

const group = { id: "init-a", cell: { project: "p", state: "running", agents: ["po_a", "dev_b", "qa_c"] }, retirable: [], crew: [], agents: [] } as unknown as AgentGroup;
const render = (l: Launch) => {
  return renderToStaticMarkup(<Crew group={group} launch={l} />);
};

describe("the crew block in place (V1)", () => {
  it("lists every seat with its word, the seconds aria-hidden, Stop starting while it goes", () => {
    const html = render(launch([seat("a", "running"), seat("b", "starting", { started_at: new Date().toISOString() }), seat("c", "queued")]));
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Starting crew · 1 of 3 running");
    expect(html).toMatch(/starting<span aria-hidden="true"> · \d+ s<\/span>/);
    expect(html).toContain(">waiting<");
    expect(html).toContain("Stop starting");
    expect(html).toContain('role="status"');
    expect(html).not.toContain("Bring crew up");
  });

  it("gives a failed seat the reason in words, Try again and Copy the command, the output only in the hover", () => {
    const html = render(launch([seat("a", "running"), seat("b", "failed", { reason: "the pane did not run claude (probe exit 3, twice)", exit: 3, output: "pane b: boom" })]));
    expect(html).toContain("didn&#x27;t start");
    expect(html).toContain("· the pane did not run claude (probe exit 3, twice)");
    expect(html).toContain('title="pane b: boom"');
    expect(html).not.toContain(">pane b: boom<");
    expect(html).toContain(">Try again<");
    expect(html).toContain(">Copy the command<");
    expect(html).not.toContain("Stop starting");
  });

  it("animates nothing (WCAG 2.2.2)", () => {
    const css = readFileSync(new URL("../styles/launch.css", import.meta.url), "utf8");
    expect(css).not.toMatch(/animation|transition|@keyframes/);
    expect(css).not.toMatch(/--(plum|violet|mint|amber|red)-\d/);
  });
});

describe("New agent's button (V3)", () => {
  it("reads Starting · n s, then Trying again · n s, with the reason in its name", () => {
    const at = new Date(T0 - 23_000).toISOString();
    expect(startingButton(seat("otter", "starting", { started_at: at }), T0)).toEqual({ text: "Starting · 23 s", name: "Starting otter, 23 seconds" });
    expect(startingButton(seat("otter", "starting", { started_at: new Date(T0 - 1000).toISOString() }), T0).name).toBe("Starting otter, 1 second");
    expect(startingButton(seat("otter", "retrying", { started_at: at }), T0 + 18_000)).toEqual({ text: "Trying again · 41 s", name: "Trying again to start otter, 41 seconds" });
  });

  it("follows the last entry of its seat", () => {
    const l = launch([seat("otter", "failed"), seat("otter", "starting")], { kind: "agent" });
    expect(agentStart(l, "otter")?.state).toBe("starting");
    expect(agentStart(l, "lynx")).toBeUndefined();
  });
});

describe("Needs me: a start that failed unseen (V4, FR-7)", () => {
  const view = (status = "active") => ({ board: { initiatives: [{ id: "init-a", local: true, status }], columns: { now: [], blocked: [], next: [] } }, order: { resolved: {} } }) as unknown as BoardView;
  const feed = (l: Launch) => ({ groups: [], launches: [l] }) as unknown as AgentsView;
  const failed = (n: number, over: Partial<Launch> = {}) => launch([seat("a", "running"), ...Array.from({ length: n }, (_, i) => seat(`f${i}`, "failed", { reason: "r" }))], over);

  it("is one row, Crew of <id>: n seat(s) didn't start", () => {
    const rows = needsMeRows(view(), feed(failed(1)));
    expect(rows.map((r) => r.key)).toEqual(["start:init-a"]);
    expect(failedStartLine(failed(1))).toBe("Crew of init-a: 1 seat didn't start");
    expect(failedStartLine(failed(2))).toBe("Crew of init-a: 2 seats didn't start");
  });

  it("goes once seen, once retried, and for an initiative that is not active", () => {
    expect(needsMeRows(view(), feed(failed(1, { seen: true })))).toEqual([]);
    expect(needsMeRows(view(), feed(launch([seat("a", "running"), seat("f0", "starting")], { seen: false })))).toEqual([]);
    expect(needsMeRows(view("paused"), feed(failed(1)))).toEqual([]);
  });
});
