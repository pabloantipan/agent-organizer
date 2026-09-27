import { useState } from "react";
import { useBoard } from "../stores/board.store";
import { Calendar } from "./Calendar";
import { Roadmap } from "./Roadmap";
import { Portfolio } from "./Portfolio";

/** The roadmap tab: portfolio Gantt for everything, card-level Gantt for the
 *  initiative selected in the rail. Always open; the tab is the toggle. */
export function RoadmapView() {
  const { view, selectedInitiative } = useBoard();
  const [mode, setMode] = useState<"cards" | "calendar">("cards");
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
  // Calendar moved into Roadmap (FR-14): a switch, the month grid as it was.
  const modes = (
    <div className="seg" role="tablist" aria-label="roadmap view">
      <button role="tab" aria-selected={mode === "cards"} className={mode === "cards" ? "on" : ""} onClick={() => setMode("cards")}>Cards</button>
      <button role="tab" aria-selected={mode === "calendar"} className={mode === "calendar" ? "on" : ""} onClick={() => setMode("calendar")}>Calendar</button>
    </div>
  );
  if (mode === "calendar") return <div>{modes}<Calendar /></div>;
  const cards = ["now", "blocked", "next"].flatMap((st) => (view.board.columns?.[st] ?? []).filter((c) => c.initiative_id === selected.id && c.machine === selected.machine));
  return (
    <div>
      {modes}
      <div className="board-head">
        <h1>{selected.id}</h1>
        <span className="meta">{selected.title}</span>
        {selected.client && <span className="badge client">{selected.client}</span>}
      </div>
      <Roadmap initiative={selected} cards={cards} collapsible={false} defaultOpen />
    </div>
  );
}
