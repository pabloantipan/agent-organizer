import { describe, expect, it } from "vitest";
import type { merge, model } from "../../wailsjs/go/models";
import { waitingDecisions, waitingOwners } from "./decisions";

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
