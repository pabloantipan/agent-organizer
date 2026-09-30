import { useEffect, useState } from "react";
import { useBoard } from "../stores/board.store";
import { Calendar } from "./Calendar";
import { Roadmap } from "./Roadmap";
import { Portfolio } from "./Portfolio";
import { StageRoadmap } from "./StageRoadmap";

type Mode = "stages" | "cards" | "calendar";

/** The roadmap sub-view: portfolio Gantt for everything; for the initiative
 *  selected in the rail, Stages | Cards | Calendar (FR-20). Stages opens first
 *  when the initiative has a roadmap, Cards when it has none. */
export function RoadmapView() {
  const { view, selectedInitiative, stageFocus } = useBoard();
  const [picked, setPicked] = useState<Mode | null>(null);
  // Another initiative falls back to its own default view; a stage tile
  // lands on Stages whatever was picked (initiative-header FR-4).
  useEffect(() => setPicked(null), [selectedInitiative]);
  useEffect(() => { if (stageFocus) setPicked("stages"); }, [stageFocus]);
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
  const mode: Mode = picked ?? ((selected.stages ?? []).length > 0 ? "stages" : "cards");
  const modes = (
    <div className="seg" role="tablist" aria-label="roadmap view">
      {(["stages", "cards", "calendar"] as const).map((m) => (
        <button key={m} role="tab" aria-selected={mode === m} className={mode === m ? "on" : ""} onClick={() => setPicked(m)}>
          {m === "stages" ? "Stages" : m === "cards" ? "Cards" : "Calendar"}
        </button>
      ))}
    </div>
  );
  if (mode === "stages") return <div>{modes}<StageRoadmap initiative={selected} /></div>;
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
