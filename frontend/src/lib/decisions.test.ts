import { describe, expect, it } from "vitest";
import type { merge, model } from "../../wailsjs/go/models";
import { ownerPhrase, recordSections, signalOwners, waitingDecisions, waitingOwners } from "./decisions";

const initiative = (...decisions: Partial<model.Decision>[]) => ({ decisions }) as unknown as merge.BoardInitiative;
const rec = (number: string, owner: string, raised: string, status = "proposed") => ({ number, owner, raised, status });

describe("waitingOwners", () => {
  it("names the one owner", () => {
    expect(waitingOwners(initiative(rec("0001", "fse", "2026-09-20")))).toEqual(["fse"]);
  });

  it("names each owner once, in the order their oldest record was raised", () => {
    const i = initiative(
      rec("0003", "ana", "2026-09-10"),
      rec("0004", "pablo", "2026-09-12"),
      rec("0002", "pablo", "2026-09-05"),
    );
    expect(waitingOwners(i)).toEqual(["pablo", "ana"]);
  });

  it("reads a record with no owner as \"no owner\"", () => {
    expect(waitingOwners(initiative(rec("0001", "", "2026-09-01"), rec("0002", "  ", "2026-09-02")))).toEqual(["no owner"]);
  });

  it("counts only proposed records", () => {
    const i = initiative(rec("0001", "ana", "2026-09-01", "ruled"), rec("0002", "fse", "2026-09-02"), rec("0003", "bo", "2026-09-03", "withdrawn"));
    expect(waitingOwners(i)).toEqual(["fse"]);
    expect(waitingDecisions(i)).toBe(1);
  });

  it("puts an undated record last and breaks a tie on the date by number", () => {
    const i = initiative(rec("0009", "zed", ""), rec("0002", "bo", "2026-09-01"), rec("0001", "ana", "2026-09-01"));
    expect(waitingOwners(i)).toEqual(["ana", "bo", "zed"]);
  });

  it("is empty with nothing waiting", () => {
    expect(waitingOwners(initiative())).toEqual([]);
    expect(waitingOwners({ decisions: undefined } as unknown as merge.BoardInitiative)).toEqual([]);
  });
});

describe("ownerPhrase", () => {
  it("names the owner, or says no owner", () => {
    expect(ownerPhrase("pablo")).toBe("owner pablo");
    expect(ownerPhrase("")).toBe("no owner");
    expect(ownerPhrase("  ")).toBe("no owner");
    expect(ownerPhrase(undefined)).toBe("no owner");
  });
});

describe("recordSections", () => {
  const body = [
    "## Question", "", "Is this the cell?", "", "### Seats drafted", "", "- **po_rosa**: why",
    "## Options", "", "- **accept**",
    "## Recommendation", "", "Accept.",
    "## Ruling", "",
  ].join("\n");

  it("takes the Question with its sub-headings and the Recommendation, not the Options", () => {
    expect(recordSections(body)).toEqual({ question: "Is this the cell?\n\n### Seats drafted\n\n- **po_rosa**: why", recommendation: "Accept." });
  });

  it("gives null for a section the record lacks or leaves empty", () => {
    expect(recordSections("## Question\n\nWhy?\n\n## Recommendation\n\n")).toEqual({ question: "Why?", recommendation: null });
    expect(recordSections("")).toEqual({ question: null, recommendation: null });
  });

  it("ignores a heading inside a code fence", () => {
    expect(recordSections("## Question\n\n```\n## Recommendation\n```\n").question).toBe("```\n## Recommendation\n```");
  });
});

describe("signalOwners (0060)", () => {
  it("reads the lead's own record as you", () => {
    expect(signalOwners(initiative(rec("0001", "pablo", "2026-09-20")), "pablo")).toEqual(["you"]);
  });

  it("keeps the names of other owners, in waitingOwners' order", () => {
    const i = initiative(rec("0003", "ana", "2026-09-10"), rec("0002", "Pablo", "2026-09-05"), rec("0004", "", "2026-09-11"));
    expect(signalOwners(i, "pablo")).toEqual(["you", "ana", "no owner"]);
  });

  it("follows the lead, not the name pablo", () => {
    const i = initiative(rec("0001", "pablo", "2026-09-01"), rec("0002", "ana", "2026-09-02"));
    expect(signalOwners(i, "ana")).toEqual(["pablo", "you"]);
  });
});
