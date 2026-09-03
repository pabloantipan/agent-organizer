import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { merge } from "../../wailsjs/go/models";
import { Bot, ChevronDown, ChevronRight, Copy, FolderOpen } from "lucide-react";
import { api } from "../hooks/useWails";
import { move, uniq } from "../lib";
import { useBoard } from "../stores/board.store";
import { CardItem } from "./CardItem";

const COLUMNS: { id: string; label: string; empty: string }[] = [
  { id: "now", label: "Now", empty: "Nothing in flight. Pick a next." },
  { id: "blocked", label: "Blocked", empty: "Nothing blocked." },
  { id: "next", label: "Next", empty: "No queue." },
];

export function Board() {
  const { view, filterMachine, filterClient, selectedInitiative, reorderCards } = useBoard();
  const [doneOpen, setDoneOpen] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const flash = (msg: string) => { setNote(msg); window.setTimeout(() => setNote(null), 2500); };
  const copyPrompt = async (id: string) => {
    try { await api.copyReviewPrompt(id); flash("review prompt copied"); } catch (e) { flash(String(e)); }
  };
  const runReview = async (id: string) => {
    try { await api.runReview(id); flash("terminal opened with the agent"); } catch (e) { flash(String(e)); }
  };
  if (!view) return <div className="empty">Loading…</div>;
  const cols = view.board.columns ?? {};
  const pass = (c: merge.BoardCard) =>
    (!filterMachine || c.machine === filterMachine) &&
    (!filterClient || c.client === filterClient) &&
    (!selectedInitiative || c.initiative_id === selectedInitiative);
  const visible: Record<string, merge.BoardCard[]> = {};
  for (const col of COLUMNS) visible[col.id] = (cols[col.id] ?? []).filter(pass);
  const done = selectedInitiative ? (cols["done"] ?? []).filter(pass) : [];
  const DONE_CAP = 10;

  // Cards are draggable only inside one initiative: an order across
  // initiatives is the rail's job, not the column's.
  const canDrag = selectedInitiative !== null;

  const onDragEnd = (r: DropResult) => {
    if (!canDrag || !r.destination) return;
    if (r.destination.droppableId !== r.source.droppableId) return;
    if (r.destination.index === r.source.index) return;
    const status = r.source.droppableId;
    const moved = move(uniq(visible[status].map((c) => c.slug)), r.source.index, r.destination.index);
    const slugs = COLUMNS.flatMap((col) => (col.id === status ? moved : uniq(visible[col.id].map((c) => c.slug))));
    reorderCards(selectedInitiative!, slugs);
  };

  const header = selectedInitiative
    ? view.board.initiatives.find((i) => i.id === selectedInitiative)
    : null;

  return (
    <div className="board-wrap">
      {header && (
        <div className="board-head">
          <h1>{header.id}</h1>
          <span className="meta">{header.title}</span>
          {header.client && <span className="badge client">{header.client}</span>}
          {header.live > 0 && <span className="badge live" title="agent processes on this machine">{header.live} live{header.working > 0 ? `, ${header.working} working` : ""}</span>}
          <span className="spacer" />
          {note && <span className="meta">{note}</span>}
          {header.local && (
            <>
              <button onClick={() => copyPrompt(header.id)} title="Copy a prompt that asks an agent to review this initiative and update its cards"><Copy size={14} /> Copy review prompt</button>
              <button className="primary" onClick={() => runReview(header.id)} title="Open a terminal in this initiative running the agent with the review prompt"><Bot size={14} /> Review with agent</button>
            </>
          )}
        </div>
      )}
      {!header && (
        <div className="board-head">
          <h1>All initiatives</h1>
          <span className="meta">select one in the rail to reorder its cards</span>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {COLUMNS.map((col) => {
            const cards = visible[col.id];
            return (
              <Droppable key={col.id} droppableId={col.id} type={col.id} isDropDisabled={!canDrag}>
                {(drop, dropSnap) => (
                  <section
                    ref={drop.innerRef}
                    {...drop.droppableProps}
                    className={`column ${col.id} ${dropSnap.isDraggingOver ? "over" : ""}`}
                  >
                    <h2>
                      {col.label} <span className="count">{cards.length}</span>
                    </h2>
                    {cards.length === 0 && <div className="empty">{col.empty}</div>}
                    {cards.map((c, idx) => {
                      const key = `${c.machine}/${c.initiative_id}/${c.slug}`;
                      const showGroup = !selectedInitiative && (idx === 0 || cards[idx - 1].initiative_id !== c.initiative_id);
                      return (
                        <div key={key}>
                          {showGroup && <div className="group-label">{c.initiative_id}</div>}
                          <Draggable draggableId={key} index={idx} isDragDisabled={!canDrag}>
                            {(drag, snap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                className={snap.isDragging ? "drag-wrap dragging" : "drag-wrap"}
                              >
                                <CardItem card={c} compact={!!selectedInitiative} />
                              </div>
                            )}
                          </Draggable>
                        </div>
                      );
                    })}
                    {drop.placeholder}
                  </section>
                )}
              </Droppable>
            );
          })}
          {header && (
            <section className={`column done ${doneOpen ? "" : "collapsed"}`}>
              <h2>
                <button className="ghost col-toggle" onClick={() => setDoneOpen(!doneOpen)} aria-expanded={doneOpen}>
                  {doneOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />} Done <span className="count">{done.length}</span>
                </button>
              </h2>
              {doneOpen && done.length === 0 && <div className="empty">Nothing finished yet.</div>}
              {doneOpen && done.slice(0, DONE_CAP).map((c) => (
                <div key={`${c.machine}/${c.slug}`} className="done-wrap">
                  <CardItem card={c} compact />
                </div>
              ))}
              {doneOpen && header.local && (
                <button className="ghost" style={{ width: "100%", marginTop: 4 }} onClick={() => api.openInEditor(`${header.path}/working-on/done`)}>
                  <FolderOpen size={14} /> {done.length > DONE_CAP ? `${done.length - DONE_CAP} more · open done/ in editor` : "open done/ in editor"}
                </button>
              )}
            </section>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}
