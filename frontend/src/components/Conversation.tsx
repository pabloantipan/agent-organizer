import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, AtSign, BookOpen, Archive, Check, ChevronDown, ChevronRight, CornerDownRight, Gavel, GitBranch, Hash, Inbox, Lock, MessagesSquare, Plus, RotateCcw, Search, Send, StickyNote, Unlock, X } from "lucide-react";
import { api, type AgentGroup, type CellMessage, type CellThread, type CellThreadView } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { notesAsContext } from "../lib";
import { askedCards, needsMeThread } from "../lib/queue";

const KINDS = ["msg", "question", "answer", "status", "decision", "done", "claim", "yield"];
const POLL_MS = 5_000; // the open chat only; the list rides the agents feed
const CLAMP = 420;
const BRANCH_PREFIX = "re: ";
const EVENT_KINDS = ["claim", "yield", "status", "done"];
const SEEN_KEY = "slack.seen";

const ago = (s: number) => (s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m` : s < 86400 ? `${Math.floor(s / 3600)}h` : `${Math.floor(s / 86400)}d`);
// The human's queue is what was escalated or asked of them. Stalled and
// undecided threads are the reconciler's backlog: visible, not the human's.
const needsMe = needsMeThread;
const needsReconciler = (t: CellThread) => t.status === "stalled" || t.undecided;
const branchParent = (subject: string) => (subject.startsWith(BRANCH_PREFIX) ? subject.slice(BRANCH_PREFIX.length).trim() : "");
const when = (ms: number) => { const d = new Date(ms); const today = new Date(); const sameDay = d.toDateString() === today.toDateString(); return (sameDay ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " ") + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }); };

/** A thread is a direct chat between the human and one seat when the only
 *  posters are those two, or when the human opened it to that seat and it
 *  has not answered yet. Everything else non-journal is the channel,
 *  including two agents talking to each other. */
function directWith(t: CellThread, human: string): string | null {
  if (t.kind === "journal") return null;
  const posters = new Set(t.participants ?? []);
  const others = [...posters].filter((p) => p !== human);
  if (others.length > 1) return null;
  if (others.length === 1 && posters.has(human)) return others[0];
  if (others.length === 0 && t.opener === human && t.to) return t.to;
  if (others.length === 1 && !posters.has(human) && t.to === human) return others[0];
  return null;
}

function loadSeen(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch { return {}; }
}
function saveSeen(seen: Record<string, number>) {
  try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch { /* per-viewer convenience */ }
}
const lastActivity = (t: CellThread) => Date.now() - (t.quiet_seconds ?? 0) * 1000;

// A chat is what the left list selects: the channel, a person, the journal,
// the archive, or the needs-me queue. A person comes from the store's focus
// so Agents and the card back can land here; the rest is local.
type View = "channel" | "journal" | "archive" | "needs" | "reconciler";

/** The Slack pane as Teams draws a chat: the chats on the left, one chat's
 *  timeline on the right, one message box at the bottom. A chat's timeline
 *  is its threads oldest first, each under a subject divider, messages in
 *  time order. The box posts into the thread last touched, or starts one. */
export function Conversation({ group, focus, onFocus }: { group: AgentGroup; focus: string | null; onFocus: (agent: string | null) => void }) {
  const initiativeId = group.id;
  const [view, setView] = useState<View>("channel");
  const [closed, setClosed] = useState<CellThread[] | null>(null);
  const [details, setDetails] = useState<Record<string, CellThreadView>>({});
  const [err, setErr] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<CellMessage[] | null>(null);
  const [seen, setSeen] = useState<Record<string, number>>(loadSeen);
  const [target, setTarget] = useState<string | null>(null); // thread the box posts into; null = new thread
  const [replyTo, setReplyTo] = useState<CellMessage | null>(null);
  const [branchFrom, setBranchFrom] = useState<CellMessage | null>(null);
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [scrollTo, setScrollTo] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  const { slackDraft, clearSlackDraft, applyAgents, view: boardView, setResolved, select: openCard } = useBoard();
  const resolved = boardView?.order?.resolved ?? {};
  const notes = boardView?.order?.notes ?? {};
  const timelineRef = useRef<HTMLDivElement>(null);

  const human = group.human;
  const seats = (group.cell?.agents ?? []).filter((a) => a !== human);

  // Reading the mailbox is picking up the mail: every message addressed to
  // the human is marked delivered when a chat of this cell is shown, and
  // again as new ones arrive while it stays open. Then the feed is refreshed
  // so the roster and the cards stop calling the human deaf.
  const undelivered = (group.crew ?? []).find((s) => s.name === human)?.undelivered ?? 0;
  useEffect(() => {
    if (!group.can_post) return;
    api.pickUp(initiativeId).then((n) => { if (n > 0) api.getAgents().then(applyAgents, () => undefined); }, () => undefined);
  }, [initiativeId, group.can_post, undelivered, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const all = group.threads ?? [];
  const chatOf = (t: CellThread) => directWith(t, human);
  const isNew = (t: CellThread) => t.kind !== "journal" && lastActivity(t) > (seen[t.id] ?? 0) + 1000;

  // The queue: threads asking the human or escalated, and cards addressed
  // to the human, minus Solved marks. Declared before anything reads it.
  const openThreads = all.filter((t) => needsMe(t) && !resolved[`thread:${t.id}`]);
  const openCards = askedCards(boardView, initiativeId).filter((c) => !resolved[`card:${initiativeId}/${c.slug}`]);

  const chatThreads = (): CellThread[] => {
    if (focus) return all.filter((t) => chatOf(t) === focus);
    switch (view) {
      case "needs": return openThreads;
      case "reconciler": return all.filter(needsReconciler);
      case "journal": return all.filter((t) => t.kind === "journal");
      case "archive": return closed ?? [];
      default: return all.filter((t) => chatOf(t) === null && t.kind !== "journal");
    }
  };
  // Oldest first, so the timeline reads top to bottom like a chat.
  const threads = chatThreads().slice().sort((a, b) => (b.age_seconds ?? 0) - (a.age_seconds ?? 0));
  const reconciler = group.cell?.reconciler || "";
  const chatTitle = focus ? focus : view === "needs" ? "needs me" : view === "reconciler" ? `needs ${reconciler || "the reconciler"}` : view === "journal" ? "journal" : view === "archive" ? "archive" : "channel";

  // The archive is the one list the feed does not carry.
  useEffect(() => {
    if (view !== "archive" || focus) return;
    api.getCell(initiativeId).then((v) => { setClosed(v.closed ?? []); setErr(v.discuss || null); }, (e) => setErr(String(e)));
  }, [view, focus, initiativeId, tick]);

  // Messages of every thread in the chat, polled while it is the chat shown.
  const ids = threads.map((t) => t.id).join(",");
  useEffect(() => {
    if (!ids) return;
    let live = true;
    const load = () => Promise.all(ids.split(",").map((id) => api.getCellThread(initiativeId, id).then((d) => [id, d] as const, () => null))).then((rs) => {
      if (!live) return;
      setDetails((m) => { const n = { ...m }; for (const r of rs) if (r) n[r[0]] = r[1]; return n; });
    });
    load();
    const i = window.setInterval(load, POLL_MS);
    return () => { live = false; window.clearInterval(i); };
  }, [ids, initiativeId, tick]);

  useEffect(() => {
    if (!query.trim()) { setHits(null); return; }
    const t = window.setTimeout(() => api.searchCell(initiativeId, query.trim()).then(setHits, () => setHits([])), 200);
    return () => window.clearTimeout(t);
  }, [query, initiativeId]);

  // Switching chats: the box targets the newest thread there, and everything
  // in it counts as seen.
  useEffect(() => {
    setReplyTo(null); setBranchFrom(null);
    const last = threads[threads.length - 1];
    setTarget(last?.id ?? null);
    if (threads.length) setSeen((prev) => { const next = { ...prev }; for (const t of threads) next[t.id] = Date.now(); saveSeen(next); return next; });
  }, [focus, view, ids.length === 0]); // eslint-disable-line react-hooks/exhaustive-deps

  // A draft from elsewhere: open that thread's chat and target it, or start
  // a new thread with that subject.
  useEffect(() => {
    if (!slackDraft) return;
    if (slackDraft.threadId) {
      const t = all.find((x) => x.id === slackDraft.threadId);
      const chat = t ? chatOf(t) : null;
      if (chat !== focus) onFocus(chat);
      if (!chat) setView(t ? (t.kind === "journal" ? "journal" : "channel") : "archive");
      setTimeout(() => { setTarget(slackDraft.threadId!); setScrollTo(slackDraft.threadId!); }, 0);
    }
    if (slackDraft.subject !== undefined) { setDraftSubject(slackDraft.subject); setDraftBody(slackDraft.body ?? ""); setTarget(null); }
    clearSlackDraft();
  }, [slackDraft]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!scrollTo) return;
    const el = document.getElementById(`thread-${scrollTo}`);
    if (el) { el.scrollIntoView({ block: "start", behavior: "smooth" }); setScrollTo(null); }
  }, [scrollTo, ids]);

  // New messages at the bottom: keep the view pinned there unless the reader
  // scrolled up to read.
  const msgCount = threads.reduce((n, t) => n + (details[t.id]?.messages?.length ?? 0), 0);
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 240;
    if (nearBottom) el.scrollTop = el.scrollHeight;
  }, [msgCount, ids]);

  // Cards whose next action is addressed to the human ("Pablo: …",
  // "decide: …") are the other half of the queue.
  const counts = {
    needs: openThreads.length + openCards.length,
    reconciler: all.filter((t) => t.kind !== "journal" && needsReconciler(t)).length,
    channel: all.filter((t) => chatOf(t) === null && t.kind !== "journal").length,
    channelFresh: all.filter((t) => chatOf(t) === null && isNew(t)).length,
    journal: all.filter((t) => t.kind === "journal").length,
  };
  const pick = (v: View) => { onFocus(null); setView(v); setQuery(""); };
  const pickPerson = (a: string) => { setView("channel"); onFocus(a); setQuery(""); };
  const targetThread = target ? threads.find((t) => t.id === target) : undefined;
  const targetDetail = target ? details[target] : undefined;
  const waitingByThread = new Map<string, string[]>();
  for (const w of group.waiting ?? []) waitingByThread.set(w.thread.id, [...(waitingByThread.get(w.thread.id) ?? []), w.slug]);
  const bySubject = new Map(all.map((t) => [t.subject, t]));
  const branchesOf = new Map<string, CellThread[]>();
  for (const t of all) { const p = branchParent(t.subject); const parent = p ? bySubject.get(p) : undefined; if (parent) branchesOf.set(parent.id, [...(branchesOf.get(parent.id) ?? []), t]); }
  const goTo = (id: string) => {
    const t = all.find((x) => x.id === id);
    const chat = t ? chatOf(t) : null;
    if (chat) pickPerson(chat); else pick(t ? (t.kind === "journal" ? "journal" : "channel") : "archive");
    setTimeout(() => { setTarget(id); setScrollTo(id); }, 0);
  };
  const setStatus = (id: string, s: string) => api.setCellThreadStatus(initiativeId, id, s).then(() => reload(), (e) => setErr(String(e)));

  return (
    <div className="cell with-chats">
      <nav className="chats">
        <div className="chats-label">
          <span>Chats</span>
          <span className="spacer" />
          <button className="rail-icon" onClick={() => { setTarget(null); setDraftSubject(""); }} disabled={!group.can_post} title={group.can_post ? (focus ? `new thread with ${focus}` : "new thread") : "no token to post with"}><Plus size={13} /></button>
        </div>
        <div className="cell-search">
          <Search size={12} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="search" />
          {query && <button className="rail-icon" onClick={() => setQuery("")}><X size={12} /></button>}
        </div>
        <button className={`chat ${!focus && view === "needs" ? "active" : ""} ${counts.needs > 0 ? "fresh hot" : ""}`} onClick={() => pick("needs")} title="escalated to you, or a message addressed to you with no reply from you after it"><Inbox size={12} /><span className="chat-name">needs me</span>{counts.needs > 0 && <span className="chat-fresh hot">{counts.needs}</span>}</button>
        {reconciler && reconciler !== human && <button className={`chat ${!focus && view === "reconciler" ? "active" : ""}`} onClick={() => pick("reconciler")} title={`the reconciler's backlog: stalled, or answered and left without a decision. ${reconciler}'s work, not yours`}><Gavel size={12} /><span className="chat-name">needs {reconciler}</span>{counts.reconciler > 0 && <span className="chat-n">{counts.reconciler}</span>}</button>}
        <button className={`chat ${!focus && view === "channel" ? "active" : ""} ${counts.channelFresh > 0 ? "fresh" : ""}`} onClick={() => pick("channel")} title="every conversation not between you and one seat"><Hash size={12} /><span className="chat-name">channel</span>{counts.channelFresh > 0 ? <span className="chat-fresh">{counts.channelFresh}</span> : counts.channel > 0 ? <span className="chat-n">{counts.channel}</span> : null}</button>
        <div className="chats-label sub"><span>People</span></div>
        {seats.map((a) => {
          const n = all.filter((t) => chatOf(t) === a).length;
          const fresh = all.filter((t) => chatOf(t) === a && isNew(t)).length;
          return (
            <button key={a} className={`chat ${focus === a ? "active" : ""} ${fresh > 0 ? "fresh" : ""}`} onClick={() => pickPerson(a)} title={`direct with ${a}`}>
              <AtSign size={12} /><span className="chat-name">{a}</span>{fresh > 0 ? <span className="chat-fresh">{fresh}</span> : n > 0 ? <span className="chat-n">{n}</span> : null}
            </button>
          );
        })}
        <div className="chats-label sub"><span>More</span></div>
        <button className={`chat ${!focus && view === "journal" ? "active" : ""}`} onClick={() => pick("journal")} title="self-addressed notes: each seat's open questions"><BookOpen size={12} /><span className="chat-name">journal</span>{counts.journal > 0 && <span className="chat-n">{counts.journal}</span>}</button>
        <button className={`chat ${!focus && view === "archive" ? "active" : ""}`} onClick={() => pick("archive")} title="closed threads"><Archive size={12} /><span className="chat-name">archive</span>{closed && closed.length > 0 && <span className="chat-n">{closed.length}</span>}</button>
      </nav>

      <div className="cell-main">
        <div className="chat-head">
          {focus ? <AtSign size={14} /> : <Hash size={14} />}
          <span className="chat-title">{chatTitle}</span>
          <span className="meta">{threads.length} thread{threads.length === 1 ? "" : "s"}{group.project ? ` · as ${human}${group.can_post ? "" : " · no token, read only"}` : ""}{group.discuss ? ` · ${group.discuss}` : ""}</span>
          <span className="spacer" />
          {(group.waiting?.length ?? 0) > 0 && <span className="badge thread blocked" title={group.waiting.map((w) => `${w.slug} waits on ${w.thread.subject || w.thread.id}`).join("\n")}>{group.waiting.length} card{group.waiting.length === 1 ? "" : "s"} waiting</span>}
        </div>
        {err && <div className="meta err">{err}</div>}

        <div className="timeline" ref={timelineRef}>
          {hits === null && view === "needs" && !focus ? (
            <NeedsMe
              threads={openThreads}
              cards={openCards}
              human={human}
              seats={seats}
              notes={notes}
              resolved={resolved}
              initiativeId={initiativeId}
              allThreads={[...all, ...(closed ?? [])]}
              canPost={group.can_post}
              onRuled={reload}
              onDiscussThread={(id) => goTo(id)}
              onDiscussCard={(c) => {
                const guess = seats.find((a) => (c.next || "").toLowerCase().includes(a.split("_").pop() ?? "\u0000"));
                if (guess) pickPerson(guess);
                setDraftSubject(`${c.slug}: `);
                setDraftBody(notesAsContext(notes[`${initiativeId}/${c.slug}`], human));
                setTarget(null);
              }}
              onOpenCard={openCard}
              onResolve={(key, v) => setResolved(key, v)}
            />
          ) : hits !== null ? (
            <>
              {hits.length === 0 && <div className="empty">nothing matches</div>}
              {hits.map((m) => (
                <div key={m.id} className="hit" onClick={() => { setQuery(""); goTo(m.thread_id); }}>
                  <div className="convo-subj">{m.subject || "(no subject)"}</div>
                  <div className="meta"><Kind k={m.kind} /> {m.from} → {m.to || "everyone"}</div>
                  <div className="snip">{m.body.slice(0, 160)}</div>
                </div>
              ))}
            </>
          ) : threads.length === 0 ? (
            <div className="empty">{focus ? `Nothing between you and ${focus} yet. Write below.` : view === "needs" ? "Nothing is asked of you." : view === "reconciler" ? `Nothing waits on ${reconciler}.` : "Nothing here."}</div>
          ) : threads.map((t) => {
            const d = details[t.id];
            const msgs = d?.messages ?? [];
            const status = d?.status ?? t.status;
            const decision = [...msgs].reverse().find((m) => m.kind === "decision");
            const byId = new Map(msgs.map((m) => [m.id, m]));
            const parent = branchParent(t.subject) ? bySubject.get(branchParent(t.subject)) : undefined;
            const branches = branchesOf.get(t.id) ?? [];
            const writable = status === "open" || status === "stalled";
            return (
              <section key={t.id} id={`thread-${t.id}`} className={`tl-thread ${target === t.id ? "target" : ""} ${needsMe(t) ? "hot" : ""}`}>
                <div className="tl-divider" onClick={() => { setTarget(t.id); setReplyTo(null); setBranchFrom(null); }} title="reply into this thread">
                  <span className="tl-subj">{t.subject || "(no subject)"}</span>
                  <span className="tl-meta">
                    {status !== "open" && <span className={`badge thread ${status}`}>{status}</span>}
                    {status === "open" && t.since_decision > 0 && <span className={`counter ${t.since_decision >= 9 ? "hot" : ""}`} title="messages since the last decision; the server freezes the thread at 12">{t.since_decision}/12</span>}
                    {(t.asked_of_me ?? 0) > 0 && <span className="badge thread asks" title={`${t.asked_of_me} message${t.asked_of_me === 1 ? "" : "s"} addressed to you, latest from ${t.asked_by}, with no reply from you after`}>asks you · {t.asked_by}</span>}
                    {t.undecided && <span className="badge thread undecided" title={`answered, and nobody has recorded what it means: ${reconciler || "the reconciler"}'s to decide`}>undecided{reconciler ? ` · ${reconciler}` : ""}</span>}
                    {(t.cards ?? []).map((slug) => <span key={slug} className="badge card-ref" title={waitingByThread.has(t.id) ? "this card waits on the thread" : "card named by the subject"}>{slug}</span>)}
                    {parent && <button className="badge branch" onClick={(e) => { e.stopPropagation(); goTo(parent.id); }}><GitBranch size={10} /> from {parent.subject.slice(0, 32)}</button>}
                    {branches.map((b) => <button key={b.id} className="badge branch" onClick={(e) => { e.stopPropagation(); goTo(b.id); }} title={b.subject}><GitBranch size={10} /> {chatOf(b) ?? "side"}</button>)}
                  </span>
                  <span className="spacer" />
                  <span className="a-actions" onClick={(e) => e.stopPropagation()}>
                    {status !== "open" && <button className="rail-icon" onClick={() => setStatus(t.id, "open")} title="reopen: the thread accepts posts again"><Unlock size={12} /></button>}
                    {status === "open" && <button className="rail-icon" onClick={() => setStatus(t.id, "escalated")} title="escalate: on your queue, no agent can post"><ArrowUpRight size={12} /></button>}
                    {status !== "closed" && <button className="rail-icon" onClick={() => setStatus(t.id, "closed")} title="close"><Lock size={12} /></button>}
                  </span>
                </div>
                {decision && <div className="decision-banner"><Gavel size={13} /><span><b>{decision.from}</b> decided: {decision.body}</span></div>}
                {!d && <div className="meta">opening…</div>}
                {msgs.map((m) => (
                  <Msg
                    key={m.id}
                    m={m}
                    parent={m.parent_id ? byId.get(m.parent_id) : undefined}
                    human={human}
                    onReply={writable && group.can_post ? () => { setTarget(t.id); setBranchFrom(null); setReplyTo(m); } : undefined}
                    onBranch={group.can_post && m.from !== human ? () => { setTarget(t.id); setReplyTo(null); setBranchFrom(m); } : undefined}
                  />
                ))}
              </section>
            );
          })}
        </div>

        <div className="dock">
          {branchFrom && targetThread ? (
            <NewThread
              initiativeId={initiativeId}
              seats={seats}
              to={branchFrom.from}
              subject={`${BRANCH_PREFIX}${targetThread.subject}`}
              quote={branchFrom}
              onDone={(tid) => { setBranchFrom(null); reload(); if (tid) goTo(tid); }}
            />
          ) : target && targetThread ? (
            <ReplyBox
              key={target}
              initiativeId={initiativeId}
              threadId={target}
              subject={targetThread.subject}
              status={targetDetail?.status ?? targetThread.status}
              human={human}
              seats={group.cell?.agents ?? []}
              canPost={group.can_post}
              wakesAll={targetDetail?.wakes_on_broadcast ?? seats.length}
              defaultTo={focus ?? lastAsker(targetDetail?.messages ?? [], human) ?? lastOther(targetDetail?.messages ?? [], human)}
              replyTo={replyTo}
              onClearReply={() => setReplyTo(null)}
              onNewThread={group.can_post ? () => { setTarget(null); setDraftSubject(""); } : undefined}
              onSent={() => { setReplyTo(null); reload(); }}
            />
          ) : (
            <NewThread
              key={`${focus ?? ""}|${draftSubject}|${draftBody.length}`}
              initiativeId={initiativeId}
              seats={seats}
              to={focus ?? seats[0] ?? ""}
              subject={draftSubject || undefined}
              body={draftBody || undefined}
              canPost={group.can_post}
              onDone={(tid) => { setDraftSubject(""); setDraftBody(""); reload(); if (tid) goTo(tid); else if (threads.length) setTarget(threads[threads.length - 1].id); }}
              cancellable={threads.length > 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Kind({ k }: { k: string }) {
  return <span className={`kind k-${k}`}>{k}</span>;
}

function lastAsker(msgs: CellMessage[], human: string): string | null {
  const m = [...msgs].reverse().find((x) => x.to === human && human);
  return m ? m.from : null;
}

function lastOther(msgs: CellMessage[], human: string): string {
  const others = [...new Set(msgs.map((m) => m.from).filter((f) => f !== human))];
  return others.length ? others[others.length - 1] : "";
}

/** One message, by kind. Events are one line; the rest are bubbles with the
 *  sender band as their header. Long bodies clamp with "show all". */
function Msg({ m, parent, human, onReply, onBranch }: { m: CellMessage; parent?: CellMessage; human: string; onReply?: () => void; onBranch?: () => void }) {
  const [full, setFull] = useState(false);
  const self = !!m.to && m.to === m.from;
  const event = EVENT_KINDS.includes(m.kind);
  const long = m.body.length > CLAMP;
  const body = full || !long ? m.body : m.body.slice(0, CLAMP).replace(/\s+\S*$/, "") + "…";
  return (
    <div className={`msg k-${m.kind} ${self ? "journal" : ""} ${m.from === human ? "mine" : ""} ${m.to === human && human ? "for-me" : ""} ${parent ? "reply" : ""}`}>
      {parent && <div className="reply-to"><CornerDownRight size={11} /> to {parent.from}'s {parent.kind}: {parent.body.slice(0, 80)}</div>}
      {event ? (
        <div className="event"><Kind k={m.kind} /> <b>{m.from}</b>{m.to && !self ? <span className="meta"> → {m.to}</span> : ""} <span className="event-body">{m.body}</span> <span className="meta time">{when(m.created_at)}</span></div>
      ) : (
        <div className="bubble">
          <div className="bubble-head">
            <Kind k={m.kind} /> <b>{m.from}</b> <span className="meta">{self ? "note to self" : m.to === human && human ? "→ you" : m.to ? `→ ${m.to}` : "→ everyone"}</span>
            <span className="meta time">{when(m.created_at)}</span>
            <span className="msg-tools">
              {onReply && <button className="rail-icon" title="reply in this thread" onClick={onReply}>↩</button>}
              {onBranch && <button className="rail-icon" title={`branch a side thread with ${m.from}`} onClick={onBranch}><GitBranch size={11} /></button>}
            </span>
          </div>
          <div className="bubble-body">{body}{long && <button className="linkish show-all" onClick={() => setFull((f) => !f)}>{full ? "show less" : "show all"}</button>}</div>
        </div>
      )}
    </div>
  );
}

/** The message box: posts into one thread. Kind first, then the recipient,
 *  then the cost. Stalled threads accept only a decision. */
function ReplyBox(p: {
  initiativeId: string; threadId: string; subject: string; status: string; human: string; seats: string[]; canPost: boolean; wakesAll: number;
  defaultTo: string; replyTo: CellMessage | null; onClearReply: () => void; onNewThread?: () => void; onSent: () => void;
}) {
  const [body, setBody] = useState("");
  const [kind, setKind] = useState(p.status === "stalled" ? "decision" : "msg");
  const [to, setTo] = useState(p.defaultTo);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setTo(p.defaultTo); }, [p.defaultTo]);
  useEffect(() => { if (p.status === "stalled") setKind("decision"); }, [p.status]);
  useEffect(() => {
    if (!p.replyTo) return;
    setKind(p.replyTo.kind === "question" ? "answer" : "msg");
    if (p.replyTo.from !== p.human) setTo(p.replyTo.from);
    ref.current?.focus();
  }, [p.replyTo, p.human]);

  const writable = (p.status === "open" || p.status === "stalled") && p.canPost;
  const wakes = to ? 1 : p.wakesAll;
  const send = () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    api.postToCell(p.initiativeId, { thread_id: p.threadId, parent_id: p.replyTo?.id ?? "", to, kind, body } as never).then(
      () => { setBody(""); setErr(null); p.onSent(); },
      (e) => setErr(String(e)),
    ).finally(() => setBusy(false));
  };
  return (
    <div className="composer">
      <div className="composer-row">
        <span className="meta composer-target" title={p.subject}><CornerDownRight size={11} /> in <b>{p.subject || "(no subject)"}</b></span>
        {p.replyTo && <span className="meta reply-to">· replying to {p.replyTo.from}'s {p.replyTo.kind} <button className="rail-icon" onClick={p.onClearReply}><X size={11} /></button></span>}
        <span className="spacer" />
        {p.onNewThread && <button className="linkish meta" onClick={p.onNewThread}>new thread instead</button>}
      </div>
      {p.status === "stalled" && <div className="frozen">Stalled: only a decision is accepted until one is recorded or the thread is escalated.</div>}
      {p.status === "escalated" && <div className="frozen">Escalated to you. It accepts nothing; reopen it to reply.</div>}
      {p.status === "closed" && <div className="frozen">Closed. Reopen it to add anything.</div>}
      {!p.canPost && <div className="frozen">No token for {p.human || "the human seat"}: run the cell bootstrap to issue one.</div>}
      <div className="composer-line">
        <textarea ref={ref} rows={2} value={body} onChange={(e) => setBody(e.target.value)} disabled={!writable} placeholder={writable ? "Type a message  (Enter to send, Shift+Enter for a new line)" : ""} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} />
      </div>
      <div className="composer-row">
        <select value={kind} onChange={(e) => setKind(e.target.value)} disabled={!writable}>
          {(p.status === "stalled" ? ["decision"] : KINDS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <select value={to} onChange={(e) => setTo(e.target.value)} disabled={!writable} title="direct wakes one seat; everyone wakes them all">
          <option value="">everyone (wakes {p.wakesAll})</option>
          {p.seats.filter((s) => s !== p.human).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`meta wakes ${!to && wakes > 1 ? "hot" : ""}`}>wakes {wakes} seat{wakes === 1 ? "" : "s"}</span>
        <span className="spacer" />
        {err && <span className="meta err">{err}</span>}
        <button className="tiny-btn primary" onClick={send} disabled={!writable || !body.trim() || busy} title="send"><Send size={12} /> Send</button>
      </div>
    </div>
  );
}

/** Starting a thread, or branching one: subject, recipient, kind, body. A
 *  branch arrives with its subject set and the quoted message as the first
 *  lines, so the link back survives in the record itself. */
function NewThread({ initiativeId, seats, to: initialTo, subject: initialSubject, body: initialBody, quote, canPost = true, cancellable = true, onDone }: { initiativeId: string; seats: string[]; to: string; subject?: string; body?: string; quote?: CellMessage; canPost?: boolean; cancellable?: boolean; onDone: (threadId: string | null) => void }) {
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [to, setTo] = useState(initialTo);
  const [kind, setKind] = useState("question");
  const [body, setBody] = useState(quote ? `↳ from thread ${quote.thread_id}, ${quote.from}'s ${quote.kind}:\n> ${quote.body.slice(0, 300).replace(/\n/g, "\n> ")}\n\n` : (initialBody ?? ""));
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const wakes = to ? 1 : seats.length;
  const send = () => {
    if (!subject.trim() || !body.trim() || busy) return;
    setBusy(true);
    api.postToCell(initiativeId, { thread_id: "", parent_id: "", to, kind, subject, body } as never).then(
      (r) => onDone(r.thread_id),
      (e) => { setErr(String(e)); setBusy(false); },
    );
  };
  return (
    <div className={`composer new-thread ${quote ? "branch" : ""}`}>
      <div className="composer-row">
        <span className="meta composer-target">{quote ? <><GitBranch size={11} /> side thread with <b>{to || "everyone"}</b></> : <><Plus size={11} /> new thread</>}</span>
        <span className="spacer" />
        {cancellable && <button className="linkish meta" onClick={() => onDone(null)}>cancel</button>}
      </div>
      {!canPost && <div className="frozen">No token for the human seat: run the cell bootstrap to issue one.</div>}
      <input autoFocus={!quote && !initialSubject} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="subject  (start with a card slug to link it: readiness-endpoint: …)" disabled={!canPost} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); (e.currentTarget.closest(".composer")?.querySelector("textarea") as HTMLTextAreaElement | null)?.focus(); } }} />
      <div className="composer-line">
        <textarea autoFocus={!!quote || !!initialSubject} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message  (Enter to send, Shift+Enter for a new line)" disabled={!canPost} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } if (e.key === "Escape" && cancellable) onDone(null); }} />
      </div>
      <div className="composer-row">
        <select value={kind} onChange={(e) => setKind(e.target.value)} disabled={!canPost}>{KINDS.map((k) => <option key={k} value={k}>{k}</option>)}</select>
        <select value={to} onChange={(e) => setTo(e.target.value)} disabled={!canPost}>
          <option value="">everyone (wakes {seats.length})</option>
          {seats.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`meta wakes ${wakes > 1 ? "hot" : ""}`}>wakes {wakes} seat{wakes === 1 ? "" : "s"}</span>
        <span className="spacer" />
        {err && <span className="meta err">{err}</span>}
        <button className="tiny-btn primary" onClick={send} disabled={busy || !canPost || !subject.trim() || !body.trim()}><Send size={12} /> {quote ? "Branch" : "Start"}</button>
      </div>
    </div>
  );
}


type QueueCard = { slug: string; title: string; next: string; status: string; initiative_id: string };

const NEXT_LABEL = "Next action:";
// A ruling's body is the decision, then one last line "Next action: …" when
// the human named one. Splitting it back out is how the queue shows the two
// apart; the seat reads the whole body either way.
function splitRuling(body: string): { text: string; next: string } {
  const i = body.lastIndexOf(`\n${NEXT_LABEL}`);
  if (i < 0) return { text: body, next: "" };
  return { text: body.slice(0, i).trim(), next: body.slice(i + NEXT_LABEL.length + 1).trim() };
}
const seatGuess = (seats: string[], text: string) => seats.find((a) => text.toLowerCase().includes(a.split("_").pop() ?? "\u0000"));

/** The human's queue as a worklist: one row per thing asked of the human,
 *  from a thread or from a card, each solved on its own. Discuss opens the
 *  conversation (the thread, or a new one about the card with the human's
 *  notes as context); Rule settles it here, without leaving: one `decision`
 *  into the thread (or a new thread named after the card), with the next
 *  action as its last line, addressed to the seat that has to act — and the
 *  row moves to Solved, where the ruling stays readable. Solved marks it
 *  without posting. A thread the human has answered leaves the list by
 *  itself. The card file is the agents' to update: the next action reaches
 *  them as the decision, and they write it into the card. */
function NeedsMe(p: {
  threads: CellThread[]; cards: QueueCard[]; human: string; seats: string[]; notes: Record<string, { by: string; at: unknown; text: string }[]>; resolved: Record<string, string>;
  initiativeId: string; allThreads: CellThread[]; canPost: boolean; onRuled: () => void; onDiscussThread: (id: string) => void; onDiscussCard: (c: QueueCard) => void; onOpenCard: (c: never) => void; onResolve: (key: string, v: boolean) => void;
}) {
  const [showSolved, setShowSolved] = useState(false);
  const [ruling, setRuling] = useState<string | null>(null); // the row whose Rule box is open: thread:<id> or card:<slug>
  const [busy, setBusy] = useState(false);
  const [ruleErr, setRuleErr] = useState<string | null>(null);
  const { view } = useBoard();

  // One decision, in the right place, then the row is solved. An escalated
  // thread accepts nothing until it is reopened, so the reopen comes first;
  // the decision resets its stall counter and the thread goes on from there.
  const rule = async (key: string, to: string, text: string, next: string, t?: CellThread, c?: QueueCard) => {
    if (busy) return;
    setBusy(true); setRuleErr(null);
    const body = next.trim() ? `${text.trim()}\n\n${NEXT_LABEL} ${next.trim()}` : text.trim();
    try {
      if (t) {
        if (t.status === "escalated") await api.setCellThreadStatus(p.initiativeId, t.id, "open");
        await api.postToCell(p.initiativeId, { thread_id: t.id, parent_id: "", to, kind: "decision", body } as never);
      } else if (c) {
        const ctx = notesAsContext(p.notes[`${p.initiativeId}/${c.slug}`], p.human);
        const subject = `${c.slug}: ${text.trim().split("\n")[0].slice(0, 72)}`;
        await api.postToCell(p.initiativeId, { thread_id: "", parent_id: "", to, kind: "decision", subject, body: ctx + body } as never);
      }
      p.onResolve(key, true);
      setRuling(null);
      setShowSolved(true);
      p.onRuled();
    } catch (e) {
      setRuleErr(String(e));
    } finally {
      setBusy(false);
    }
  };
  const solved = Object.entries(p.resolved)
    .filter(([k]) => k.startsWith("thread:") ? p.allThreads.some((t) => `thread:${t.id}` === k) || true : k.startsWith(`card:${p.initiativeId}/`))
    .filter(([k]) => !k.startsWith("thread:") || p.allThreads.some((t) => `thread:${t.id}` === k))
    .sort((a, b) => (b[1] > a[1] ? 1 : -1));
  const cardBySlug = new Map<string, QueueCard>();
  for (const st of ["now", "blocked", "next", "done"] as const) for (const c of view?.board.columns?.[st] ?? []) if (c.initiative_id === p.initiativeId) cardBySlug.set(c.slug, c as unknown as QueueCard);
  const label = (key: string) => {
    if (key.startsWith("thread:")) { const t = p.allThreads.find((x) => `thread:${x.id}` === key); return t?.subject || key.slice(7, 15); }
    const slug = key.slice(`card:${p.initiativeId}/`.length);
    return cardBySlug.get(slug)?.title || slug;
  };
  const openCard = (slug: string) => { const c = cardBySlug.get(slug); if (c) p.onOpenCard(c as never); };
  return (
    <div className="queue">
      {p.threads.length + p.cards.length === 0 && <div className="empty">Nothing is asked of you.</div>}
      {p.cards.map((c) => {
        const list = p.notes[`${p.initiativeId}/${c.slug}`] ?? [];
        const note = list.length ? `${list[list.length - 1].text}${list.length > 1 ? `  (+${list.length - 1} more)` : ""}` : "";
        return (
          <div key={c.slug} className="q-item">
            <div className="q-head">
              <span className="badge thread asks">open · asks you</span>
              <span className={`badge ${c.status}`}>{c.status}</span>
              <button className="linkish q-title" onClick={() => openCard(c.slug)} title="open the card">{c.title}</button>
              <span className="badge card-ref">{c.slug}</span>
            </div>
            <div className="q-ask">{c.next}</div>
            {note && <div className="q-note"><StickyNote size={11} /> {note}</div>}
            <div className="q-actions">
              <button className="tiny-btn primary" onClick={() => p.onDiscussCard(c)}><MessagesSquare size={12} /> Discuss</button>
              <button className={`tiny-btn ${ruling === `card:${c.slug}` ? "primary" : "ghost"}`} onClick={() => { setRuleErr(null); setRuling(ruling === `card:${c.slug}` ? null : `card:${c.slug}`); }} disabled={!p.canPost} title={p.canPost ? "settle it here: a decision to the seat, with the next action, in a new thread named after the card" : "no token to post with"}><Gavel size={12} /> Rule</button>
              <button className="tiny-btn ghost" onClick={() => openCard(c.slug)}>Open card</button>
              <span className="spacer" />
              <button className="tiny-btn ghost" onClick={() => p.onResolve(`card:${p.initiativeId}/${c.slug}`, true)} title="take it off your queue; the card itself is the agents' to update"><Check size={12} /> Mark solved</button>
            </div>
            {ruling === `card:${c.slug}` && (
              <RuleBox
                seats={p.seats}
                defaultTo={seatGuess(p.seats, c.next || "") ?? p.seats[0] ?? ""}
                where={`new thread "${c.slug}: …"`}
                busy={busy}
                err={ruleErr}
                onRule={(to, text, next) => rule(`card:${p.initiativeId}/${c.slug}`, to, text, next, undefined, c)}
                onCancel={() => setRuling(null)}
              />
            )}
          </div>
        );
      })}
      {p.threads.map((t) => (
        <div key={t.id} className="q-item">
          <div className="q-head">
            <span className={`badge thread ${t.status === "escalated" ? "escalated" : "asks"}`}>{t.status === "escalated" ? "escalated" : `asks you · ${t.asked_by}`}</span>
            <span className="q-title">{t.subject || "(no subject)"}</span>
            {(t.cards ?? []).map((slug) => <button key={slug} className="badge card-ref linkish" onClick={() => openCard(slug)}>{slug}</button>)}
          </div>
          <div className="q-ask meta">{(t.participants ?? []).join(", ")} · {t.messages} msg · quiet {ago(t.quiet_seconds)}{t.since_decision > 0 ? ` · ${t.since_decision}/12` : ""}</div>
          {(t.cards ?? []).map((slug) => { const l = p.notes[`${p.initiativeId}/${slug}`] ?? []; return l.length ? <div key={slug} className="q-note"><StickyNote size={11} /> {l[l.length - 1].text}{l.length > 1 ? `  (+${l.length - 1} more)` : ""}</div> : null; })}
          <div className="q-actions">
            <button className="tiny-btn primary" onClick={() => p.onDiscussThread(t.id)}><MessagesSquare size={12} /> {t.status === "escalated" ? "Open" : "Answer"}</button>
            <button className={`tiny-btn ${ruling === `thread:${t.id}` ? "primary" : "ghost"}`} onClick={() => { setRuleErr(null); setRuling(ruling === `thread:${t.id}` ? null : `thread:${t.id}`); }} disabled={!p.canPost} title={p.canPost ? (t.status === "escalated" ? "settle it here: reopen, then a decision with the next action" : "settle it here: a decision into the thread, with the next action") : "no token to post with"}><Gavel size={12} /> Rule</button>
            <span className="spacer" />
            <button className="tiny-btn ghost" onClick={() => p.onResolve(`thread:${t.id}`, true)} title="take it off your queue without posting"><Check size={12} /> Mark solved</button>
          </div>
          {ruling === `thread:${t.id}` && (
            <RuleBox
              seats={p.seats}
              defaultTo={t.asked_by || (t.participants ?? []).find((a) => a !== p.human) || ""}
              where={t.subject || t.id.slice(0, 8)}
              escalated={t.status === "escalated"}
              busy={busy}
              err={ruleErr}
              onRule={(to, text, next) => rule(`thread:${t.id}`, to, text, next, t)}
              onCancel={() => setRuling(null)}
            />
          )}
        </div>
      ))}
      <div className="q-solved">
        <button className="linkish q-solved-toggle" onClick={() => setShowSolved((v) => !v)}>
          {showSolved ? <ChevronDown size={12} /> : <ChevronRight size={12} />} Solved <span className="meta">{solved.length} · marked done, kept here</span>
        </button>
        {showSolved && solved.map(([key, date]) => {
          // The ruling is read from the mailbox, not kept here: for a thread,
          // its latest decision; for a card, the newest thread named after it.
          const threadId = key.startsWith("thread:") ? key.slice(7)
            : p.allThreads.filter((t) => (t.cards ?? []).includes(key.slice(`card:${p.initiativeId}/`.length))).sort((a, b) => (a.age_seconds ?? 0) - (b.age_seconds ?? 0))[0]?.id;
          return (
            <div key={key} className="q-done">
              <div className="q-done-line">
                <Check size={11} />
                <span className="q-done-title">{label(key)}</span>
                <span className="meta">{date}</span>
                <button className="rail-icon" onClick={() => p.onResolve(key, false)} title="reopen: back to the queue"><RotateCcw size={11} /></button>
              </div>
              {threadId && <Ruling initiativeId={p.initiativeId} threadId={threadId} onOpen={() => p.onDiscussThread(threadId)} />}
            </div>
          );
        })}
        {showSolved && solved.length === 0 && <div className="meta">nothing solved yet</div>}
      </div>
    </div>
  );
}

/** The inline ruling: who has to act, what was decided, what happens next.
 *  Enter sends from the decision box; the next action is one line on
 *  purpose, the way a card's `next` is one line. */
function RuleBox(p: { seats: string[]; defaultTo: string; where: string; escalated?: boolean; busy: boolean; err: string | null; onRule: (to: string, text: string, next: string) => void; onCancel: () => void }) {
  const [to, setTo] = useState(p.defaultTo);
  const [text, setText] = useState("");
  const [next, setNext] = useState("");
  const ready = text.trim().length > 0 && !p.busy;
  const send = () => { if (ready) p.onRule(to, text, next); };
  return (
    <div className="rule-box">
      <div className="composer-row">
        <span className="meta composer-target"><Gavel size={11} /> decision in <b>{p.where}</b>{p.escalated ? " · reopens it first" : ""}</span>
        <span className="spacer" />
        <button className="linkish meta" onClick={p.onCancel}>cancel</button>
      </div>
      <textarea autoFocus rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What you decided  (Enter to rule, Shift+Enter for a new line)" onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } if (e.key === "Escape") p.onCancel(); }} />
      <input value={next} onChange={(e) => setNext(e.target.value)} placeholder="Next action  (one line: who does what; the seat writes it into the card)" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } if (e.key === "Escape") p.onCancel(); }} />
      <div className="composer-row">
        <select value={to} onChange={(e) => setTo(e.target.value)} title="direct wakes one seat; everyone wakes them all">
          <option value="">everyone (wakes {p.seats.length})</option>
          {p.seats.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`meta wakes ${!to && p.seats.length > 1 ? "hot" : ""}`}>wakes {to ? 1 : p.seats.length} seat{to || p.seats.length === 1 ? "" : "s"}</span>
        <span className="spacer" />
        {p.err && <span className="meta err">{p.err}</span>}
        <button className="tiny-btn primary" onClick={send} disabled={!ready}><Gavel size={12} /> Rule</button>
      </div>
    </div>
  );
}

/** What was ruled, read back from the thread so the queue and the timeline
 *  never disagree: the latest decision, split into its text and its next
 *  action. Nothing when the thread has no decision. */
function Ruling({ initiativeId, threadId, onOpen }: { initiativeId: string; threadId: string; onOpen: () => void }) {
  const [d, setD] = useState<CellThreadView | null>(null);
  useEffect(() => {
    let live = true;
    api.getCellThread(initiativeId, threadId).then((v) => { if (live) setD(v); }, () => { if (live) setD(null); });
    return () => { live = false; };
  }, [initiativeId, threadId]);
  const dec = d ? [...(d.messages ?? [])].reverse().find((m) => m.kind === "decision") : undefined;
  if (!dec) return null;
  const { text, next } = splitRuling(dec.body);
  return (
    <div className="q-ruling" onClick={onOpen} title="open the thread">
      <Gavel size={11} />
      <span><b>{dec.from}</b> ruled {when(dec.created_at)}: {text}{next && <span className="q-next"> · <b>next</b> {next}</span>}</span>
    </div>
  );
}
