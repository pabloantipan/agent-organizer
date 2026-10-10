import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { BoardView } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";
import { floatList, type FloatRow } from "../lib/floatList";
import { FloatFolds } from "./FloatList";

// FloatList.tsx's folds rendered over active, paused and archived
// initiatives (leftovers-16 F2, Amendment 1).
const initiative = (id: string, status = "active") => ({ id, local: true, status, goal: "", decisions: [] }) as unknown as merge.BoardInitiative;
const board = (initiatives: merge.BoardInitiative[]) => ({ board: { initiatives, columns: {} }, order: { groups: [], resolved: {} } }) as unknown as BoardView;
const row = (r: FloatRow) => <span key={r.id} className="row">{r.id}</span>;
const render = (view: BoardView, query = "", open = { asleep: false, archived: false }) =>
  renderToStaticMarkup(<FloatFolds list={floatList(view, null)} query={query} open={open} onToggle={() => undefined} row={row} />);
const text = (html: string) => html.replace(/<svg[\s\S]*?<\/svg>/g, "").replace(/<[^>]+>/g, "|").split("|").map((s) => s.trim()).filter(Boolean);

describe("the floating list's folds (leftovers-16 F2)", () => {
  const mixed = board([initiative("a"), initiative("nap", "paused"), initiative("old", "archived"), initiative("gone", "done"), initiative("nap2", "paused")]);

  it("shows Asleep (n) for the paused only, then Archived (n) for the rest", () => {
    expect(text(render(mixed))).toEqual(["Asleep (2)", "Archived (2)"]);
  });

  it("lists each fold's own initiatives when open, never an archived one under Asleep", () => {
    expect(text(render(mixed, "", { asleep: true, archived: true }))).toEqual(["Asleep (2)", "nap", "nap2", "Archived (2)", "old", "gone"]);
    expect(text(render(mixed, "", { asleep: true, archived: false }))).toEqual(["Asleep (2)", "nap", "nap2", "Archived (2)"]);
  });

  it("draws no Archived fold when nothing is archived, and no Asleep when nothing is paused", () => {
    expect(text(render(board([initiative("a"), initiative("nap", "paused")])))).toEqual(["Asleep (1)"]);
    expect(text(render(board([initiative("a"), initiative("old", "archived")])))).toEqual(["Archived (1)"]);
    expect(render(board([initiative("a")]))).toBe("");
  });

  it("names each fold's group by its word", () => {
    const html = render(mixed);
    expect(html).toContain('role="group" aria-label="Asleep"');
    expect(html).toContain('role="group" aria-label="Archived"');
  });
});
