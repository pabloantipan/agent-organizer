import { describe, expect, it } from "vitest";
import type { model } from "../../wailsjs/go/models";
import { oneLine, underRoot, unreadFiles, unreadLabel } from "./unread";

const p = (path: string, msg: string, unread = true) => ({ path, msg, unread }) as model.Problem;

describe("unreadFiles", () => {
  it("keeps only the files the scan could not read, one entry per path, in order", () => {
    const got = unreadFiles([
      p("/r/working-on/b.md", "no frontmatter: file must start with ---"),
      p("/r/working-on/a.md", "stage \"x\" is not on the roadmap", false),
      p("/r/working-on/initiative.yaml", "initiative.yaml: yaml: line 24: did not find expected key"),
      p("/r/working-on/b.md", "no frontmatter: file must start with ---"),
    ]);
    expect(got).toEqual([
      { path: "/r/working-on/b.md", reasons: ["no frontmatter: file must start with ---"] },
      { path: "/r/working-on/initiative.yaml", reasons: ["initiative.yaml: yaml: line 24: did not find expected key"] },
    ]);
  });

  it("is empty for no problems, null, or only problems on files that were read", () => {
    expect(unreadFiles(undefined)).toEqual([]);
    expect(unreadFiles(null)).toEqual([]);
    expect(unreadFiles([p("/r/x.md", "missing title", false)])).toEqual([]);
  });
});

describe("words", () => {
  it("counts files in the label", () => {
    expect(unreadLabel(1)).toBe("1 file Deltagos can't read");
    expect(unreadLabel(4)).toBe("4 files Deltagos can't read");
  });

  it("shows a path under the root without the root", () => {
    expect(underRoot("/home/a/working-on/x.md", "/home/a")).toBe("working-on/x.md");
    expect(underRoot("/elsewhere/x.md", "/home/a")).toBe("/elsewhere/x.md");
    expect(underRoot("/home/ab/x.md", "/home/a")).toBe("/home/ab/x.md");
  });

  it("folds a multi-line YAML error into one line", () => {
    expect(oneLine("yaml: unmarshal errors:\n  line 8: cannot unmarshal")).toBe("yaml: unmarshal errors: line 8: cannot unmarshal");
  });
});
