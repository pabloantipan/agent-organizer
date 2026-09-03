import { ArrowLeft } from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { merge } from "../../wailsjs/go/models";
import { move, uniq } from "../lib";
import { useBoard } from "../stores/board.store";

type Entry = { id: string; title: string; client: string; now: number; blocked: number; next: number; machines: string[]; live: number; working: number };

export function Rail() {
  const { view, selectedInitiative, setSelectedInitiative, reorderInitiatives } = useBoard();
  const inits = view?.board.initiatives ?? [];
  const ids = uniq(inits.map((i) => i.id));
  const entries: Entry[] = ids.map((id) => {
    const rows = inits.filter((i) => i.id === id);
    const first = rows[0] as merge.BoardInitiative;
    return {
      id,
      title: first.title,
      client: first.client,
      now: rows.reduce((a, r) => a + r.now, 0),
      blocked: rows.reduce((a, r) => a + r.blocked, 0),
      next: rows.reduce((a, r) => a + r.next, 0),
      machines: rows.map((r) => r.machine),
      live: rows.reduce((a, r) => a + (r.live ?? 0), 0),
      working: rows.reduce((a, r) => a + (r.working ?? 0), 0),
    };
  });
  const totals = entries.reduce(
    (a, e) => ({ now: a.now + e.now, blocked: a.blocked + e.blocked, next: a.next + e.next }),
    { now: 0, blocked: 0, next: 0 },
  );

  const onDragEnd = (r: DropResult) => {
    if (!r.destination || r.destination.index === r.source.index) return;
    reorderInitiatives(move(ids, r.source.index, r.destination.index));
  };

  const current = selectedInitiative ? entries.find((e) => e.id === selectedInitiative) : null;
  const hero = current
    ? { eyebrow: current.client || "initiative", name: current.id, now: current.now, blocked: current.blocked, next: current.next }
    : { eyebrow: "Working on", name: "Everything", ...totals };

  return (
    <nav className="rail">
      <button
        className={`rail-hero ${selectedInitiative === null ? "active" : ""}`}
        onClick={() => setSelectedInitiative(null)}
        title={selectedInitiative ? "Show all initiatives" : "Showing all initiatives"}
      >
        <div className="eyebrow">{hero.eyebrow}</div>
        <div className="name">{hero.name}</div>
        <div className="stats">
          <div className="stat"><b>{hero.now}</b><span>now</span></div>
          <div className="stat"><b>{hero.blocked}</b><span>blocked</span></div>
          <div className="stat"><b>{hero.next}</b><span>next</span></div>
        </div>
        {selectedInitiative && <div className="hero-back"><ArrowLeft size={12} /> all initiatives</div>}
      </button>
      <div className="rail-list">
      <div className="rail-label">By priority</div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="rail" type="initiative">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps}>
              {entries.map((e, idx) => (
                <Draggable key={e.id} draggableId={e.id} index={idx}>
                  {(drag, snap) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      {...drag.dragHandleProps}
                      className={`rail-item ${selectedInitiative === e.id ? "active" : ""} ${snap.isDragging ? "dragging" : ""}`}
                      onClick={() => setSelectedInitiative(e.id)}
                      title={e.title}
                    >
                      <span className="rail-rank">{idx + 1}</span>
                      <span className="rail-main">
                        <span className="rail-title">{e.live > 0 && <span className={`live-dot ${e.working > 0 ? "working" : ""}`} title={`${e.live} live agent${e.live === 1 ? "" : "s"}${e.working > 0 ? `, ${e.working} working` : ""}`} />}{e.id}</span>
                        <span className="rail-meta">
                          {e.client && <span className="badge client">{e.client}</span>}
                          {e.machines.length > 1 && <span className="badge">{e.machines.length} machines</span>}
                        </span>
                      </span>
                      <Counts now={e.now} blocked={e.blocked} next={e.next} />
                    </div>
                  )}
                </Draggable>
              ))}
              {drop.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      </div>
    </nav>
  );
}

function Counts({ now, blocked, next }: { now: number; blocked: number; next: number }) {
  return (
    <span className="rail-counts mono">
      <span className="n" title="now">{now}</span>
      <span className="b" title="blocked">{blocked}</span>
      <span className="x" title="next">{next}</span>
    </span>
  );
}
