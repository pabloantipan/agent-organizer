// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readdirSync, readFileSync } from "node:fs";
// @ts-expect-error node:os has no type declarations in this tsconfig
import { homedir } from "node:os";
import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { decisionClass, isDecided, isOpen, isRulable, readRuledBy, rulerName, rulingOf, waitingDecisions, waitingOwners } from "./decisions";
import { lineName, rulerWords, statusWord, timelineName, NO_RULER } from "./decisionsPage";
import { firstWaiting, waitingChip } from "./header";
import { initiativeStates } from "./initiativeState";
import { decisionName, gemsOf } from "./outline";
import { decisionRowAction, needsMeRows, waitingOnOthers } from "./queue";
import { VERBS } from "./verbs";

// leftovers-54 FR-6, FR-7 (gate row G5): one helper says what a decision
// status means, every lib reader uses it, and ruled_by reads as a person
// plus a mode, as agent-mailbox-specs expected.json maps it.

const rec = (number: string, status: string, more: Partial<model.Decision> = {}) =>
  ({ number, title: `t${number}`, status, owner: "pablo", raised: "2026-09-01", ...more }) as unknown as model.Decision;
const initiative = (id: string, decisions: model.Decision[]) =>
  ({ id, local: true, status: "active", decisions }) as unknown as merge.BoardInitiative;
const board = (...initiatives: merge.BoardInitiative[]) =>
  ({ board: { initiatives, columns: { now: [], blocked: [], next: [] } }, order: { resolved: {} } }) as unknown as BoardView;
const group = (id: string) =>
  ({ id, cell: { human: "pablo", state: "running" }, threads: [], crew: [], agents: [], waves: [] }) as unknown as AgentGroup;
const agents = (...ids: string[]) => ({ groups: ids.map(group) }) as unknown as AgentsView;

const STATUSES: Record<string, string> = {
  proposed: "open", "awaiting-cells": "open",
  ruled: "decided", applied: "decided", acknowledged: "decided",
  superseded: "closed", withdrawn: "closed",
};

describe("decisionClass", () => {
  it.each(Object.entries(STATUSES))("%s is %s", (status, cls) => {
    expect(decisionClass(status)).toBe(cls);
    expect(isOpen({ status })).toBe(cls === "open");
    expect(isDecided({ status })).toBe(cls === "decided");
  });
  it("an unknown or empty status waits on nothing and counts as no ruling", () => {
    for (const s of ["", "dropped", "decided", undefined]) expect(decisionClass(s)).toBe("closed");
  });
  it("only proposed is ruled here; awaiting-cells is open but Themis's", () => {
    expect(isRulable({ status: "proposed" })).toBe(true);
    for (const s of ["awaiting-cells", "ruled", "applied"]) expect(isRulable({ status: s })).toBe(false);
  });
});

// leftovers-61 FR-1 (0173) replaced 0164 FR-6 for the lead's counts: an
// awaiting-cells record is open but no Needs me row and no waiting count.
describe("the readers leave awaiting-cells out of the lead's counts and count applied, acknowledged as ruled", () => {
  const ds = [rec("0001", "proposed"), rec("0002", "awaiting-cells", { raised: "2026-08-20" }), rec("0003", "applied", { ruled: "2026-09-02", ruled_by: "pablo" }), rec("0004", "acknowledged", { ruled: "2026-09-03", ruled_by: "operator" }), rec("0005", "withdrawn")];
  const now = new Date("2026-09-10T12:00:00");

  it("Needs me has no row for the awaiting-cells record", () => {
    const keys = needsMeRows(board(initiative("a", ds)), agents("a"), now).map((r) => r.key);
    expect(keys).not.toContain("decision:a/0002");
    expect(keys.filter((k) => k.startsWith("decision:"))).toEqual(["decision:a/0001"]);
  });
  it("the header counts the proposed one only and lands on it", () => {
    expect(waitingChip(ds, "pablo")).toBe("1 decision waiting on you");
    expect(firstWaiting(ds)).toBe("0001");
    expect(waitingDecisions(initiative("a", ds))).toBe(1);
    expect(waitingOwners(initiative("a", ds))).toEqual(["pablo"]);
  });
  it("an awaiting-cells record owned by someone else waits on the cells, not on its owner", () => {
    const others = [rec("0006", "awaiting-cells", { owner: "ana", raised: "2026-08-01" })];
    expect(waitingOnOthers(board(initiative("a", others)), agents("a"), now)).toEqual([]);
    expect(initiativeStates(board(initiative("a", others)), agents("a")).get("a")).toBe("quiet");
  });
  it("the timeline draws a ruled diamond for applied and acknowledged", () => {
    expect(gemsOf(ds[2]).map((g) => g.kind)).toEqual(["raised", "ruled"]);
    expect(gemsOf(ds[3]).map((g) => g.kind)).toEqual(["raised", "ruled"]);
    expect(gemsOf(ds[1]).map((g) => g.kind)).toEqual(["waiting"]);
    expect(decisionName(ds[1], now)).toContain("waiting");
    expect(decisionName(ds[3], now)).toMatch(/ruled .* by pablo$/);
  });
  it("the record line names applied and acknowledged as ruled, with the ruler and the turnaround", () => {
    const name = lineName({ ...ds[2], chosen: "a", ruled_by: "pablo by away mode" }, now);
    expect(name).toBe("0003 t0003, applied, “a”, by pablo, autonomous mode, after 1 day");
    expect(lineName(ds[1], now)).toBe("0002 t0002, awaiting cells, owner pablo, 21 days");
    expect(statusWord("proposed")).toBe("waiting");
  });
});

describe("ruled_by as a person and a mode", () => {
  it.each([
    ["pablo", "pablo", "present"], ["operator", "pablo", "present"],
    ["pablo (autonomous mode)", "pablo", "autonomous"], ["pablo (away mode)", "pablo", "autonomous"],
    ["pablo by away mode", "pablo", "autonomous"], ["(autonomous mode)", "pablo", "autonomous"], ["(away mode)", "pablo", "autonomous"],
    ["operator away mode, recommendation taken", "pablo", "autonomous"],
    ["pablo (standing rule)", "pablo", "standing rule"], ["pablo by standing rule", "pablo", "standing rule"],
    ["themis (FR-4 b)", "themis", "standing rule"], ["ana", "ana", "present"],
  ])("%s reads %s, %s", (by, person, mode) => {
    expect(readRuledBy(by)).toEqual({ person, mode });
  });
  it.each(["pablo (vacation)", "pablo (autonomous mode", "pablo away mode, recommendation taken", "(standing rule)", "pablo and ana"])("%s is refused, never guessed", (by) => {
    expect(readRuledBy(by)).toBeNull();
    expect(rulerName({ ruled_by: by })).toBe("");
    expect(rulerWords({ ruled_by: by })).toBe(NO_RULER);
  });
  it("the app names the person with the mode beside it", () => {
    expect(rulerWords({ ruled_by: "pablo by away mode" })).toBe("by pablo, autonomous mode");
    expect(rulerWords({ ruled_by: "pablo (standing rule)" })).toBe("by pablo, standing rule");
    expect(rulerWords({ ruled_by: "operator" })).toBe("by pablo");
    expect(rulerWords({ ruled_by: "" })).toBe(NO_RULER);
    expect(timelineName(rec("0009", "ruled", { ruled: "2026-09-02", ruled_by: "(away mode)" }))).toContain("ruled 2026-09-02 by pablo, autonomous mode");
  });
  it("the scan's reading wins when the record carries it", () => {
    expect(rulingOf({ ruled_by: "pablo", ruler: "pablo", ruler_mode: "autonomous" })).toEqual({ person: "pablo", mode: "autonomous" });
    // The scan refused it (a ruled_mode that disagrees): no ruler, no guess.
    expect(rulingOf({ ruled_by: "pablo (away mode)", ruler: "", ruler_mode: "" })).toBeNull();
    expect(rulingOf({ ruled_by: "", ruler: "", ruler_mode: "" })).toEqual({ person: "", mode: "" });
  });
});

// The same sample the Go scan reads (TestWorkingOnContract): every reading
// and every refusal expected.json lists. A missing sample fails, never skips.
describe("ruled_by per the contract sample", () => {
  const env = (globalThis as unknown as { process: { env: Record<string, string | undefined> } }).process.env;
  const dir = env.CONTRACTS_DIR || `${homedir()}/agent-slack/specs/contracts`;
  const want = JSON.parse(readFileSync(`${dir}/working-on/expected.json`, "utf8"));
  const reading = want.accepted_reading.ruled_by_reading as Record<string, { person: string; mode: string }>;

  it("reads every listed value as the contract maps it", () => {
    expect(Object.keys(reading).length).toBeGreaterThan(0);
    for (const [by, r] of Object.entries(reading)) expect([by, readRuledBy(by)]).toEqual([by, r]);
  });
  it("refuses every value the contract refuses", () => {
    for (const by of want.accepted_reading.ruled_by_refused.values as string[]) expect([by, readRuledBy(by)]).toEqual([by, null]);
  });
  it("classes every status as the contract does", () => {
    for (const [cls, list] of Object.entries(want.accepted_reading.decision_statuses)) {
      if (!Array.isArray(list)) continue;
      for (const s of list) expect([s, decisionClass(s)]).toEqual([s, cls]);
    }
  });
});

// FR-6 (review finding 1 of 39f64de): no decision-status literal anywhere
// in frontend/src/lib code outside decisions.ts and the tests, in any quote
// style ("", '', ``), so no comparison of any shape (===, case, includes,
// Set.has, a map key) can name a status there. Comments are stripped first.
// `ruled` is also a word that is not a status: the record's date field, a
// Decisions section key and a timeline gem kind. Those lines are allowed by
// their exact text, each with its reason; a new line naming a status fails,
// and an allowed line that no longer exists fails too, so the list stays true.
describe("decision status literals", () => {
  const LITERAL = /["'`](?:proposed|awaiting-cells|ruled|applied|acknowledged|superseded|withdrawn)["'`]/;
  const ALLOWED: Record<string, string[]> = {
    "decisionsPage.ts": [
      // the date field `ruled` of model.Decision, not the status
      `type Dated = Pick<model.Decision, "number" | "raised" | "ruled">;`,
      `type Named = Pick<model.Decision, "number" | "title" | "status" | "owner" | "raised" | "ruled" | "ruled_by" | "chosen" | "superseded_by"> & Partial<Pick<model.Decision, "ruler" | "ruler_mode">>;`,
      // the date field `ruled` of model.Decision, not the status (leftovers-61)
      `export function sectionRows<T extends { d: Pick<model.Decision, "status" | "raised" | "ruled" | "number"> }>(rows: T[]): { rule: T[]; cells: T[]; ruled: T[]; closed: T[] } {`,
      `export function gateRowWords(d: Pick<model.Decision, "status" | "ruled">, waited: number | null, now?: Date): { word: string; when: string } {`,
      // the Decisions view's section key (DecSections), not the status
      `return { rule: pick("rule"), cells: pick("cells"), ruled: pick("ruled"), timeline: pick("timeline") };`,
      `return { rule: one("rule"), cells: one("cells"), ruled: one("ruled"), timeline: one("timeline") };`,
      `export const sectionOf = (d: Pick<model.Decision, "status">): "rule" | "cells" | "ruled" =>`,
      `isRulable(d) ? "rule" : isWithCells(d) ? "cells" : "ruled";`,
    ],
    "outline.ts": [
      // a timeline gem's kind, not the status
      `export type Gem = { number: string; at: number; kind: "raised" | "ruled" | "waiting" };`,
      `if (ruled !== undefined) out.push({ number: d.number, at: ruled, kind: "ruled" });`,
    ],
  };
  // Comments out, code and strings kept, lines kept (leftovers-62 FR-8): a
  // scan that knows strings, template literals and regex literals, so a `//`
  // inside "a // b" or /https?:\/\// is not a comment and the code after it is
  // still read. A block comment becomes spaces, so line numbers hold.
  const stripComments = (src: string) => {
    let out = "";
    let k = 0;
    let prev = ""; // the last code character that was not a space
    const regexMayStart = () => prev === "" || /[(,=:[!&|?{};+\-*%<>~^]/.test(prev) || /\b(return|typeof|case|of|in)$/.test(out.trimEnd());
    while (k < src.length) {
      const c = src[k];
      const n = src[k + 1];
      if (c === "/" && n === "/") {
        while (k < src.length && src[k] !== "\n") k++;
        continue;
      }
      if (c === "/" && n === "*") {
        const end = src.indexOf("*/", k + 2);
        const stop = end < 0 ? src.length : end + 2;
        out += src.slice(k, stop).replace(/[^\n]/g, " ");
        k = stop;
        continue;
      }
      if (c === '"' || c === "'" || c === "`") {
        let j = k + 1;
        while (j < src.length && src[j] !== c && (c === "`" || src[j] !== "\n")) j += src[j] === "\\" ? 2 : 1;
        out += src.slice(k, j + 1);
        k = j + 1;
        prev = c;
        continue;
      }
      if (c === "/" && regexMayStart()) {
        let j = k + 1;
        let cls = false;
        while (j < src.length && src[j] !== "\n" && (cls || src[j] !== "/")) {
          if (src[j] === "\\") j++;
          else if (src[j] === "[") cls = true;
          else if (src[j] === "]") cls = false;
          j++;
        }
        out += src.slice(k, j + 1);
        k = j + 1;
        prev = "/";
        continue;
      }
      out += c;
      if (!/\s/.test(c)) prev = c;
      k++;
    }
    return out;
  };
  const here = new URL(".", import.meta.url).pathname;
  const files = (readdirSync(here) as string[]).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && f !== "decisions.ts");
  const linesOf = (f: string) => stripComments(readFileSync(`${here}${f}`, "utf8") as string).split("\n").map((l, i) => [i + 1, l.trim()] as const);

  it("finds the lib files", () => {
    expect(files).toContain("queue.ts");
  });
  it("the guard catches every shape of comparison", () => {
    for (const l of [
      `d.status === "awaiting-cells"`, `"ruled" !== d.status`, `case 'applied':`,
      "x1 = d.status === `ruled`", `["proposed", "awaiting-cells"].includes(d.status)`, `new Set(["applied"]).has(d.status)`,
      `const S = { withdrawn: 1, "superseded": 2 }`,
    ]) expect([l, LITERAL.test(l)]).toEqual([l, true]);
    expect(LITERAL.test("isOpen(d)")).toBe(false);
    expect(stripComments(`a // "ruled"\n/* "applied" */ b`).match(LITERAL)).toBeNull();
  });
  // leftovers-62 U4 (FR-8): a `//` inside a string is not a comment.
  it("keeps the code after a // inside a string, so the comparison is still seen", () => {
    const src = `"a // b"; x === "proposed"`;
    expect(stripComments(src)).toBe(src);
    expect(LITERAL.test(stripComments(src))).toBe(true);
    expect(stripComments(`'a // b'; d.status === 'ruled' // "applied"`)).toBe(`'a // b'; d.status === 'ruled' `);
    expect(stripComments("`x // ${y}`; s === `ruled`")).toBe("`x // ${y}`; s === `ruled`");
    expect(stripComments(`const u = /https?:\\/\\//; d.status === "ruled" // tail`)).toBe(`const u = /https?:\\/\\//; d.status === "ruled" `);
    expect(stripComments(`a /* x\n y */ b`)).toBe(`a     \n      b`);
    expect(stripComments(`n = a / b; // c "ruled"`).match(LITERAL)).toBeNull();
  });
  it.each(files)("%s names no decision status outside the allowed lines", (f) => {
    const allowed = ALLOWED[f] ?? [];
    const hits = linesOf(f).filter(([, l]) => LITERAL.test(l) && !allowed.includes(l));
    expect(hits.map(([n, l]) => `${f}:${n}: ${l}`)).toEqual([]);
  });
  it.each(Object.entries(ALLOWED))("every allowed line of %s still exists", (f, allowed) => {
    const lines = linesOf(f).map(([, l]) => l);
    expect(allowed.filter((a) => !lines.includes(a))).toEqual([]);
  });
});

// expected.json (19d5f44): owner operator is pablo wherever a person is read.
describe("owner operator", () => {
  const now = new Date("2026-09-10T12:00:00");
  it("is the lead's record: a Needs me row and the header says on you", () => {
    const ds = [rec("0001", "proposed", { owner: "operator" })];
    expect(needsMeRows(board(initiative("a", ds)), agents("a"), now).map((r) => r.key)).toContain("decision:a/0001");
    expect(waitingChip(ds, "pablo")).toBe("1 decision waiting on you");
    expect(waitingOnOthers(board(initiative("a", ds)), agents("a"), now)).toEqual([]);
    expect(initiativeStates(board(initiative("a", ds)), agents("a")).get("a")).toBe("you");
  });
});

// leftovers-54 Amendment 6, FR-6a: a Needs me row for an open record that is
// not rulable reads Open and "awaiting cells"; Rule stays proposed only.
describe("FR-6a: a decision row's verb and words", () => {
  it("proposed: Rule, the line ends with its options", () => {
    expect(decisionRowAction(rec("0002", "proposed", { options: ["a", "b"] }))).toEqual({ verb: VERBS.rule, tail: "options: a, b" });
  });
  it("proposed with no options: Rule, nothing appended", () => {
    expect(decisionRowAction(rec("0002", "proposed"))).toEqual({ verb: VERBS.rule, tail: null });
  });
  it("awaiting-cells: Open, the line reads awaiting cells and not its options", () => {
    expect(decisionRowAction(rec("0013", "awaiting-cells", { options: ["both cells", "the record only"] }))).toEqual({ verb: VERBS.open, tail: "awaiting cells" });
  });
  it("the verb follows isRulable for every open status", () => {
    for (const status of Object.keys(STATUSES).filter((s) => STATUSES[s] === "open")) {
      expect(decisionRowAction({ status, options: [] }).verb).toBe(isRulable({ status }) ? VERBS.rule : VERBS.open);
    }
  });
  it("on Needs me: the proposed row's verb is Rule and the awaiting-cells record is no row (leftovers-61 FR-1)", () => {
    const rows = needsMeRows(board(initiative("init-a", [rec("0002", "proposed", { options: ["a", "b"] }), rec("0013", "awaiting-cells", { options: ["x", "y"] })])), agents("init-a"), new Date(2026, 9, 1));
    const verbs = Object.fromEntries(rows.filter((r) => r.kind === "decision").map((r) => [(r as { decision: model.Decision }).decision.number, decisionRowAction((r as { decision: model.Decision }).decision).verb]));
    expect(verbs).toEqual({ "0002": VERBS.rule });
  });
});
