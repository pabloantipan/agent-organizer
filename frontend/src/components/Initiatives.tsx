import { useState } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import type { merge } from "../../wailsjs/go/models";
import { Bot, ChartGantt, ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Code2, Copy, GripVertical, Kanban, Terminal } from "lucide-react";
import { api } from "../hooks/useWails";
import { ageLabel, isStale, move, shortHome, uniq } from "../lib";
import { useBoard } from "../stores/board.store";

export function Initiatives() {
  const { view, filterMachine, filterClient, setFilterMachine, setFilterClient, reorderInitiatives } = useBoard();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!view) return <div className="empty">Loading…</div>;

  const all = view.board.initiatives ?? [];
  const machines = uniq(all.map((i) => i.machine));
  const clients = uniq(all.map((i) => i.client).filter(Boolean));
  const rows = all.filter(
    (i) => (!filterMachine || i.machine === filterMachine) && (!filterClient || i.client === filterClient),
  );
  const orderIds = uniq(all.map((i) => i.id));
  const onDragEnd = (r: DropResult) => {
    if (!r.destination || r.destination.index === r.source.index) return;
    const from = orderIds.indexOf(rows[r.source.index].id);
    const to = orderIds.indexOf(rows[r.destination.index].id);
    reorderInitiatives(move(orderIds, from, to));
  };
  const allOpen = rows.length > 0 && rows.every((i) => open[`${i.machine}/${i.id}`]);
  const toggleAll = () => {
    const next: Record<string, boolean> = {};
    for (const i of rows) next[`${i.machine}/${i.id}`] = !allOpen;
    setOpen(next);
  };

  return (
    <div className="inits">
      <div className="inits-bar">
        <FilterGroup label="machine" values={machines} current={filterMachine} onPick={setFilterMachine} />
        <FilterGroup label="client" values={clients} current={filterClient} onPick={setFilterClient} />
        <span className="spacer" />
        <button className="ghost" onClick={toggleAll}>{allOpen ? <ChevronsDownUp size={14} /> : <ChevronsUpDown size={14} />} {allOpen ? "Collapse all" : "Expand all"}</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="initiatives" type="initiative">
          {(drop) => (
            <div ref={drop.innerRef} {...drop.droppableProps}>
              {rows.map((i, idx) => {
                const key = `${i.machine}/${i.id}`;
                return (
                  <Draggable key={key} draggableId={key} index={idx}>
                    {(drag, snap) => (
                      <div ref={drag.innerRef} {...drag.draggableProps} className={`init ${snap.isDragging ? "dragging" : ""} ${open[key] ? "open" : ""}`}>
                        <Row
                          i={i}
                          rank={orderIds.indexOf(i.id)}
                          isOpen={!!open[key]}
                          onToggle={() => setOpen({ ...open, [key]: !open[key] })}
                          handle={drag.dragHandleProps}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {drop.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

type RowProps = {
  i: merge.BoardInitiative;
  rank: number;
  isOpen: boolean;
  onToggle: () => void;
  handle: React.HTMLAttributes<HTMLElement> | null | undefined;
};

function Row({ i, rank, isOpen, onToggle, handle }: RowProps) {
  const { view, select, setTab, setSelectedInitiative } = useBoard();
  const cols = view?.board.columns ?? {};
  const cardsOf = (st: string) => (cols[st] ?? []).filter((c) => c.initiative_id === i.id && c.machine === i.machine);
  const lead = cardsOf("now")[0] ?? cardsOf("blocked")[0] ?? cardsOf("next")[0];
  const repos = i.repos_state ?? [];
  const dirty = repos.filter((r) => !r.missing && r.dirty > 0).length;
  const missing = repos.filter((r) => r.missing).length;
  const lastCommit = repos.map((r) => r.last_commit).filter(Boolean).sort().pop();
  const last = lastUpdated(i.last_updated);

  return (
    <>
      <div className="init-head" onClick={onToggle}>
        <span className="init-grip" {...(handle ?? {})} onClick={(e) => e.stopPropagation()} title="Drag to change priority"><GripVertical size={16} /></span>
        <span className="init-rank mono">{rank + 1}</span>
        <div className="init-main">
          <div className="init-l1">
            <span className="ident">{i.id}</span>
            {i.client && <span className="badge client">{i.client}</span>}
            <span className={`badge machine ${i.local ? "local" : "remote"}`}>{i.machine}</span>
            {i.also_on?.length > 0 && <span className="meta">also on {i.also_on.join(", ")}</span>}
            <span className="spacer" />
            <button className="counts linkish" title="Open on the board" onClick={(e) => { e.stopPropagation(); setSelectedInitiative(i.id); setTab("board"); }}>
              <span className="n">{i.now} now</span> <span className="b">{i.blocked} blk</span> <span className="x">{i.next} next</span>
              {i.done > 0 && <span className="d"> {i.done} done</span>}
            </button>
            <span className={`meta ${isStale(last, 14) ? "stale" : ""}`}>{ageLabel(last)}</span>
            <span className="init-caret">{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
          </div>
          <div className="init-l2">
            {lead ? (
              <>
                <span className={`badge ${lead.status}`}>{lead.status}</span>
                <span className="init-lead" onClick={(e) => { e.stopPropagation(); select(lead); }}>{lead.next || lead.title}</span>
              </>
            ) : (
              <span className="meta">no open cards</span>
            )}
          </div>
          <div className="init-l3 meta">
            <span>{repos.length} repo{repos.length === 1 ? "" : "s"}</span>
            {dirty > 0 && <span className="dirty">{dirty} dirty</span>}
            {missing > 0 && <span className="missing">{missing} missing</span>}
            {lastCommit && <span>last commit {lastCommit}</span>}
            {i.target && <span>target {i.target}</span>}
            {(i.agents?.length ?? 0) > 0 && (
              <button
                className={`linkish ${i.working > 0 ? "live" : ""}`}
                onClick={(e) => { e.stopPropagation(); setSelectedInitiative(i.id); setTab("agents"); }}
                title="Open in Agents"
              >{i.live} live agent{i.live === 1 ? "" : "s"}{i.working > 0 ? `, ${i.working} working` : ""}</button>
            )}
            <span className="mono path">{shortHome(i.path)}</span>
            {i.problems?.length > 0 && <span className="problem">{i.problems.length} problem{i.problems.length === 1 ? "" : "s"}</span>}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="init-body">
          {i.title && <p className="init-title">{i.title}</p>}
          <div className="init-grid">
            <section>
              <div className="section-label">Repos</div>
              {repos.length === 0 && <div className="meta">none listed in initiative.yaml</div>}
              <ul className="repos">
                {repos.map((r) => (
                  <li key={r.name}>
                    <span>{r.name}</span>
                    {r.missing ? (
                      <span className="missing" style={{ gridColumn: "2 / -1" }}>missing</span>
                    ) : (
                      <>
                        <span title={r.branch}>{r.branch}</span>
                        <span className="dirty">{r.dirty > 0 ? `±${r.dirty}` : ""}</span>
                        <span>{r.last_commit}</span>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {i.problems?.length > 0 && (
                <>
                  <div className="section-label">Problems</div>
                  {i.problems.map((p, k) => (
                    <div key={k} className="problem">{shortHome(p.path)}: {p.msg}</div>
                  ))}
                </>
              )}
            </section>
          </div>
          <Actions id={i.id} path={i.path} local={i.local} />
        </div>
      )}
    </>
  );
}

function Actions({ id, path, local }: { id: string; path: string; local: boolean }) {
  const [note, setNote] = useState<string | null>(null);
  const { setTab, setSelectedInitiative } = useBoard();
  const go = (tab: "board" | "agents" | "roadmap" | "calendar") => { setSelectedInitiative(id); setTab(tab); };
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 2500); };
  return (
    <div className="init-actions">
      <button onClick={() => go("board")}><Kanban size={14} /> Board</button>
      <button onClick={() => go("agents")}><Bot size={14} /> Agents</button>
      <button onClick={() => go("roadmap")}><ChartGantt size={14} /> Roadmap</button>
      {!local && <span className="meta">remote initiative: files are on another machine</span>}
      {local && <span className="init-sep" />}
      {local && <button onClick={() => api.openInEditor(path)}><Code2 size={14} /> Editor</button>}
      {local && <button onClick={() => api.openTerminal(path)}><Terminal size={14} /> Terminal</button>}
      {local && <button onClick={() => api.copyReviewPrompt(id).then(() => flash("review prompt copied"), (e) => flash(String(e)))}><Copy size={14} /> Copy review prompt</button>}
      {local && <button className="primary" onClick={() => api.runReview(id).then(() => flash("terminal opened with the agent"), (e) => flash(String(e)))}><Bot size={14} /> Review with agent</button>}
      {note && <span className="meta">{note}</span>}
    </div>
  );
}

function lastUpdated(v: unknown): string | undefined {
  if (!v) return undefined;
  const s = typeof v === "string" ? v : (v as Date).toISOString?.();
  if (!s || s.startsWith("0001")) return undefined;
  return s.slice(0, 10);
}

function FilterGroup({
  label, values, current, onPick,
}: { label: string; values: string[]; current: string | null; onPick: (v: string | null) => void }) {
  if (values.length < 2) return null;
  return (
    <span className="filter-group">
      <span className="meta">{label}</span>
      <button className={current === null ? "primary" : ""} onClick={() => onPick(null)}>all</button>
      {values.map((v) => (
        <button key={v} className={current === v ? "primary" : ""} onClick={() => onPick(v)}>{v}</button>
      ))}
    </span>
  );
}
