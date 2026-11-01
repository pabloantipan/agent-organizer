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
import { needsMeRows, waitingOnOthers } from "./queue";

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

describe("the readers count awaiting-cells as waiting and applied, acknowledged as ruled", () => {
  const ds = [rec("0001", "proposed"), rec("0002", "awaiting-cells", { raised: "2026-08-20" }), rec("0003", "applied", { ruled: "2026-09-02", ruled_by: "pablo" }), rec("0004", "acknowledged", { ruled: "2026-09-03", ruled_by: "operator" }), rec("0005", "withdrawn")];
  const now = new Date("2026-09-10T12:00:00");

  it("Needs me has a row for the awaiting-cells record", () => {
    const keys = needsMeRows(board(initiative("a", ds)), agents("a"), now).map((r) => r.key);
    expect(keys).toContain("decision:a/0002");
    expect(keys).toContain("decision:a/0001");
    expect(keys.filter((k) => k.startsWith("decision:"))).toHaveLength(2);
  });
  it("the header counts it and lands on it, the oldest", () => {
    expect(waitingChip(ds, "pablo")).toBe("2 decisions waiting on you");
    expect(firstWaiting(ds)).toBe("0002");
    expect(waitingDecisions(initiative("a", ds))).toBe(2);
    expect(waitingOwners(initiative("a", ds))).toEqual(["pablo"]);
  });
  it("an awaiting-cells record owned by someone else waits on others", () => {
    const others = [rec("0006", "awaiting-cells", { owner: "ana", raised: "2026-08-01" })];
    expect(waitingOnOthers(board(initiative("a", others)), agents("a"), now).map((o) => o.key)).toEqual(["others:a/0006"]);
    expect(initiativeStates(board(initiative("a", others)), agents("a")).get("a")).toBe("business");
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

// FR-6: no file under frontend/src/lib compares a decision status to a
// literal outside decisions.ts. A comparison (===, !==, ==, !=, case) or an
// includes() with one of the seven statuses is a finding.
describe("decision status literals", () => {
  const LITERAL = /(?:[=!]==?\s*|case\s+|includes\(\s*)["'](?:proposed|awaiting-cells|ruled|applied|acknowledged|superseded|withdrawn)["']|["'](?:proposed|awaiting-cells|ruled|applied|acknowledged|superseded|withdrawn)["']\s*[=!]==?/;
  const here = new URL(".", import.meta.url).pathname;
  const files = (readdirSync(here) as string[]).filter((f) => /\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && f !== "decisions.ts");

  it("finds the lib files", () => {
    expect(files).toContain("queue.ts");
  });
  it("the guard catches a comparison", () => {
    expect(LITERAL.test(`d.status === "awaiting-cells"`)).toBe(true);
    expect(LITERAL.test(`"ruled" !== d.status`)).toBe(true);
    expect(LITERAL.test(`case 'applied':`)).toBe(true);
    expect(LITERAL.test(`isOpen(d)`)).toBe(false);
  });
  it.each(files)("%s reads decision status only through decisions.ts", (f) => {
    const hits = (readFileSync(`${here}${f}`, "utf8") as string).split("\n").map((l, i) => [i + 1, l] as const).filter(([, l]) => LITERAL.test(l));
    expect(hits.map(([n, l]) => `${f}:${n}: ${l.trim()}`)).toEqual([]);
  });
});

// expected.json (19d5f44): owner operator is pablo wherever a person is read.
describe("owner operator", () => {
  const now = new Date("2026-09-10T12:00:00");
  it("is the lead's record: a Needs me row and the header says on you", () => {
    const ds = [rec("0001", "awaiting-cells", { owner: "operator" })];
    expect(needsMeRows(board(initiative("a", ds)), agents("a"), now).map((r) => r.key)).toContain("decision:a/0001");
    expect(waitingChip(ds, "pablo")).toBe("1 decision waiting on you");
    expect(waitingOnOthers(board(initiative("a", ds)), agents("a"), now)).toEqual([]);
    expect(initiativeStates(board(initiative("a", ds)), agents("a")).get("a")).toBe("you");
  });
});
