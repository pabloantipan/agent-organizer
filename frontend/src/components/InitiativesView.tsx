import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { api } from "../hooks/useWails";
import type { merge, service } from "../../wailsjs/go/models";
import { Factory, Sleep, Wake } from "../../wailsjs/go/main/App";
import { useBoard } from "../stores/board.store";
import { uniq } from "../lib";
import { dateWords } from "../lib/dates";
import { needsMeRows } from "../lib/queue";
import { sessionRows } from "../lib/memory";
import {
  afterLine, confirmLines, countWords, DEFAULT_LIMIT, doneLine, factoryLine, firstLine, isLimitRefusal, landingOf, limitLine, limitNames, limitParts,
  memoryLine, mostMemory, nextLine, progressLine, refusedWakeName, sectionsOf, sessionBytes, sessionsLine, sinceLine,
  sleepyOf, sleepyWord, storeArchivedOpen, storedArchivedOpen, waitingOf, waitLine, type Sleepy,
} from "../lib/initiatives";
import { escapeCloses } from "../lib/focus";
import { nextDate } from "./InitiativeHeader";
import "../styles/initiatives.css";

type Action = "sleep" | "wake";
/** What one card says under itself after a press (her §5, §6, States). */
type Note =
  | { kind: "wait"; text: string }
  | { kind: "limit"; text: string }
  | { kind: "refused"; words: string }
  | { kind: "failed"; action: Action; words: string; after: string; agents: boolean };

type Card = {
  id: string; state: Sleepy; local: boolean; i: merge.BoardInitiative;
  live: number; working: string[]; frozen: number; machine: string;
};

/** Initiatives (docs/ux/specs/initiatives-view.md; docs/specs/initiatives-view.md
 *  FR-5): every initiative as a card, awake, asleep, then archived, each in
 *  the rail's order, with Sleep and Wake through the factory. Deltagos
 *  writes no status: `App.Sleep`/`App.Wake` run `factory sleep|wake`, never
 *  --force, and the rescan says what is true. The words are lib/initiatives. */
export function InitiativesView() {
  const { view, agents, refresh, applyAgents, openInitiative, initiativesFocus, clearInitiativesFocus } = useBoard();
  const [factory, setFactory] = useState<service.FactoryView | null>(null);
  const [archivedOpen, setArchivedOpen] = useState(storedArchivedOpen);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [running, setRunning] = useState<{ id: string; action: Action; sessions: number } | null>(null);
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [announce, setAnnounce] = useState("");
  // Where focus goes once the view has drawn the new state: a card's id
  // (done), its note (a refused Wake), or its control.
  const [land, setLand] = useState<{ id: string; to: "id" | "note" | "action"; seq: number } | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);

  // What the last rescan learned of the factory; Board() asks it, Factory()
  // only reads the answer, so it is cheap on every board change.
  const board = view?.board;
  useEffect(() => { Factory().then(setFactory, () => setFactory(null)); }, [board]);
  // Sessions and memory ride the 10 s agents feed; a view opened before its
  // first tick asks for it, so Sleep's confirm never misses a live session.
  useEffect(() => { if (!agents) api.getAgents().then(applyAgents, () => undefined); }, [agents, applyAgents]);

  // Every initiative once, judged by its local row, in the board's order
  // (the rail's priority).
  const all = board?.initiatives ?? [];
  const groups = new Map((agents?.groups ?? []).map((g) => [g.id, g]));
  const cards: Card[] = uniq(all.map((i) => i.id)).map((id) => {
    const rows = all.filter((r) => r.id === id);
    const i = rows.find((r) => r.local) ?? rows[0];
    const g = groups.get(id);
    const live = (g?.agents ?? []).filter((a) => a.pid > 0 && a.state !== "exited");
    return {
      id, i, local: !!i.local, machine: i.machine, state: sleepyOf(i.status),
      live: i.local ? (g?.live ?? i.live ?? 0) : 0,
      working: uniq(live.filter((a) => a.state === "working").map((a) => a.short || a.session || a.name)),
      frozen: i.frozen?.length ?? 0,
    };
  });
  const sections = sectionsOf(cards);
  const awakeLocal = sections.awake.filter((c) => c.local);
  // Missing or failing, the factory has no limit to show (I15).
  const limit = factory?.found && factory.ok ? (factory.limit > 0 ? factory.limit : DEFAULT_LIMIT) : null;
  const blind = cards.filter((c) => c.local && c.i.factory_blind && c.state === "awake").map((c) => c.id);
  const count = countWords(awakeLocal.length, limit, factory?.ok ? factory.awake : null, blind);
  const atLimit = limit !== null && awakeLocal.length >= limit;
  const noFactory = factoryLine(factory);
  const rows = needsMeRows(view, agents);
  const most = mostMemory(agents, awakeLocal.map((c) => c.id));
  const bySession = sessionRows(agents);

  const canAct = (c: Card) => c.local && !!factory?.found && !!factory.ok && !c.i.factory_blind && (c.state === "awake" || c.state === "asleep");
  const setNote = (id: string, n: Note | null) => setNotes((m) => { const x = { ...m }; if (n) x[id] = n; else delete x[id]; return x; });

  const focusIn = useCallback((id: string, sel: string) => {
    const el = box.current?.querySelector<HTMLElement>(`[data-card="${CSS.escape(id)}"] ${sel}`);
    if (!el) return false;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: "nearest" });
    return true;
  }, []);

  useEffect(() => {
    if (!land) return;
    // A card with no button (the factory missing, or blind) takes focus on its id.
    if (!focusIn(land.id, land.to === "id" ? ".ic-id" : land.to === "note" ? ".ic-note" : ".ic-act")) focusIn(land.id, ".ic-id");
    setLand(null);
  }, [land, focusIn]);

  // Home's and the rail's Initiatives › land on the view's title as soon as
  // it draws (leftovers-15 FR-6); the header's Wake in Initiatives › on
  // that card's Wake, once the factory's answer has drawn it.
  useEffect(() => {
    const to = landingOf(initiativesFocus);
    if (!to || !view) return;
    if (to.to === "title") {
      clearInitiativesFocus();
      title.current?.focus({ preventScroll: true });
      return;
    }
    if (!factory) return;
    clearInitiativesFocus();
    setLand({ id: to.id, to: "action", seq: Date.now() });
  }, [initiativesFocus, view, factory, clearInitiativesFocus]);

  const run = async (c: Card, action: Action) => {
    setConfirm(null);
    setNote(c.id, null);
    // Focus moves to the card's id before its button disables (Focus and names).
    focusIn(c.id, ".ic-id");
    const sessions = action === "sleep" ? c.live : c.frozen;
    setRunning({ id: c.id, action, sessions });
    let after: { status: string; ok: boolean; words: string; limit: boolean } | null = null;
    let err: string | null = null;
    try {
      const r = await (action === "sleep" ? Sleep(c.id) : Wake(c.id));
      after = { status: r.status, ok: r.ok, words: r.output ?? "", limit: isLimitRefusal(r) };
      if (r.factory) setFactory(r.factory);
    } catch (e) {
      err = String(e).replace(/^Error:\s*/, "");
    }
    // The rescan: the board (rail, Home and this view follow it) and the
    // sessions, so a failure says what still runs.
    await refresh();
    const fresh = await api.getAgents().catch(() => null);
    if (fresh) applyAgents(fresh);
    setRunning(null);
    const status = after?.status ?? c.i.status ?? "";
    if (after?.ok) {
      setAnnounce(doneLine(c.id, action));
      setLand({ id: c.id, to: "id", seq: Date.now() });
      return;
    }
    if (after?.limit) {
      setNote(c.id, { kind: "refused", words: after.words.trim() });
    } else {
      const still = (fresh?.groups ?? []).find((g) => g.id === c.id)?.agents?.filter((a) => a.pid > 0 && a.state !== "exited").map((a) => a.short || a.session || a.name) ?? [];
      const said = after ? firstLine(after.words) : firstLine(err ?? "");
      setNote(c.id, { kind: "failed", action, words: said, after: afterLine(c.id, action, status, still.length, uniq(still)), agents: action === "sleep" && sleepyOf(status) === "asleep" && still.length > 0 });
    }
    setLand({ id: c.id, to: "note", seq: Date.now() });
  };

  const press = (c: Card, action: Action) => {
    if (running) { setNote(c.id, { kind: "wait", text: waitLine(running) }); setLand({ id: c.id, to: "note", seq: Date.now() }); return; }
    if (action === "wake") {
      if (atLimit) { setNote(c.id, { kind: "limit", text: limitLine(awakeLocal.map((a) => a.id)) }); setLand({ id: c.id, to: "note", seq: Date.now() }); return; }
      void run(c, "wake");
      return;
    }
    const lines = confirmLines(c.id, c.live, c.working, waitingOf(rows, c.id), awakeLocal.length === 1).lines;
    if (lines.length === 0) { void run(c, "sleep"); return; }
    setNote(c.id, null);
    setConfirm(c.id);
  };

  const cancel = (id: string) => { setConfirm(null); setLand({ id, to: "action", seq: Date.now() }); };

  const toggleArchived = () => setArchivedOpen(storeArchivedOpen(!archivedOpen));

  if (!view) return <div className="ivw"><div className="empty">Loading…</div></div>;

  const card = (c: Card) => {
    const i = c.i;
    const isRunning = running?.id === c.id;
    const next = nextLine(nextDate(i, cardsOf(view, c.id)), (d) => dateWords(d));
    const since = c.state === "asleep" ? sinceLine(i.asleep_since, (d) => dateWords(d)) : null;
    const top = bySession.filter((s) => s.initiative === c.id).slice(0, 3).map((s) => sessionBytes(s.name, s.bytes));
    const mem = c.local ? memoryLine(agents, c.id, most === c.id, top) : null;
    // A refusal at the limit goes stale once the limit no longer holds.
    const note = notes[c.id]?.kind === "limit" && !atLimit ? undefined : notes[c.id];
    const asking = confirm === c.id;
    const conf = asking ? confirmLines(c.id, c.live, c.working, waitingOf(rows, c.id), awakeLocal.length === 1) : null;
    const action: Action | null = c.state === "awake" ? "sleep" : c.state === "asleep" ? "wake" : null;
    const refused = action === "wake" && atLimit;
    const sessions = isRunning ? progressLine(running.action, running.sessions) : sessionsLine(c.state, c.live, c.frozen, c.working.length);
    const noteId = `ic-note-${c.id}`;
    return (
      <article key={c.id} className={`ic ${c.state}`} data-card={c.id} aria-labelledby={`ic-id-${c.id}`}>
        <div className="ic-head">
          <button id={`ic-id-${c.id}`} className="ic-id mono" onClick={() => openInitiative(c.id, "overview")}
            title={c.state === "awake" ? `open ${c.id}` : `open ${c.id}, read-only`}>{c.id}</button>
          {i.client && <span className="lz tone ic-client" title={i.client}>{i.client}</span>}
          <span className={`lz ic-word ${c.state}`}>{sleepyWord(i.status)}</span>
        </div>
        <div className={`ic-goal ${i.goal ? "" : "missing"}`} title={i.goal || undefined}>{i.goal || "no goal yet"}</div>
        {c.state !== "archived" && <div className="ic-line num" aria-live={isRunning ? "polite" : undefined}>{sessions}</div>}
        {mem && c.state !== "archived" && <div className="ic-line num" title={mem.title || undefined}>{mem.text}</div>}
        <div className={`ic-line ${next.none ? "missing" : ""}`} title={next.title}>{next.text}</div>
        {since && <div className="ic-line">{since}</div>}
        {c.state === "archived" && <div className="ic-line missing">archived: the factory leaves it alone</div>}
        {!c.local && c.state !== "archived" && <div className="ic-line missing">on {c.machine}: Sleep and Wake run on that Mac</div>}
        {c.local && c.state !== "archived" && c.i.factory_blind && (
          <div className="ic-line missing" title={i.path}>The factory does not see this initiative, so it can't sleep or wake from here.</div>
        )}
        {conf && (
          <div className="ic-confirm" role="group" aria-labelledby={`ic-q-${c.id}`} onKeyDown={escapeCloses(() => cancel(c.id))}>
            <div id={`ic-q-${c.id}`} className="ic-q">{conf.question}</div>
            {conf.lines.map((l) => <div key={l} className="ic-line">{l}</div>)}
            <div className="ic-buttons">
              <button onClick={() => void run(c, "sleep")}>{conf.commit}</button>
              <ConfirmCancel onCancel={() => cancel(c.id)} />
            </div>
          </div>
        )}
        {note && <NoteLine id={noteId} note={note} onAgents={() => openInitiative(c.id, "agents")} />}
        {!conf && action && canAct(c) && (
          <div className="ic-foot">
            {refused ? (
              <button className="ic-act" aria-disabled="true" aria-label={refusedWakeName(c.id, awakeLocal.length)} aria-describedby={note ? noteId : undefined} onClick={() => press(c, "wake")}>Wake</button>
            ) : (
              <button className="ic-act" disabled={isRunning} aria-label={isRunning ? undefined : `${action === "sleep" ? "Sleep" : "Wake"} ${c.id}`} aria-describedby={note ? noteId : undefined} onClick={() => press(c, action)}>
                {isRunning ? (running.action === "sleep" ? "Sleeping…" : "Waking…") : action === "sleep" ? "Sleep" : "Wake"}
              </button>
            )}
          </div>
        )}
      </article>
    );
  };

  const empty = (words: string) => <div className="ic-empty">{words}</div>;

  return (
    <div className="ivw" ref={box}>
      <div className="ivw-head">
        <h1 ref={title} tabIndex={-1}>Initiatives</h1>
        <span className="spacer" />
        <span className={`ivw-count num ${count.over ? "over" : ""}`} title={count.title || undefined}>{count.text}</span>
      </div>
      {noFactory && <div className="ivw-line">{noFactory}</div>}
      <section className="ivw-sec" aria-labelledby="ivw-awake">
        <h2 id="ivw-awake" className="sec-title">Awake · <span className="num">{sections.awake.length}</span></h2>
        {sections.awake.length === 0 ? empty("None awake.") : <div className="ivw-grid">{sections.awake.map(card)}</div>}
      </section>
      <section className="ivw-sec" aria-labelledby="ivw-asleep">
        <h2 id="ivw-asleep" className="sec-title">Asleep · <span className="num">{sections.asleep.length}</span></h2>
        {atLimit && sections.asleep.some(canAct) && (
          <div className="ivw-line">
            {limitParts(awakeLocal.length).lead}
            {/* Only one with a Sleep is a link to it (leftovers-15 FR-8). */}
            {limitNames(awakeLocal, canAct).map((a, k) => (
              <span key={a.id}>{k > 0 && ", "}{a.link
                ? <button className="ivw-link mono" onClick={() => setLand({ id: a.id, to: "action", seq: Date.now() })} aria-label={`${a.id}: go to its Sleep`}>{a.id}</button>
                : <span className="mono">{a.id}</span>}</span>
            ))}
            {limitParts(awakeLocal.length).tail}
          </div>
        )}
        {sections.asleep.length === 0 ? empty("None asleep.") : <div className="ivw-grid">{sections.asleep.map(card)}</div>}
      </section>
      {sections.archived.length > 0 && (
        <section className="ivw-sec" aria-labelledby="ivw-archived">
          <h2 id="ivw-archived" className="sec-title">
            <button className="ivw-fold" onClick={toggleArchived} aria-expanded={archivedOpen}>
              {archivedOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
              Archived · <span className="num">{sections.archived.length}</span>
            </button>
          </h2>
          {archivedOpen && <div className="ivw-grid">{sections.archived.map(card)}</div>}
        </section>
      )}
      <div className="sr-only" role="status" aria-live="polite">{announce}</div>
    </div>
  );
}

/** The confirm's Cancel takes focus when it opens (her §4). */
function ConfirmCancel({ onCancel }: { onCancel: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <button ref={ref} className="ghost" onClick={onCancel}>Cancel</button>;
}

/** What a card says under itself: wait, the limit, the factory's refusal
 *  or a failure with what is true now. Focusable, since a refused Wake moves
 *  focus here. */
function NoteLine({ id, note, onAgents }: { id: string; note: Note; onAgents: () => void }) {
  if (note.kind === "wait" || note.kind === "limit") return <div id={id} className="ic-note" tabIndex={-1}>{note.text}</div>;
  if (note.kind === "refused") {
    return (
      <div id={id} className="ic-note" tabIndex={-1}>
        <pre className="ic-words mono">{note.words}</pre>
        <div>Nothing changed.</div>
      </div>
    );
  }
  return (
    <div id={id} className="ic-note" tabIndex={-1}>
      <div>{note.action === "sleep" ? "Sleep failed." : "Wake failed."}</div>
      {note.words && <pre className="ic-words mono">{note.words}</pre>}
      <div>{note.after}{note.agents && <> <button className="ivw-link" onClick={onAgents}>Agents ›</button></>}</div>
    </div>
  );
}

/** An initiative's open cards, for its next real date (Home's nextDate). */
function cardsOf(view: NonNullable<ReturnType<typeof useBoard.getState>["view"]>, id: string) {
  const cols = view.board.columns ?? {};
  return (["now", "blocked", "next"] as const).flatMap((st) => (cols[st] ?? []).filter((c) => c.initiative_id === id));
}
