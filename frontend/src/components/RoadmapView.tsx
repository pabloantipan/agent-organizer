import { useBoard } from "../stores/board.store";
import { Roadmap } from "./Roadmap";
import { Portfolio } from "./Portfolio";

/** The roadmap tab: portfolio Gantt for everything, card-level Gantt for the
 *  initiative selected in the rail. Always open; the tab is the toggle. */
export function RoadmapView() {
  const { view, selectedInitiative } = useBoard();
  if (!view) return <div className="empty">Loading…</div>;
  const selected = selectedInitiative ? (view.board.initiatives ?? []).find((i) => i.id === selectedInitiative) : null;
  if (!selected) {
    return (
      <div>
        <div className="board-head"><h1>All initiatives</h1><span className="meta">one row per initiative, by priority. Pick one in the rail for its cards.</span></div>
        <Portfolio />
      </div>
    );
  }
  const cards = ["now", "blocked", "next"].flatMap((st) => (view.board.columns?.[st] ?? []).filter((c) => c.initiative_id === selected.id && c.machine === selected.machine));
  return (
    <div>
      <div className="board-head">
        <h1>{selected.id}</h1>
        <span className="meta">{selected.title}</span>
        {selected.client && <span className="badge client">{selected.client}</span>}
      </div>
      <Roadmap initiative={selected} cards={cards} collapsible={false} defaultOpen />
    </div>
  );
}
