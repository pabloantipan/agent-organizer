import type { model } from "../../wailsjs/go/models";

/** A file the scan could not read at all, with every reason it gave. */
export type UnreadFile = { path: string; reasons: string[] };

/** The files of an initiative the scan dropped (`Problem.unread`: no
 *  frontmatter, YAML that does not parse, a misnamed record), one entry per
 *  path in the scan's order. What such a file holds (a card, a proposed
 *  record, a decide: line) is missing from the board, so these are asks of
 *  the lead: Needs me lists them and the initiative header counts them. The
 *  other problems are about files that were read and stay where they were. */
export function unreadFiles(problems: model.Problem[] | undefined | null): UnreadFile[] {
  const out: UnreadFile[] = [];
  const at = new Map<string, UnreadFile>();
  for (const p of problems ?? []) {
    if (!p.unread) continue;
    let f = at.get(p.path);
    if (!f) {
      f = { path: p.path, reasons: [] };
      at.set(p.path, f);
      out.push(f);
    }
    if (!f.reasons.includes(p.msg)) f.reasons.push(p.msg);
  }
  return out;
}

/** "1 file Deltagos can't read", "3 files Deltagos can't read". */
export const unreadLabel = (n: number) => `${n} file${n === 1 ? "" : "s"} Deltagos can't read`;

/** A path under the initiative root as the scan's reader knows it
 *  (`working-on/x.md`); a path outside it stays whole. */
export function underRoot(path: string, root: string | undefined): string {
  if (root && path.startsWith(`${root}/`)) return path.slice(root.length + 1);
  return path;
}

/** One line for a reason: YAML errors carry newlines ("unmarshal errors:\n
 *  line 35: …"), which a row cannot hold. */
export const oneLine = (msg: string) => msg.replace(/\s*\n\s*/g, " ").trim();
