import { useState } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, FolderPlus, Layers, PanelLeftClose, PanelLeftOpen, Pencil, PencilRuler, X } from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DraggableProvidedDragHandleProps, type DropResult } from "@hello-pangea/dnd";
import type { merge, model } from "../../wailsjs/go/models";
import type { Group } from "../hooks/useWails";
import { move, uniq } from "../lib";
import { inactiveIds } from "../lib/queue";
import { useBoard } from "../stores/board.store";
import { CellStateLz, DRAFT_WAITS, IN_DEFINITION_WAITS } from "./Crew";

type Entry = { id: string; title: string; client: string; status: string; now: number; blocked: number; next: number; machines: string[]; live: number; working: number; cell?: model.Cell | null };

/** Left rail: initiatives by priority, optionally partitioned into named
 *  groups. Priority is the flat order and the rank numbers stay global; a
 *  group is a visual section of it. Groups live in the manual order, so
 *  they sync with it. Drag an initiative within or across groups, drag a
 *  group header to reorder groups, click a name to rename it. Initiatives
 *  that are not active (FR-9) leave every group and sit in one last
 *  "Not active" group, collapsed by default, that only opens them. */
export function Rail() {
  const { view, agents, selectedInitiative, setSelectedInitiative, reorderInitiatives, setGroups, railCollapsed, setRailCollapsed } = useBoard();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("rail.collapsed") || "{}"); } catch { return {}; }
  });
  const [editing, setEditing] = useState<number | null>(null);
  const inits = view?.board.initiatives ?? [];
  const ids = uniq(inits.map((i) => i.id));
  const byId = new Map<string, Entry>();
  const cells = new Map((agents?.groups ?? []).map((g) => [g.id, g.cell]));
  for (const id of ids) {
    const rows = inits.filter((i) => i.id === id);
    const first = rows[0] as merge.BoardInitiative;
    byId.set(id, {
      id,
      title: first.title,
      client: first.client,
      status: (rows.find((r) => r.local) ?? first).status,
      now: rows.reduce((a, r) => a + r.now, 0),
      blocked: rows.reduce((a, r) => a + r.blocked, 0),
      next: rows.reduce((a, r) => a + r.next, 0),
      machines: rows.map((r) => r.machine),
      live: rows.reduce((a, r) => a + (r.live ?? 0), 0),
      working: rows.reduce((a, r) => a + (r.working ?? 0), 0),
      cell: cells.get(id),
    });
  }
  const entries = ids.map((id) => byId.get(id)!);
  // Folded initiatives stay in the stored groups and the flat priority, so
  // reactivating one restores its place; the rail only leaves them out.
  const folded = inactiveIds(view);
  const activeIds = ids.filter((id) => !folded.has(id));
  const foldedIds = ids.filter((id) => folded.has(id));
  const active = activeIds.map((id) => byId.get(id)!);
  const totals = active.reduce(
    (a, e) => ({ now: a.now + e.now, blocked: a.blocked + e.blocked, next: a.next + e.next }),
    { now: 0, blocked: 0, next: 0 },
  );

  // Groups as stored, restricted to initiatives that exist, plus a trailing
  // section for the rest. The trailing section is not a group: it cannot be
  // renamed or dragged, and it disappears when empty.
  const stored: Group[] = view?.order?.groups ?? [];
  const grouped = stored.length > 0;
  const placed = new Set(stored.flatMap((g) => g.initiatives ?? []));
  const rest = activeIds.filter((id) => !placed.has(id));
  const sections: { key: string; name: string; ids: string[]; fixed: boolean }[] = grouped
    ? [
        ...stored.map((g, i) => ({ key: `g${i}`, name: g.name, ids: (g.initiatives ?? []).filter((id) => byId.has(id) && !folded.has(id)), fixed: false })),
        ...(rest.length ? [{ key: "rest", name: "ungrouped", ids: rest, fixed: true }] : []),
      ]
    : [{ key: "rest", name: "", ids: activeIds, fixed: true }];
  // Ranks count active initiatives only; a folded one has none until it is
  // active again, and then its stored place gives it back.
  const rank = new Map(activeIds.map((id, i) => [id, i + 1]));

  const isCollapsed = (key: string) => (key === FOLD ? collapsed[key] ?? true : !!collapsed[key]);
  const toggle = (key: string) => {
    const next = { ...collapsed, [key]: !isCollapsed(key) };
    setCollapsed(next);
    try { localStorage.setItem("rail.collapsed", JSON.stringify(next)); } catch { /* per-viewer convenience only */ }
  };

  const persist = (next: Group[]) => setGroups(next.map((g) => ({ name: g.name, initiatives: g.initiatives ?? [] })) as Group[]);

  const onDragEnd = (r: DropResult) => {
    if (!r.destination) return;
    if (r.type === "group") {
      if (r.destination.index === r.source.index) return;
      persist(move(stored, r.source.index, r.destination.index));
      return;
    }
    if (!grouped) {
      if (r.destination.index === r.source.index) return;
      reorderInitiatives(keepHidden(ids, move(activeIds, r.source.index, r.destination.index), folded));
      return;
    }
    // Grouped: rebuild every section's member list, then store the named
    // ones; the ungrouped remainder keeps its relative order by itself.
    const lists = new Map(sections.map((s) => [s.key, s.ids.slice()]));
    const from = lists.get(r.source.droppableId)!;
    const [id] = from.splice(r.source.index, 1);
    const to = lists.get(r.destination.droppableId)!;
    to.splice(r.destination.index, 0, id);
    const next: Group[] = stored.map((g, i) => ({ ...g, initiatives: keepHidden(g.initiatives ?? [], lists.get(`g${i}`)!, folded) }));
    if (r.destination.droppableId === "rest" || r.source.droppableId === "rest") {
      // Membership changed against the remainder; the flat order must place
      // the remainder after the groups, which Regroup does from the stored lists.
      persist(next);
      if (r.destination.droppableId === "rest" && r.source.droppableId === "rest") {
        const inGroups = next.flatMap((g) => g.initiatives ?? []);
        const placedNext = new Set(inGroups);
        reorderInitiatives([...inGroups, ...keepHidden(ids.filter((id) => !placedNext.has(id)), lists.get("rest")!, folded)]);
      }
      return;
    }
    persist(next);
  };

  const groupByClient = () => {
    const names = uniq(entries.map((e) => e.client || "other"));
    persist(names.map((n) => ({ name: n, initiatives: entries.filter((e) => (e.client || "other") === n).map((e) => e.id) })) as Group[]);
  };
  const addGroup = () => {
    const base = grouped ? stored : [{ name: "everything", initiatives: ids }];
    persist([...base, { name: "new group", initiatives: [] }] as Group[]);
    setEditing(base.length);
  };
  const rename = (i: number, name: string) => {
    setEditing(null);
    const n = name.trim();
    if (!n || n === stored[i].name) return;
    persist(stored.map((g, j) => (j === i ? { ...g, name: n } : g)) as Group[]);
  };
  const removeGroup = (i: number) => persist(stored.filter((_, j) => j !== i) as Group[]);

  const current = selectedInitiative ? byId.get(selectedInitiative) : null;
  const hero = current
    ? { eyebrow: current.client || "initiative", name: current.id, now: current.now, blocked: current.blocked, next: current.next }
    : { eyebrow: "Working on", name: "Home", ...totals };

  const item = (id: string, idx: number) => {
    const e = byId.get(id)!;
    return (
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
            <span className="rail-rank">{rank.get(e.id)}</span>
            <span className="rail-main">
              <span className="rail-title">{e.live > 0 && <span className={`live-dot ${e.working > 0 ? "working" : ""}`} title={`${e.live} live agent${e.live === 1 ? "" : "s"}${e.working > 0 ? `, ${e.working} working` : ""}`} />}{e.id}</span>
              <span className="rail-meta">
                {e.client && <span className="badge client">{e.client}</span>}
                {e.machines.length > 1 && <span className="badge">{e.machines.length} machines</span>}
                <CellStateLz cell={e.cell} />
              </span>
            </span>
            <Counts now={e.now} blocked={e.blocked} next={e.next} />
          </div>
        )}
      </Draggable>
    );
  };

  const list = (s: { key: string; ids: string[] }) => (
    <Droppable droppableId={s.key} type="initiative">
      {(drop, snap) => (
        <div ref={drop.innerRef} {...drop.droppableProps} className={`rail-group-list ${snap.isDraggingOver ? "over" : ""}`}>
          {s.ids.map((id, idx) => item(id, idx))}
          {drop.placeholder}
          {s.ids.length === 0 && !snap.isDraggingOver && <div className="rail-empty">drop initiatives here</div>}
        </div>
      )}
    </Droppable>
  );

  const head = (s: { key: string; name: string; ids: string[]; fixed: boolean }, i: number, handle?: DraggableProvidedDragHandleProps | null) => {
    const c = s.ids.reduce((a, id) => { const e = byId.get(id)!; return { now: a.now + e.now, blocked: a.blocked + e.blocked, next: a.next + e.next }; }, { now: 0, blocked: 0, next: 0 });
    const isEditing = editing === i && !s.fixed;
    return (
      <div className={`rail-group-head ${s.fixed ? "fixed" : ""}`} {...(handle ?? {})}>
        <button className="rail-chevron" onClick={() => toggle(s.key)} aria-expanded={!collapsed[s.key]} title={collapsed[s.key] ? "expand" : "collapse"}>
          {collapsed[s.key] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {isEditing ? (
          <input
            autoFocus
            className="rail-group-name-input"
            defaultValue={s.name}
            onBlur={(e) => rename(i, e.currentTarget.value)}
            onKeyDown={(e) => { if (e.key === "Enter") rename(i, e.currentTarget.value); if (e.key === "Escape") setEditing(null); }}
          />
        ) : (
          <span className="rail-group-name" onDoubleClick={() => !s.fixed && setEditing(i)} title={s.fixed ? "not in any group" : "double-click to rename, drag to reorder"}>{s.name}</span>
        )}
        <span className="rail-group-n">{s.ids.length}</span>
        <span className="spacer" />
        {collapsed[s.key] && <Counts now={c.now} blocked={c.blocked} next={c.next} />}
        {!s.fixed && !isEditing && (
          <span className="rail-group-tools">
            <button className="rail-icon" onClick={() => setEditing(i)} title="rename"><Pencil size={11} /></button>
            <button className="rail-icon" onClick={() => removeGroup(i)} title="remove group (its initiatives become ungrouped)"><X size={11} /></button>
          </span>
        )}
      </div>
    );
  };

  if (railCollapsed) {
    return (
      <nav className="rail strip">
        <button className="rail-icon strip-toggle" onClick={() => setRailCollapsed(false)} title="expand the rail"><PanelLeftOpen size={14} /></button>
        <button className={`strip-all ${selectedInitiative === null ? "active" : ""}`} onClick={() => setSelectedInitiative(null)} title={`Home: ${totals.now} now, ${totals.blocked} blocked, ${totals.next} next`}>all</button>
        {active.map((e) => (
          <button
            key={e.id}
            className={`strip-item ${selectedInitiative === e.id ? "active" : ""} ${e.blocked > 0 ? "blocked" : e.now > 0 ? "now" : ""}`}
            onClick={() => setSelectedInitiative(e.id)}
            title={`${e.id}${e.client ? ` (${e.client})` : ""}: ${e.now} now, ${e.blocked} blocked, ${e.next} next${e.live > 0 ? `, ${e.live} live agent${e.live === 1 ? "" : "s"}` : ""}${defining(e) ? `\ncell in definition: ${e.cell!.draft ? DRAFT_WAITS : IN_DEFINITION_WAITS}` : ""}`}
          >
            <span className="strip-rank">{rank.get(e.id)}</span>
            {e.live > 0 && <i className={`live-dot ${e.working > 0 ? "working" : ""}`} />}
            {defining(e) && <PencilRuler className="strip-defining" size={10} strokeWidth={2.25} aria-label="cell in definition" />}
          </button>
        ))}
      </nav>
    );
  }

  return (
    <nav className="rail">
      <button className="rail-icon strip-toggle" onClick={() => setRailCollapsed(true)} title="collapse the rail"><PanelLeftClose size={14} /></button>
      <button
        className={`rail-hero ${selectedInitiative === null ? "active" : ""}`}
        onClick={() => setSelectedInitiative(null)}
        title={selectedInitiative ? "Back to Home" : "Home: what needs you, and every initiative"}
      >
        <div className="eyebrow">{hero.eyebrow}</div>
        <div className="name">{hero.name}</div>
        <div className="stats">
          <div className="stat"><b>{hero.now}</b><span>now</span></div>
          <div className="stat"><b>{hero.blocked}</b><span>blocked</span></div>
          <div className="stat"><b>{hero.next}</b><span>next</span></div>
        </div>
        {selectedInitiative && <div className="hero-back"><ArrowLeft size={12} /> Home</div>}
      </button>
      <div className="rail-list">
        <div className="rail-label">
          <span>By priority{grouped ? ", grouped" : ""}</span>
          <span className="spacer" />
          {!grouped && activeIds.length > 0 && <button className="rail-icon" onClick={groupByClient} title="Group by client"><Layers size={12} /></button>}
          {ids.length > 0 && <button className="rail-icon" onClick={addGroup} title="New group"><FolderPlus size={12} /></button>}
          {grouped && <button className="rail-icon" onClick={() => persist([])} title="Ungroup: back to one flat list"><X size={12} /></button>}
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          {!grouped && list(sections[0])}
          {grouped && (
            <Droppable droppableId="groups" type="group">
              {(drop) => (
                <div ref={drop.innerRef} {...drop.droppableProps}>
                  {sections.filter((s) => !s.fixed).map((s, i) => (
                    <Draggable key={s.key} draggableId={s.key} index={i}>
                      {(drag, snap) => (
                        <section ref={drag.innerRef} {...drag.draggableProps} className={`rail-group ${snap.isDragging ? "dragging" : ""}`}>
                          {head(s, i, drag.dragHandleProps)}
                          {!collapsed[s.key] && list(s)}
                        </section>
                      )}
                    </Draggable>
                  ))}
                  {drop.placeholder}
                </div>
              )}
            </Droppable>
          )}
          {grouped && sections.filter((s) => s.fixed).map((s) => (
            <section key={s.key} className="rail-group">
              {head(s, -1)}
              {!collapsed[s.key] && list(s)}
            </section>
          ))}
        </DragDropContext>
        {foldedIds.length > 0 && (
          <section className="rail-group folded" aria-label="Not active">
            <div className="rail-group-head fixed">
              <button className="rail-chevron" onClick={() => toggle(FOLD)} aria-expanded={!isCollapsed(FOLD)} title={isCollapsed(FOLD) ? "expand" : "collapse"}>
                {isCollapsed(FOLD) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <span className="rail-group-name" title="paused, archived or otherwise not active; opens, never drags">Not active ({foldedIds.length})</span>
            </div>
            {!isCollapsed(FOLD) && (
              <div className="rail-group-list">
                {foldedIds.map((id) => {
                  const e = byId.get(id)!;
                  return (
                    <button key={id} type="button" className={`rail-item folded ${selectedInitiative === id ? "active" : ""}`} onClick={() => setSelectedInitiative(id)} title={e.title}>
                      <span className="rail-rank" aria-hidden="true" />
                      <span className="rail-main">
                        <span className="rail-title">{e.id}</span>
                        <span className="rail-meta">
                          <span className="badge rail-status">{e.status}</span>
                          {e.client && <span className="badge client">{e.client}</span>}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>
    </nav>
  );
}

/** The per-viewer collapse key of the Not active group; it is not a stored group. */
const FOLD = "inactive";

/** Lays `visible` over `stored`, in its new order, leaving every hidden id
 *  of `stored` in its slot, so storing what the rail shows never drops a
 *  folded initiative from its group or from the priority (FR-9). */
function keepHidden(stored: string[], visible: string[], hidden: Set<string>) {
  const q = visible.slice();
  const out: string[] = [];
  for (const id of stored) {
    if (hidden.has(id)) out.push(id);
    else if (q.length) out.push(q.shift()!);
  }
  return [...out, ...q];
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

/** FR-1 (rail): the cell's state, the same mark as the Crew header and Home;
 *  in the collapsed strip the icon alone, the word in the item's hover. */
const defining = (e: Entry) => e.cell?.state === "in_definition";
