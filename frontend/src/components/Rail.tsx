import { useEffect, useLayoutEffect, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { Archive, ArrowLeft, ChevronDown, ChevronRight, FolderPlus, Layers, Moon, MoreHorizontal, PanelLeftClose, PanelLeftOpen, PencilRuler, X } from "lucide-react";
import { DragDropContext, Draggable, Droppable, type DraggableProvidedDragHandleProps, type DropResult } from "@hello-pangea/dnd";
import type { merge, model } from "../../wailsjs/go/models";
import type { Group } from "../hooks/useWails";
import { move, uniq } from "../lib";
import { inactiveIds } from "../lib/queue";
import { foldName, sleepyOf, sleepyWord } from "../lib/initiatives";
import { stripFolds } from "../lib/folds";
import { placeOf } from "../lib/place";
import { useBoard, type Screen } from "../stores/board.store";
import { CellStateLz, definitionWaits } from "./Crew";
import { missingPersonas } from "../lib/queue";
import { roleInitials, roleMail, roleState } from "../lib/roles";
import { openRoleFrom, RoleDrawer } from "./RoleDrawer";
import "../styles/roles.css";
import "../styles/initiatives.css";

type Entry = { id: string; title: string; client: string; status: string; now: number; blocked: number; next: number; machines: string[]; live: number; working: number; cell?: model.Cell | null; missing: string[] };

/** Left rail: initiatives by priority, optionally partitioned into named
 *  groups. Priority is the flat order and the rank numbers stay global; a
 *  group is a visual section of it. Groups live in the manual order, so
 *  they sync with it. Drag an initiative within or across groups, drag a
 *  group header to reorder groups, click a name to rename it. Initiatives
 *  that are not active (FR-9) leave every group and sit in two last folds,
 *  closed by default, that only open them: "Asleep (n)" (paused, with a
 *  link to Initiatives, where they wake) and "Archived (n)" (every other
 *  status; docs/ux/specs/initiatives-view.md, The rail). */
export function Rail() {
  const { view, agents, selectedInitiative, setSelectedInitiative, reorderInitiatives, setGroups, railCollapsed, setRailCollapsed, roleOpen, openInitiatives, screen } = useBoard();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem("rail.collapsed") || "{}"); } catch { return {}; }
  });
  const [editing, setEditing] = useState<number | null>(null);
  // A group's ⋯ to take focus once the head it sits in is drawn again
  // (after Rename ends by Enter or Escape).
  const [refocus, setRefocus] = useState<number | null>(null);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (refocus === null) return;
    navRef.current?.querySelector<HTMLElement>(`[${ACTIONS}="${refocus}"]`)?.focus();
    setRefocus(null);
  }, [refocus]);
  // The row Up and Down last moved to; null once focus leaves the rows, so
  // the next Tab enters on the current row again (FR-5, T3).
  const [cursor, setCursor] = useState<string | null>(null);
  const inits = view?.board.initiatives ?? [];
  const ids = uniq(inits.map((i) => i.id));
  const byId = new Map<string, Entry>();
  const groupsById = new Map((agents?.groups ?? []).map((g) => [g.id, g]));
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
      cell: groupsById.get(id)?.cell,
      missing: missingPersonas(groupsById.get(id)?.crew),
    });
  }
  const entries = ids.map((id) => byId.get(id)!);
  // Folded initiatives stay in the stored groups and the flat priority, so
  // reactivating one restores its place; the rail only leaves them out.
  const folded = inactiveIds(view);
  const activeIds = ids.filter((id) => !folded.has(id));
  const foldedIds = ids.filter((id) => folded.has(id));
  // The two folds (initiatives-view, The rail): asleep (paused) apart from
  // archived and every other status, which the factory cannot wake.
  const asleepIds = foldedIds.filter((id) => sleepyOf(byId.get(id)!.status) === "asleep");
  const archivedIds = foldedIds.filter((id) => sleepyOf(byId.get(id)!.status) !== "asleep");
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

  // The transversal roles (spec, The rail): those that run here, unranked.
  const allRoles = agents?.roles ?? [];
  const roles = allRoles.filter((r) => r.here);
  const initials = roleInitials(allRoles.map((r) => r.name));

  const isCollapsed = (key: string) => (key === FOLD || key === ARCHIVED ? collapsed[key] ?? true : !!collapsed[key]);
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
  const rename = (i: number, name: string, back = false) => {
    if (back) setRefocus(i);
    setEditing(null);
    const n = name.trim();
    if (!n || n === stored[i].name) return;
    persist(stored.map((g, j) => (j === i ? { ...g, name: n } : g)) as Group[]);
  };
  const removeGroup = (i: number, from?: HTMLElement) => {
    // Focus stays at the same place in the rail: the group before, else the
    // one that takes this one's place, else New group (the rail goes flat).
    const nav = from?.closest("nav");
    const to = i > 0 ? i - 1 : stored.length > 1 ? 0 : null;
    (to !== null ? nav?.querySelector<HTMLElement>(`[${ACTIONS}="${to}"]`) : nav?.querySelector<HTMLElement>("[data-new-group]"))?.focus();
    persist(stored.filter((_, j) => j !== i) as Group[]);
  };
  // Move up and Move down (FR-7, T9): the keyboard's way to reorder groups.
  // The heads are drawn by position, so the ⋯ at the new position is the
  // moved group's once the order comes back.
  const moveGroup = (i: number, to: number, from?: HTMLElement) => {
    if (to < 0 || to >= stored.length) return;
    from?.closest("nav")?.querySelector<HTMLElement>(`[${ACTIONS}="${to}"]`)?.focus();
    persist(move(stored, i, to));
  };

  // The rows in the order they are drawn: the roles above (leftovers-25
  // FR-7), then the initiatives, collapsed groups hiding theirs. Up and
  // Down walk all of them, across groups; Enter opens. Each shown group's rows are one Tab
  // stop, so Tab passes a group in its head's two stops and one row (FR-5,
  // FR-7); the roles hold no stop but the one an arrow put focus on.
  const shown = (grouped ? sections.filter((s) => !collapsed[s.key]) : sections).map((s) => s.ids);
  const roleKeys = roles.map((r) => roleKey(r.name));
  const walk = railCollapsed
    ? railWalk(roleKeys, activeIds)
    : railWalk(isCollapsed(ROLES) ? [] : roleKeys, shown.flat());
  const stops = rovingStops(railCollapsed ? [activeIds] : shown, roleKeys, selectedInitiative, cursor);
  const onRowKey = (ev: KeyboardEvent<HTMLElement>, id: string) => {
    if (ev.defaultPrevented) return; // drag's keyboard sensor has it (Space lifts, arrows move)
    if (ev.key === "Enter" && !id.startsWith(ROLE)) {
      ev.preventDefault();
      setSelectedInitiative(id);
      return;
    }
    const to = rovingMove(walk, id, ev.key);
    if (to === null) return;
    ev.preventDefault();
    setCursor(to);
    ev.currentTarget.closest("nav")?.querySelector<HTMLElement>(`[${ROW}="${CSS.escape(to)}"]`)?.focus();
  };

  const current = selectedInitiative ? byId.get(selectedInitiative) : null;
  const hero = current
    ? { eyebrow: current.client || "initiative", name: current.id, now: current.now, blocked: current.blocked, next: current.next }
    : { eyebrow: "Working on", name: "Home", ...totals };

  // One handler set for every member of the roving walk.
  const roving = (key: string) => ({
    tabIndex: stops.has(key) ? 0 : -1,
    [ROW]: key,
    onKeyDown: (ev: KeyboardEvent<HTMLElement>) => onRowKey(ev, key),
    onFocus: () => setCursor(key),
    onBlur: (ev: FocusEvent) => { if (!(ev.relatedTarget instanceof Element && ev.relatedTarget.hasAttribute(ROW))) setCursor(null); },
  });

  const item = (id: string, idx: number) => {
    const e = byId.get(id)!;
    return (
      <Draggable key={e.id} draggableId={e.id} index={idx}>
        {(drag, snap) => (
          <div
            ref={drag.innerRef}
            {...drag.draggableProps}
            {...drag.dragHandleProps}
            {...roving(e.id)}
            aria-label={rowName(e, rank.get(e.id))}
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
                <CellStateLz cell={e.cell} missing={e.missing} />
              </span>
            </span>
            <Counts now={e.now} blocked={e.blocked} next={e.next} hidden />
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
      <div className={`rail-group-head ${s.fixed ? "fixed" : ""}`} {...dragOnly(handle)}>
        <button className="rail-chevron" onClick={() => toggle(s.key)} aria-expanded={!collapsed[s.key]} aria-label={foldName(!!collapsed[s.key], s.name)} title={foldName(!!collapsed[s.key], s.name)}>
          {collapsed[s.key] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
        </button>
        {isEditing ? (
          <RenameField name={s.name} onDone={(v, back) => rename(i, v, back)} onCancel={() => { setEditing(null); setRefocus(i); }} />
        ) : (
          <span className="rail-group-name" onDoubleClick={() => !s.fixed && setEditing(i)} title={s.fixed ? "not in any group" : "double-click to rename, drag to reorder"}>{s.name}</span>
        )}
        <span className="rail-group-n">{s.ids.length}</span>
        <span className="spacer" />
        {collapsed[s.key] && <Counts now={c.now} blocked={c.blocked} next={c.next} />}
        {!s.fixed && !isEditing && (
          <GroupActions
            name={s.name}
            index={i}
            count={stored.length}
            onRename={() => setEditing(i)}
            onMove={(to, from) => moveGroup(i, to, from)}
            onRemove={(from) => removeGroup(i, from)}
          />
        )}
      </div>
    );
  };

  // A folded initiative opens (read-only) and never drags.
  const foldList = (list: string[]) => (
    <div className="rail-group-list">
      {list.map((id) => {
        const e = byId.get(id)!;
        return (
          <button key={id} type="button" className={`rail-item folded ${selectedInitiative === id ? "active" : ""}`} onClick={() => setSelectedInitiative(id)} title={e.title}>
            <span className="rail-rank" aria-hidden="true" />
            <span className="rail-main">
              <span className="rail-title">{e.id}</span>
              <span className="rail-meta">
                <span className="badge rail-status">{sleepyWord(e.status)}</span>
                {e.client && <span className="badge client">{e.client}</span>}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );

  if (railCollapsed) {
    return (
      <>
      <nav ref={navRef} id={RAIL_ID} className="rail strip" aria-label="initiatives">
        <button className="rail-icon strip-toggle" onClick={() => setRailCollapsed(false)} title="expand the rail" aria-label="Initiatives rail" aria-expanded={false} aria-controls={RAIL_ID}><PanelLeftOpen size={14} /></button>
        <button className={`strip-all ${selectedInitiative === null ? "active" : ""}`} onClick={() => setSelectedInitiative(null)} title={`Home: ${totals.now} now, ${totals.blocked} blocked, ${totals.next} next`}>all</button>
        {roles.map((r) => {
          const st = roleState(r);
          const m = roleMail(r);
          return (
            <button key={`role:${r.name}`} type="button" className={`strip-item role ${roleOpen === r.name ? "active" : ""}`} data-role={r.name} {...roving(roleKey(r.name))}
              onClick={(ev) => openRoleFrom(ev.currentTarget, r.name)} aria-label={roleItemWords(r).join(", ")} aria-haspopup="dialog" aria-expanded={roleOpen === r.name}
              title={`${r.name}: ${st.text}${m.text ? `, ${m.text}` : m.unknown ? ", mailbox not reachable" : ""}`}>
              {initials.get(r.name)}
              {st.live && <i className={`live-dot ${st.working ? "working" : ""}`} />}
            </button>
          );
        })}
        {roles.length > 0 && <span className="strip-sep" aria-hidden="true" />}
        {active.map((e) => (
          <button
            key={e.id}
            type="button"
            {...roving(e.id)}
            aria-label={rowName(e, rank.get(e.id))}
            className={`strip-item ${selectedInitiative === e.id ? "active" : ""} ${e.blocked > 0 ? "blocked" : e.now > 0 ? "now" : ""}`}
            onClick={() => setSelectedInitiative(e.id)}
            title={`${e.id}${e.client ? ` (${e.client})` : ""}: ${e.now} now, ${e.blocked} blocked, ${e.next} next${e.live > 0 ? `, ${e.live} live agent${e.live === 1 ? "" : "s"}` : ""}${defining(e) ? `\ncell in definition: ${definitionWaits(e.cell!, e.missing)}` : ""}`}
          >
            <span className="strip-rank">{rank.get(e.id)}</span>
            {e.live > 0 && <i className={`live-dot ${e.working > 0 ? "working" : ""}`} />}
            {defining(e) && <PencilRuler className="strip-defining" size={10} strokeWidth={2.25} aria-label="cell in definition" />}
          </button>
        ))}
        {/* Each fold is a muted glyph over its count, so it does not read as
            a rank; it opens Initiatives, where they are cards. */}
        {foldedIds.length > 0 && <span className="strip-sep" aria-hidden="true" />}
        <StripFoldButtons asleep={asleepIds} archived={archivedIds} onOpen={() => openInitiatives()} />
      </nav>
      <RoleDrawer />
      </>
    );
  }

  const back = heroBack(screen, selectedInitiative);

  return (
    <>
    <nav ref={navRef} id={RAIL_ID} className="rail" aria-label="initiatives">
      <button className="rail-icon strip-toggle" onClick={() => setRailCollapsed(true)} title="collapse the rail" aria-label="Initiatives rail" aria-expanded aria-controls={RAIL_ID}><PanelLeftClose size={14} /></button>
      <RailHero
        hero={hero}
        back={back}
        onBack={() => pressHero(selectedInitiative, { openInitiatives })}
      />
      <div className="rail-list">
        {roles.length > 0 && (
          <section className="rail-group roles" aria-label="Roles">
            <div className="rail-group-head fixed">
              <button className="rail-chevron" onClick={() => toggle(ROLES)} aria-expanded={!isCollapsed(ROLES)} aria-label={foldName(isCollapsed(ROLES), "Roles")} title={foldName(isCollapsed(ROLES), "Roles")}>
                {isCollapsed(ROLES) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <span className="rail-group-name" title="the transversal seats: show only, not priorities">Roles</span>
              <span className="rail-group-n">{roles.length}</span>
            </div>
            {!isCollapsed(ROLES) && (
              <div className="rail-group-list">
                {roles.map((r) => {
                  const st = roleState(r);
                  const m = roleMail(r);
                  return (
                    <button key={r.name} type="button" className={`rail-item role ${roleOpen === r.name ? "active" : ""}`} data-role={r.name} {...roving(roleKey(r.name))}
                      onClick={(ev) => openRoleFrom(ev.currentTarget, r.name)} aria-haspopup="dialog" aria-expanded={roleOpen === r.name}
                      aria-label={roleItemName(r)} title={`${r.name}: ${st.text}`}>
                      <span className="rail-rank" aria-hidden="true" />
                      <span className="rail-main">
                        <span className="rail-title">{st.live && <span className={`live-dot ${st.working ? "working" : ""}`} />}{r.name}</span>
                      </span>
                      {m.count > 0 && <span className="rail-counts mono" aria-hidden="true"><span className="m" title={m.text}>{m.count}</span></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        )}
        <div className="rail-label">
          <span>By priority{grouped ? ", grouped" : ""}</span>
          <span className="spacer" />
          {!grouped && activeIds.length > 0 && <button className="rail-icon" onClick={groupByClient} title="Group by client"><Layers size={12} /></button>}
          {ids.length > 0 && <button className="rail-icon" data-new-group onClick={addGroup} title="New group" aria-label="New group"><FolderPlus size={12} /></button>}
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
        {asleepIds.length > 0 && (
          <section className="rail-group folded" aria-label="Asleep">
            <div className="rail-group-head fixed">
              <button className="rail-chevron" onClick={() => toggle(FOLD)} aria-expanded={!isCollapsed(FOLD)} aria-label={foldName(isCollapsed(FOLD), "Asleep")} title={foldName(isCollapsed(FOLD), "Asleep")}>
                {isCollapsed(FOLD) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <span className="rail-group-name" title="asleep: opens read-only; wake one from Initiatives">Asleep ({asleepIds.length})</span>
              <span className="spacer" />
              <button className="rail-fold-link" onClick={() => openInitiatives("title")} title="asleep: opens read-only; wake one from Initiatives">Initiatives ›</button>
            </div>
            {!isCollapsed(FOLD) && foldList(asleepIds)}
          </section>
        )}
        {archivedIds.length > 0 && (
          <section className="rail-group folded" aria-label="Archived">
            <div className="rail-group-head fixed">
              <button className="rail-chevron" onClick={() => toggle(ARCHIVED)} aria-expanded={!isCollapsed(ARCHIVED)} aria-label={foldName(isCollapsed(ARCHIVED), "Archived")} title={foldName(isCollapsed(ARCHIVED), "Archived")}>
                {isCollapsed(ARCHIVED) ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              <span className="rail-group-name" title="archived: opens read-only; the factory leaves it alone">Archived ({archivedIds.length})</span>
            </div>
            {!isCollapsed(ARCHIVED) && foldList(archivedIds)}
          </section>
        )}
      </div>
    </nav>
    <RoleDrawer />
    </>
  );
}

/** What a role item is named by, in the full rail and the strip alike
 *  (leftovers-11 FR-4): its name, its state and its mail, nothing for no
 *  mail. The full rail reads `Aglaea: live · 28% context; 1 message waiting`,
 *  the strip, whose item shows only initials, `Aglaea, live · 28% context,
 *  1 message waiting`. */
function roleItemWords(r: model.Role): string[] {
  const m = roleMail(r);
  return [r.name, roleState(r).text, m.text || (m.unknown ? "mailbox not reachable" : "")].filter(Boolean);
}
const roleItemName = (r: model.Role) => { const [name, ...rest] = roleItemWords(r); return rest.length ? `${name}: ${rest.join("; ")}` : name; };

/** The per-viewer collapse key of the Roles group; it is not a stored group. */
const ROLES = "roles";
/** The per-viewer collapse keys of the Asleep and Archived folds, both
 *  closed by default; they are not stored groups. New keys, so a viewer who
 *  had opened Not active starts with both closed. */
const FOLD = "asleep";
const ARCHIVED = "archived";
/** Marks an initiative row, so Up and Down can find the next one. */
const ROW = "data-rail-row";
/** A role's key in the roving walk, apart from any initiative id. */
const ROLE = "role:";
const roleKey = (name: string) => `${ROLE}${name}`;
/** Marks a group's ⋯ by the group's position, so focus can find it again. */
const ACTIONS = "data-group-actions";
/** The rail's toggle is a disclosure of the rail (responsive-home FR-11). */
const RAIL_ID = "rail";

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

/** The one row of the rail's Tab order (FR-5, T3): the row Up and Down
 *  last reached while focus is in the rows, else the current initiative's,
 *  else the first. */
/** The Tab stops of the walk: one per shown group of rows (its stop as
 *  `rovingStop` picks it), and a role only while the arrows put focus on
 *  it, so the rail's Tab count grows with neither initiatives nor roles. */
export function rovingStops(sections: string[][], roles: string[], selected: string | null, cursor: string | null): Set<string> {
  const out = new Set(sections.filter((s) => s.length > 0).map((s) => rovingStop(s, selected, cursor)!));
  if (cursor && roles.includes(cursor)) out.add(cursor);
  return out;
}

export function rovingStop(rows: string[], selected: string | null, cursor: string | null): string | null {
  if (cursor && rows.includes(cursor)) return cursor;
  if (selected && rows.includes(selected)) return selected;
  return rows[0] ?? null;
}

/** Where Up or Down moves from `id`, held at either end; null for any other
 *  key, which the row leaves alone. */
export function rovingMove(rows: string[], id: string, key: string): string | null {
  const step = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
  if (!step) return null;
  const i = rows.indexOf(id);
  if (i < 0) return null;
  return rows[Math.min(rows.length - 1, Math.max(0, i + step))];
}

/** The roving walk in drawn order (leftovers-25 FR-7): the roles, drawn
 *  above, then the initiatives; `rovingMove` holds at both ends. */
export const railWalk = (roles: string[], rows: string[]) => [...roles, ...rows];

/** A rail row's name (FR-6, T8): the counts said as one phrase, zeros too,
 *  so every row reads the same way; the visual counts are hidden. After
 *  them, only when the row draws them (leftovers-25 FR-6): the cell in
 *  definition, the live agents, the machines. */
export function rowName(
  e: { id: string; client: string; now: number; blocked: number; next: number; cell?: { state?: string } | null; live?: number; machines?: string[] },
  rank: number | undefined,
): string {
  const live = e.live ?? 0;
  const machines = e.machines?.length ?? 0;
  return [
    e.id, e.client, rank !== undefined ? `rank ${rank}` : "", `${e.now} now`, `${e.blocked} blocked`, `${e.next} next`,
    e.cell?.state === "in_definition" ? "cell in definition" : "",
    live > 0 ? `${live} live agent${live === 1 ? "" : "s"}` : "",
    machines > 1 ? `${machines} machines` : "",
  ].filter(Boolean).join(", ");
}

/** A group's drag handle for the mouse only (FR-7, T9): out of the Tab
 *  order and not a button to AX, since Move up and Move down are the
 *  keyboard's way; the mouse sensor needs only the data attributes. */
function dragOnly(handle?: DraggableProvidedDragHandleProps | null) {
  if (!handle) return {};
  const { role: _role, "aria-describedby": _described, tabIndex: _tab, ...rest } = handle;
  return { ...rest, tabIndex: -1 };
}

const MENU = ["Rename", "Move up", "Move down", "Remove"] as const;

/** Which of a group's actions do nothing where it stands: the first group
 *  cannot move up, the last cannot move down. The menu leaves them out
 *  (leftovers-25 FR-8): nothing makes them act there, so they are not
 *  disabled items. */
export function groupActionOff(action: (typeof MENU)[number], index: number, count: number): boolean {
  return (action === "Move up" && index <= 0) || (action === "Move down" && index >= count - 1);
}

/** A group's name field while it is renamed, named `Rename <group>`
 *  (leftovers-25 FR-9). Enter keeps the name and returns to the ⋯, Escape
 *  drops it and returns there too, leaving the field keeps it. */
export function RenameField({ name, onDone, onCancel }: { name: string; onDone: (value: string, back: boolean) => void; onCancel: () => void }) {
  return (
    <input
      autoFocus
      className="rail-group-name-input"
      aria-label={`Rename ${name}`}
      defaultValue={name}
      onBlur={(e) => onDone(e.currentTarget.value, false)}
      onKeyDown={(e) => { if (e.key === "Enter") onDone(e.currentTarget.value, true); if (e.key === "Escape") onCancel(); }}
    />
  );
}

/** The group menu's items where the group stands. */
export const groupMenu = (index: number, count: number) => MENU.filter((a) => !groupActionOff(a, index, count));

/** A group head's second stop (FR-7, T9): `Actions for <group>`, a menu of
 *  Rename, Move up, Move down and Remove. Down or Return opens it on its
 *  first item; Up and Down move in it, Escape closes it back to the ⋯. */
export function GroupActions({ name, index, count, onRename, onMove, onRemove }: {
  name: string; index: number; count: number;
  onRename: () => void; onMove: (to: number, from: HTMLElement) => void; onRemove: (from: HTMLElement) => void;
}) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ up: boolean; room: number } | null>(null);
  const wrap = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLSpanElement>(null);
  const items = () => [...(wrap.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
  // The menu opens upward when the room below the ⋯ is shorter than it
  // (leftovers-25 FR-8), measured before paint so it never draws past the
  // window's edge first.
  useLayoutEffect(() => {
    if (!open) { setPlace(null); return; }
    const btn = wrap.current?.getBoundingClientRect();
    const h = menu.current?.offsetHeight ?? 0;
    if (btn) setPlace(menuPlace(btn.top, btn.bottom, h, window.innerHeight));
  }, [open]);
  useEffect(() => { if (open) items()[0]?.focus(); }, [open]);
  const close = (back: boolean) => {
    setOpen(false);
    if (back) wrap.current?.querySelector<HTMLElement>(`[${ACTIONS}]`)?.focus();
  };
  const act = (a: (typeof MENU)[number], el: HTMLElement) => {
    if (groupActionOff(a, index, count)) return;
    setOpen(false);
    if (a === "Rename") onRename();
    else if (a === "Move up") onMove(index - 1, el);
    else if (a === "Move down") onMove(index + 1, el);
    else onRemove(el);
  };
  const onMenuKey = (ev: KeyboardEvent<HTMLElement>) => {
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLElement);
    const to = ev.key === "ArrowDown" ? (at + 1) % list.length
      : ev.key === "ArrowUp" ? (at - 1 + list.length) % list.length
      : ev.key === "Home" ? 0 : ev.key === "End" ? list.length - 1 : -1;
    if (to >= 0) { ev.preventDefault(); list[to]?.focus(); return; }
    if (ev.key === "Escape") { ev.preventDefault(); close(true); return; }
    if (ev.key === "Tab") setOpen(false);
  };
  return (
    <span
      ref={wrap}
      className={`rail-group-tools ${open ? "open" : ""}`}
      onBlur={(ev) => { if (open && !(ev.relatedTarget instanceof Node && wrap.current?.contains(ev.relatedTarget))) setOpen(false); }}
    >
      <button
        type="button"
        className="rail-icon"
        {...{ [ACTIONS]: index }}
        aria-label={`Actions for ${name}`}
        title={`Actions for ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(ev) => { if (ev.key === "ArrowDown" && !open) { ev.preventDefault(); setOpen(true); } }}
      >
        <MoreHorizontal size={12} aria-hidden="true" />
      </button>
      {open && (
        <span ref={menu} role="menu" aria-label={`Actions for ${name}`} className={`rail-menu ${place?.up ? "up" : ""}`} style={place ? { maxHeight: place.room } : undefined} onKeyDown={onMenuKey}>
          {groupMenu(index, count).map((a) => (
            <button key={a} type="button" role="menuitem" tabIndex={-1} className="rail-menu-item"
              title={a === "Remove" ? "its initiatives become ungrouped" : undefined}
              onClick={(ev) => act(a, ev.currentTarget)}>
              {a}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}

/** Where a menu of height `h` opens from a button spanning `top`..`bottom`
 *  in a window `view` tall: upward when the room below is shorter than the
 *  menu and the room above is larger; `room` is the side's height (the 2 px
 *  gap counted), the menu's ceiling, so it never passes the window's edge. */
export function menuPlace(top: number, bottom: number, h: number, view: number): { up: boolean; room: number } {
  const below = Math.max(0, view - bottom - 2);
  const above = Math.max(0, top - 2);
  const up = h > below && above > below;
  return { up, room: up ? above : below };
}

function Counts({ now, blocked, next, hidden }: { now: number; blocked: number; next: number; hidden?: boolean }) {
  return (
    <span className="rail-counts mono" aria-hidden={hidden || undefined}>
      <span className="n" title="now">{now}</span>
      <span className="b" title="blocked">{blocked}</span>
      <span className="x" title="next">{next}</span>
    </span>
  );
}

/** FR-1 (rail): the cell's state, the same mark as the Crew header and Home;
 *  in the collapsed strip the icon alone, the word in the item's hover. */
const defining = (e: Entry) => e.cell?.state === "in_definition";

/** The strip's folds (leftovers-16 FR-2; initiatives-view A1): a moon over
 *  the asleep count, a box over the archived count, each named
 *  `Asleep, n initiatives`. */
export function StripFoldButtons({ asleep, archived, onOpen }: { asleep: string[]; archived: string[]; onOpen: () => void }) {
  return (
    <>
      {stripFolds(asleep, archived).map((f) => {
        const Glyph = f.fold === "asleep" ? Moon : Archive;
        return (
          <button key={f.fold} className={`strip-item strip-fold ${f.fold}`} onClick={onOpen} title={f.title} aria-label={f.name}>
            <Glyph className="strip-fold-glyph" size={14} aria-hidden="true" />
            <span className="strip-rank">{f.n}</span>
          </button>
        );
      })}
    </>
  );
}

type Hero = { eyebrow: string; name: string; now: number; blocked: number; next: number };

/** The rail's hero (leftovers-21 FR-1, FR-2; initiatives-view A6 §1, I39).
 *  A summary on every screen, with no role and no press: the Home tab is
 *  the way Home. On an initiative its one control is `← Initiatives`, so a
 *  press on the counts never leaves the initiative. */
export function RailHero({ hero, back, onBack }: { hero: Hero; back: boolean; onBack: () => void }) {
  return (
    <div className="rail-hero">
      {back && (
        <button className="hero-back" onClick={onBack} aria-label="Back to Initiatives" title="Back to Initiatives">
          <ArrowLeft size={12} aria-hidden="true" /> Initiatives
        </button>
      )}
      <div className="eyebrow">{hero.eyebrow}</div>
      <div className="name">{hero.name}</div>
      <div className="stats" aria-hidden="true">
        <div className="stat"><b>{hero.now}</b><span>now</span></div>
        <div className="stat"><b>{hero.blocked}</b><span>blocked</span></div>
        <div className="stat"><b>{hero.next}</b><span>next</span></div>
      </div>
      <span className="sr-only">{heroSaid(hero)}</span>
    </div>
  );
}

/** The counts as one phrase (FR-7; initiatives-view A6 §3, I40): the visual
 *  stats are hidden from AX and this line, visually hidden inside the hero,
 *  is what a screen reader reads. Not an aria-label on the div: WebKit does
 *  not announce that reliably. */
export const heroSaid = (h: { now: number; blocked: number; next: number }) => `${h.now} now, ${h.blocked} blocked, ${h.next} next`;

/** The hero's back link follows the bar's parent mark (initiatives-view A4
 *  §2, I29): an initiative belongs to Initiatives (`placeOf`), whichever
 *  door opened it, so the rail and the bar never disagree. */
export function heroBack(screen: Screen, selectedInitiative: string | null): boolean {
  return !!selectedInitiative && screen === "initiative" && placeOf(screen) === "initiatives";
}

/** Back lands on the initiative's own card in Initiatives. It is the hero's
 *  only press (FR-6): the hero is no way Home, the Home tab is. */
export function pressHero(selectedInitiative: string | null, to: { openInitiatives: (focus?: string | null) => void }) {
  to.openInitiatives(selectedInitiative);
}
