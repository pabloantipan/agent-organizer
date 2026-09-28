import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { merge, model } from "../../wailsjs/go/models";
import { ChevronDown, ChevronRight, FolderOpen } from "lucide-react";
import { api, type CardRuns } from "../hooks/useWails";
import { move, uniq } from "../lib";
import { useBoard } from "../stores/board.store";
import { CardItem, inReview } from "./CardItem";
import { WaveStrip, running } from "./WaveStrip";
import "../styles/work.css";

/** The status columns take drags within themselves; nothing else does. */
const STATUS: { id: string; label: string; hint: string; empty: string }[] = [
  { id: "next", label: "Next", hint: "not started", empty: "No queue." },
  { id: "now", label: "Now", hint: "being built", empty: "Nothing in flight. Pick a next." },
  { id: "blocked", label: "Blocked", hint: "names who unblocks", empty: "Nothing blocked." },
];
const DONE_CAP = 10;
const waveOf = (seat: string | undefined) => {
  const m = /^wave(\d+)-/i.exec((seat ?? "").trim());
  return m ? Number(m[1]) : undefined;
};

/** Work (FR-19): Next · Now · Blocked · In review · Done, a wave strip per
 *  running wave, and on each card who is on it. In review is a lane, not a
 *  status (0018): the open cards whose next starts with `review:` leave their
 *  status column for it. Nothing here writes a card: a drag reorders within
 *  one status column, and the lane and Done take no drops. */
export function Board() {
  const { view, filterMachine, filterClient, selectedInitiative, reorderCards, agents, applyAgents, select } = useBoard();
  const [doneOpen, setDoneOpen] = useState(false);
  const [runs, setRuns] = useState<Record<string, CardRuns>>({});

  useEffect(() => {
    if (!agents) api.getAgents().then(applyAgents, () => undefined);
  }, [agents, applyAgents]);

  // FR-10: per-card tokens over the archive and live sessions, re-read with
  // each rescan of the board.
  useEffect(() => {
    if (!selectedInitiative) return;
    let live = true;
    api.runs(selectedInitiative).then(
      (v) => live && setRuns(Object.fromEntries((v.cards ?? []).map((c) => [c.card, c]))),
      () => live && setRuns({}),
    );
    return () => { live = false; };
  }, [selectedInitiative, view]);

  if (!view) return <div className="work-empty">Loading…</div>;
  const cols = view.board.columns ?? {};
  const pass = (c: merge.BoardCard) =>
    (!filterMachine || c.machine === filterMachine) &&
    (!filterClient || c.client === filterClient) &&
    (!selectedInitiative || c.initiative_id === selectedInitiative);
  const visible: Record<string, merge.BoardCard[]> = {};
  for (const col of STATUS) visible[col.id] = (cols[col.id] ?? []).filter((c) => pass(c) && !inReview(c.next));
  const review = STATUS.flatMap((col) => (cols[col.id] ?? []).filter((c) => pass(c) && inReview(c.next)));
  const done = (cols["done"] ?? []).filter(pass);

  const group = agents?.groups?.find((g) => g.id === selectedInitiative);
  const waves = (group?.waves ?? []).filter(running);
  const agentOf: Record<string, model.Agent> = {};
  for (const a of group?.agents ?? []) if (a.card?.slug) agentOf[a.card.slug] = a;

  // Cards are draggable only inside one initiative: an order across
  // initiatives is the rail's job, not the column's.
  const canDrag = selectedInitiative !== null;

  const onDragEnd = (r: DropResult) => {
    if (!canDrag || !r.destination) return;
    if (r.destination.droppableId !== r.source.droppableId) return;
    if (r.destination.index === r.source.index) return;
    const status = r.source.droppableId;
    const moved = move(uniq(visible[status].map((c) => c.slug)), r.source.index, r.destination.index);
    const slugs = STATUS.flatMap((col) => (col.id === status ? moved : uniq(visible[col.id].map((c) => c.slug))))
      .concat(uniq(review.map((c) => c.slug)));
    reorderCards(selectedInitiative!, slugs);
  };

  const openSlug = (slug: string) => {
    const all = [...STATUS.flatMap((col) => cols[col.id] ?? []), ...done].filter(pass);
    const card = all.find((c) => c.slug === slug && c.local) ?? all.find((c) => c.slug === slug);
    if (card) select(card);
  };

  const item = (c: merge.BoardCard) => (
    <CardItem card={c} compact={!!selectedInitiative} agent={agentOf[c.slug]} runs={runs[c.slug]} wave={waveOf(c.seat)} />
  );
  const head = (id: string, label: string, n: number, hint: string) => (
    <h2 className="wk-col-head">
      <span className={`wk-col-dot ${id}`} aria-hidden />
      {label} <span className="wk-num wk-count">{n}</span>
      <small>{hint}</small>
    </h2>
  );
  const initiative = view.board.initiatives.find((i) => i.id === selectedInitiative);

  return (
    <div className="work">
      {waves.map((w) => <WaveStrip key={w.n} wave={w} onOpen={openSlug} />)}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={`wk-cols ${doneOpen ? "done-open" : ""}`}>
          {STATUS.map((col) => {
            const cards = visible[col.id];
            return (
              <Droppable key={col.id} droppableId={col.id} type={col.id} isDropDisabled={!canDrag}>
                {(drop, dropSnap) => (
                  <section
                    ref={drop.innerRef}
                    {...drop.droppableProps}
                    className={`wk-col ${col.id} ${dropSnap.isDraggingOver ? "over" : ""}`}
                  >
                    {head(col.id, col.label, cards.length, col.hint)}
                    {cards.length === 0 && <div className="work-empty">{col.empty}</div>}
                    {cards.map((c, idx) => {
                      const key = `${c.machine}/${c.initiative_id}/${c.slug}`;
                      return (
                        <Draggable key={key} draggableId={key} index={idx} isDragDisabled={!canDrag}>
                          {(drag, snap) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              className={snap.isDragging ? "wk-drag dragging" : "wk-drag"}
                            >
                              {item(c)}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {drop.placeholder}
                  </section>
                )}
              </Droppable>
            );
          })}
          <section className="wk-col review" aria-label="In review">
            {head("review", "In review", review.length, "next: review…")}
            {review.length === 0 && <div className="work-empty">Nothing waiting on a reviewer.</div>}
            {review.map((c) => <div key={`${c.machine}/${c.initiative_id}/${c.slug}`}>{item(c)}</div>)}
          </section>
          <section className={`wk-col done ${doneOpen ? "" : "collapsed"}`}>
            <h2 className="wk-col-head">
              <button className="ghost wk-col-toggle" onClick={() => setDoneOpen(!doneOpen)} aria-expanded={doneOpen}>
                {doneOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span className="wk-col-dot done" aria-hidden />
                Done <span className="wk-num wk-count">{done.length}</span>
              </button>
            </h2>
            {doneOpen && done.length === 0 && <div className="work-empty">Nothing finished yet.</div>}
            {doneOpen && done.slice(0, DONE_CAP).map((c) => <div key={`${c.machine}/${c.slug}`}>{item(c)}</div>)}
            {doneOpen && initiative?.local && (
              <button className="ghost wk-done-more" onClick={() => api.openInEditor(`${initiative.path}/working-on/done`)}>
                <FolderOpen size={14} /> {done.length > DONE_CAP ? `${done.length - DONE_CAP} more · open done/ in editor` : "open done/ in editor"}
              </button>
            )}
          </section>
        </div>
      </DragDropContext>
    </div>
  );
}
