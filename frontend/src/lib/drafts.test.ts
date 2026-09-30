import { describe, expect, it } from "vitest";
import { dropDraft, editDraft, openDraft, type Drafts } from "./drafts";

const A = "decision:init-a/0004";
const B = "decision:init-b/0002";
const none: Drafts = { open: null, drafts: {} };

describe("one draft per record (FR-9)", () => {
  it("opens an unseen record empty", () => {
    expect(openDraft(none, A).open).toEqual({ key: A, chosen: "", words: "" });
  });

  it("keeps the first record's words when another row's Rule opens, and restores them", () => {
    let st = editDraft(openDraft(none, A), { chosen: "accept", words: "because" });
    st = openDraft(st, B);
    expect(st.open).toEqual({ key: B, chosen: "", words: "" });
    st = editDraft(st, { words: "other" });
    st = openDraft(st, A);
    expect(st.open).toEqual({ key: A, chosen: "accept", words: "because" });
    expect(openDraft(st, B).open?.words).toBe("other");
  });

  it("keeps the words when the box closes without Cancel", () => {
    const st = openDraft(editDraft(openDraft(none, A), { words: "kept" }), null);
    expect(st.open).toBeNull();
    expect(openDraft(st, A).open?.words).toBe("kept");
  });

  it("discards only the cancelled record", () => {
    let st = editDraft(openDraft(none, B), { words: "b" });
    st = editDraft(openDraft(st, A), { words: "a" });
    st = dropDraft(st, A);
    expect(st.open).toBeNull();
    expect(openDraft(st, A).open?.words).toBe("");
    expect(openDraft(st, B).open?.words).toBe("b");
  });

  it("leaves another open box open when a closed record is dropped", () => {
    let st = editDraft(openDraft(none, B), { words: "b" });
    st = openDraft(st, A);
    expect(dropDraft(st, B).open?.key).toBe(A);
  });

  it("ignores an edit with no box open", () => {
    expect(editDraft(none, { words: "x" })).toBe(none);
  });
});
