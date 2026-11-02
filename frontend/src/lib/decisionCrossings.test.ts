// @ts-expect-error node:fs has no type declarations in this tsconfig
import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { AgentGroup, AgentsView, BoardView } from "../hooks/useWails";
import type { merge, model } from "../../wailsjs/go/models";
import { decisionStatusWord, decisionTone, isWithCells, ownerHover, ownerName, ownerPhrase, ownerSign, waitingDecisions, waitingOwners, withCellsCount } from "./decisions";
import { gateRowWords, lineName, sectionOf, sectionRows, timelineName } from "./decisionsPage";
import { firstWaiting, firstWithCells, waitingChip, withCellsLine } from "./header";
import { initiativeStates } from "./initiativeState";
import { needsMeRows, waitingOnOthers } from "./queue";
import { fseWaiting } from "../components/FsePanel";

// leftovers-61 (0173; Aglaea's docs/ux/specs/decision-states.md DS1-DS6),
// gate rows D1-D6. The fixture is init-a as `scripts/fixture-home.sh` lays it:
// testdata/home under testdata/fixture-overlay, whose records 0013
// (awaiting-cells, owner operator), 0014 (applied) and 0015 (acknowledged)
// are the crossing states. The records are read from the files, so a change
// to the overlay shows here.

const here = new URL(".", import.meta.url).pathname;
const testdata = `${here}../../../testdata`;

/** The frontmatter fields these readers use, as the scan reads them. */
function readRecords(dir: string): model.Decision[] {
  return (readdirSync(dir) as string[]).filter((f) => /^\d{4}-.*\.md$/.test(f)).map((f) => {
    const src = readFileSync(`${dir}/${f}`, "utf8") as string;
    const front = src.split("---")[1];
    const field = (k: string) => {
      const m = new RegExp(`^${k}:[ \\t]*(.*)$`, "m").exec(front);
      return m ? m[1].trim() : "";
    };
    const list = (k: string) => field(k).replace(/^\[|\]$/g, "").split(",").map((s) => s.trim()).filter(Boolean);
    return {
      number: f.slice(0, 4), slug: f.slice(5, -3), title: field("title"), status: field("status"), raised: field("raised"),
      raised_by: field("raised_by"), owner: field("owner"), ruled: field("ruled"), ruled_by: field("ruled_by"),
      options: list("options"), chosen: field("chosen"), body: "", path: `working-on/decisions/${f}`,
    } as unknown as model.Decision;
  });
}

const fixtureRecords = (() => {
  const byNumber = new Map<string, model.Decision>();
  for (const d of readRecords(`${testdata}/home/init-a/working-on/decisions`)) byNumber.set(d.number, d);
  for (const d of readRecords(`${testdata}/fixture-overlay/init-a/working-on/decisions`)) byNumber.set(d.number, d);
  return [...byNumber.values()].sort((a, b) => a.number.localeCompare(b.number));
})();
const byNumber = (n: string) => fixtureRecords.find((d) => d.number === n)!;

const initA = { id: "init-a", local: true, status: "active", decisions: fixtureRecords } as unknown as merge.BoardInitiative;
const board = (...initiatives: merge.BoardInitiative[]) =>
  ({ board: { initiatives, columns: { now: [], blocked: [], next: [] } }, order: { resolved: {} } }) as unknown as BoardView;
const group = (id: string) =>
  ({ id, cell: { human: "pablo", state: "running" }, threads: [], crew: [], agents: [], waves: [] }) as unknown as AgentGroup;
const agents = { groups: [group("init-a")] } as unknown as AgentsView;
const now = new Date("2026-11-01T12:00:00");

describe("the fixture holds the crossing states", () => {
  it("0013 awaiting-cells owned by operator, 0014 applied, 0015 acknowledged", () => {
    expect([byNumber("0013").status, byNumber("0013").owner]).toEqual(["awaiting-cells", "operator"]);
    expect(byNumber("0014").status).toBe("applied");
    expect(byNumber("0015").status).toBe("acknowledged");
  });
});

describe("D1 (FR-1, DS1): the lead's counts hold only what the lead can rule", () => {
  const rows = needsMeRows(board(initA), agents, now);
  const decisionRows = rows.filter((r) => r.kind === "decision").map((r) => r.key);
  const proposed = fixtureRecords.filter((d) => d.status === "proposed");
  const leadsProposed = proposed.filter((d) => ["pablo", "operator", ""].includes(d.owner.trim().toLowerCase()));

  it("Needs me has no 0013 row, and every proposed record of the lead is one", () => {
    expect(decisionRows).not.toContain("decision:init-a/0013");
    expect(decisionRows.sort()).toEqual(leadsProposed.map((d) => `decision:init-a/${d.number}`).sort());
  });
  it("the header's count is the proposed records, 0013 left out, and lands on the oldest of them", () => {
    expect(waitingDecisions(initA)).toBe(proposed.length);
    expect(waitingChip(fixtureRecords, "pablo")).toBe(`${proposed.length} decisions waiting · ${leadsProposed.length} on you`);
    expect(firstWaiting(fixtureRecords)).not.toBe("0013");
    expect(firstWaiting(fixtureRecords)).toBe("0002");
    expect(waitingOwners(initA)).not.toContain("operator");
  });
  it("the FSE panel's waiting on you leaves 0013 out and agrees with Needs me's decision rows", () => {
    const fse = fseWaiting(initA, [], "pablo", {}, now).filter((w) => w.kind === "decision").map((w) => w.key);
    expect(fse).not.toContain("decision:init-a/0013");
    expect(fse.sort()).toEqual(decisionRows.sort());
  });
  it("where every record waiting is the lead's, the header, Needs me and the FSE panel give one number", () => {
    const mine = fixtureRecords.filter((d) => d.owner !== "alejandro");
    const i = { ...initA, decisions: mine } as merge.BoardInitiative;
    const n = needsMeRows(board(i), agents, now).filter((r) => r.kind === "decision").length;
    expect(waitingChip(mine, "pablo")).toBe(`${n} decisions waiting on you`);
    expect(fseWaiting(i, [], "pablo", {}, now).length).toBe(n);
    expect(waitingDecisions(i)).toBe(n);
  });
  it("a proposed record owned by operator is the lead's in Needs me and in the FSE panel alike (FR-6)", () => {
    const d = { ...byNumber("0013"), status: "proposed" } as model.Decision;
    const i = { ...initA, decisions: [d] } as merge.BoardInitiative;
    const rows = needsMeRows(board(i), agents, now).filter((r) => r.kind === "decision").map((r) => r.key);
    expect(rows).toEqual(["decision:init-a/0013"]);
    expect(fseWaiting(i, [], "pablo", {}, now).map((w) => w.key)).toEqual(rows);
    expect(waitingChip([d], "pablo")).toBe("1 decision waiting on you");
  });
  it("a record with the cells owned by someone else is no wait on others and no business wait", () => {
    const d = { ...byNumber("0013"), owner: "ana", raised: "2026-09-01" } as model.Decision;
    const i = { ...initA, decisions: [d] } as merge.BoardInitiative;
    expect(waitingOnOthers(board(i), agents, now)).toEqual([]);
    expect(initiativeStates(board(i), agents).get("init-a")).toBe("quiet");
  });
});

describe("D2 (FR-2, DS2): Decisions groups the records with the cells between To rule and Ruled", () => {
  const rows = fixtureRecords.map((d) => ({ d, key: d.number }));
  it("0013 is the one record with the cells; To rule has no 0013; Ruled has 0014 and 0015", () => {
    const s = sectionRows(rows);
    expect(s.cells.map((r) => r.key)).toEqual(["0013"]);
    expect(s.rule.map((r) => r.key)).not.toContain("0013");
    expect(s.ruled.map((r) => r.key)).toEqual(expect.arrayContaining(["0014", "0015"]));
    expect(isWithCells(byNumber("0013"))).toBe(true);
    expect(withCellsCount(fixtureRecords)).toBe(1);
  });
  it("each status has its section", () => {
    expect(sectionOf({ status: "proposed" })).toBe("rule");
    expect(sectionOf({ status: "awaiting-cells" })).toBe("cells");
    for (const st of ["ruled", "applied", "acknowledged", "superseded", "withdrawn"]) expect(sectionOf({ status: st })).toBe("ruled");
  });
  it("the group is empty, and so absent, when nothing waits on the cells", () => {
    expect(sectionRows(rows.filter((r) => r.key !== "0013")).cells).toEqual([]);
  });
  it("0013 draws in the waiting pair (badge and dashed bar to today)", () => {
    expect(decisionTone(byNumber("0013"))).toBe("proposed");
    expect(decisionStatusWord(byNumber("0013").status)).toBe("awaiting cells");
  });
});

describe("D3 (FR-3, DS3): the header says the records with the cells once, quietly", () => {
  it("`1 with the cells` beside the lead's count, landing on 0013", () => {
    expect(withCellsLine(fixtureRecords)).toBe("1 with the cells");
    expect(firstWithCells(fixtureRecords)).toBe("0013");
  });
  it("alone when nothing waits on the lead, and absent at zero", () => {
    const only = [byNumber("0013"), byNumber("0014")];
    expect(waitingChip(only, "pablo")).toBeNull();
    expect(withCellsLine(only)).toBe("1 with the cells");
    expect(withCellsLine(fixtureRecords.filter((d) => d.number !== "0013"))).toBeNull();
    expect(firstWithCells(fixtureRecords.filter((d) => d.number !== "0013"))).toBeNull();
  });
});

describe("D4 (FR-4, DS4): applied and acknowledged in the ruled pair, their own words with a space", () => {
  it.each([["0014", "applied"], ["0015", "acknowledged"]])("%s: tone ruled, word %s", (n, word) => {
    expect(decisionTone(byNumber(n))).toBe("ruled");
    expect(decisionStatusWord(byNumber(n).status)).toBe(word);
  });
  it("every status word is written with a space, never a hyphen", () => {
    for (const st of ["proposed", "awaiting-cells", "ruled", "applied", "acknowledged", "superseded", "withdrawn", "some-new-state"]) {
      expect(decisionStatusWord(st)).not.toContain("-");
    }
    expect(decisionStatusWord("some-new-state")).toBe("some new state");
  });
});

describe("D5 (FR-5, DS5): a line names its record's own status", () => {
  it("Overview's gate rows read awaiting cells, applied, acknowledged", () => {
    expect(gateRowWords(byNumber("0013"), 12)).toEqual({ word: "awaiting cells", when: "12d" });
    expect(gateRowWords(byNumber("0014"), null, now)).toEqual({ word: "applied", when: "21 Oct" });
    expect(gateRowWords(byNumber("0015"), null, now)).toEqual({ word: "acknowledged", when: "20 Oct" });
    expect(gateRowWords(byNumber("0002"), 3)).toEqual({ word: "waiting", when: "3d" });
  });
  it("the record line and the timeline name the status, not the bucket", () => {
    expect(lineName(byNumber("0014"), now)).toContain(", applied,");
    expect(lineName(byNumber("0015"), now)).toContain(", acknowledged,");
    expect(timelineName(byNumber("0013"))).toContain("awaiting cells");
  });
});

describe("D6 (FR-6, DS6): owner operator reads as pablo, the raw value in the hover", () => {
  it("the owner reader", () => {
    expect(ownerName("operator")).toBe("pablo");
    expect(ownerName(" Operator ")).toBe("pablo");
    expect(ownerName("alejandro")).toBe("alejandro");
    expect(ownerName("")).toBe("");
    expect(ownerHover("operator")).toBe("owner: operator");
    expect(ownerHover("pablo")).toBeUndefined();
    expect(ownerHover(undefined)).toBeUndefined();
  });
  it("Needs me's and Decisions' owner phrase never says operator", () => {
    expect(ownerPhrase(byNumber("0013").owner)).toBe("owner pablo");
    expect(lineName(byNumber("0013"), now)).toContain("owner pablo");
    expect(lineName(byNumber("0013"), now)).not.toContain("operator");
    expect(timelineName(byNumber("0013"))).not.toContain("operator");
    expect(waitingOwners({ decisions: [{ ...byNumber("0013"), status: "proposed" }] })).toEqual(["pablo"]);
  });
  it("the rule box names the owner only when someone else rules", () => {
    expect(ownerSign("operator", "pablo")).toBe("");
    expect(ownerSign("pablo", "pablo")).toBe("");
    expect(ownerSign("", "pablo")).toBe("");
    expect(ownerSign("alejandro", "pablo")).toBe(" · owner alejandro");
    expect(ownerSign("operator", "ana")).toBe(" · owner pablo");
  });
});
