import { useEffect, useMemo, useState } from "react";
import { marked } from "marked";
import { AtSign, Code2, FolderSearch, MessagesSquare, MessageSquareText, Pencil, Send, Terminal, Trash2, X } from "lucide-react";
import { api } from "../hooks/useWails";
import type { merge } from "../../wailsjs/go/models";
import { ageLabel, notesAsContext, shortHome, since } from "../lib";
import { useBoard } from "../stores/board.store";

// Trello-style card back: centered, description in the main column, labels
// and actions in the side column.
export function CardDrawer() {
  const { selected, select } = useBoard();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [select]);
  const html = useMemo(() => (selected ? (marked.parse(selected.body || "") as string) : ""), [selected]);
  if (!selected) return null;
  const c = selected;
  const dir = c.path.replace(/\/working-on\/.*$/, "");
  return (
    <div className="modal-backdrop" onClick={() => select(null)}>
      <div className={`modal ${c.status}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={c.title || c.slug}>
        <header className="modal-head">
          <div>
            <h2>{c.title || c.slug}</h2>
            <div className="meta">
              in <span className="ident">{c.initiative_id}</span> · <span className="mono">{c.slug}</span>
            </div>
          </div>
          <button className="ghost" onClick={() => select(null)} aria-label="Close"><X size={16} /></button>
        </header>
        <div className="modal-body">
          <div className="modal-main">
            <div className="labels">
              <span className={`badge ${c.status}`}>{c.status}</span>
              <span className={`badge machine ${c.local ? "local" : "remote"}`}>{c.machine}</span>
              {c.client && <span className="badge client">{c.client}</span>}
              {c.branch && <span className="badge mono">{c.branch}</span>}
              <span className="badge">updated {c.updated} · {ageLabel(c.updated)}</span>
            </div>
            {c.next && (
              <div className="next-box">
                <div className="section-label">Next action</div>
                <div>{c.next}</div>
              </div>
            )}
            <MyNotes card={c} />
            <div className="markdown" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <aside className="modal-side">
            <div className="section-label">Repos</div>
            <ul className="plain">
              {(c.repos ?? []).length === 0 && <li className="meta">none listed</li>}
              {(c.repos ?? []).map((r) => <li key={r} className="mono">{r}</li>)}
            </ul>
            <div className="section-label">Actions</div>
            {c.local ? (
              <div className="actions">
                <button onClick={() => api.openInEditor(c.path)}><Code2 size={14} /> <span>Open card in editor</span></button>
                <button onClick={() => api.openTerminal(dir)}><Terminal size={14} /> <span>Terminal at initiative</span></button>
                <button onClick={() => api.reveal(c.path)}><FolderSearch size={14} /> <span>Reveal in Finder</span></button>
              </div>
            ) : (
              <div className="meta">On {c.machine}. Actions work only on the local machine.</div>
            )}
            <Discuss card={c} />
            <div className="section-label">Path</div>
            <div className="mono meta wrap">{shortHome(c.path)}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}


/** Answering from the card: open the thread it waits on in Slack, or write
 *  to a seat with the card slug as the subject, which is what links the new
 *  conversation back to this card. Only when the initiative has a mailbox
 *  and the human seat holds a token. */
function Discuss({ card: c }: { card: merge.BoardCard }) {
  const { agents, openSlackThread, openSlackDraft, view } = useBoard();
  const [seat, setSeat] = useState("");
  const notes = view?.order?.notes?.[`${c.initiative_id}/${c.slug}`] ?? [];
  const group = (agents?.groups ?? []).find((g) => g.id === c.initiative_id);
  if (!group?.cell) return null;
  const seats = (group.cell.agents ?? []).filter((a) => a !== group.human);
  const threads = c.thread_state ?? [];
  const owner = seats.find((a) => c.next && c.next.toLowerCase().includes(a.split("_").pop() ?? "\u0000"));
  const to = seat || owner || seats[0] || "";
  return (
    <>
      <div className="section-label">Discuss</div>
      <div className="actions">
        {threads.map((t) => (
          <button key={t.id} onClick={() => openSlackThread(c.initiative_id, t.id)} disabled={t.missing} title={t.missing ? "thread closed or unknown" : `${t.status}, ${t.since_decision} since the last decision`}>
            <MessagesSquare size={14} /> <span>{t.missing ? "thread closed" : `Slack: ${t.subject || t.id.slice(0, 8)}`}</span>
          </button>
        ))}
        {group.can_post ? (
          <div className="discuss-write">
            <select value={to} onChange={(e) => setSeat(e.target.value)} title="who to write to">
              {seats.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <button onClick={() => openSlackDraft(c.initiative_id, to, `${c.slug}: `, notesAsContext(notes, group.human))} disabled={!to} title={`start a conversation with ${to}, subject "${c.slug}: …", which links it to this card${notes.length ? "; your comments go in as context" : ""}`}>
              <AtSign size={14} /> <span>Write about this card</span>
            </button>
          </div>
        ) : (
          <div className="meta">no token for the human seat; read only</div>
        )}
      </div>
    </>
  );
}


/** Comments on a card, the way Trello and Jira do it: a feed of signed,
 *  dated entries and a box to add one. They are the human's, kept in the
 *  app's synced state and never in the card file, so agents keep the file.
 *  "Write about this card" and the queue carry them into the conversation. */
function MyNotes({ card: c }: { card: merge.BoardCard }) {
  const { view, addNote, editNote, account } = useBoard();
  const key = `${c.initiative_id}/${c.slug}`;
  const notes = view?.order?.notes?.[key] ?? [];
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const me = account?.email || "";
  const submit = () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    addNote(c.initiative_id, c.slug, text).then(() => setText("")).finally(() => setBusy(false));
  };
  const initial = (by: string) => (by || "?").replace(/@.*$/, "").slice(0, 1).toUpperCase();
  return (
    <div className="comments">
      <div className="section-label"><MessageSquareText size={12} /> Comments <span className="meta">{notes.length || ""}</span> <span className="meta hint-inline">yours; synced with the app, not in the card file; carried into "Write about this card"</span></div>
      <div className="comment-new">
        <span className="avatar" title={me || "you"}>{initial(me)}</span>
        <div className="comment-box">
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…  (Enter to save, Shift+Enter for a new line)" rows={text ? 3 : 1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }} />
          {text && <div className="comment-actions"><button className="tiny-btn primary" onClick={submit} disabled={busy}><Send size={12} /> Save</button><button className="tiny-btn ghost" onClick={() => setText("")}>Cancel</button></div>}
        </div>
      </div>
      <ul className="comment-list">
        {[...notes].reverse().map((n) => (
          <li key={n.id} className="comment">
            <span className="avatar" title={n.by}>{initial(n.by)}</span>
            <div className="comment-main">
              <div className="comment-head"><b>{n.by?.replace(/@.*$/, "") || "you"}</b> <span className="meta" title={String(n.at)}>{since(n.at)}</span>
                <span className="comment-tools">
                  <button className="rail-icon" onClick={() => { setEditing(n.id); setDraft(n.text); }} title="edit"><Pencil size={11} /></button>
                  <button className="rail-icon" onClick={() => editNote(c.initiative_id, c.slug, n.id, "")} title="delete"><Trash2 size={11} /></button>
                </span>
              </div>
              {editing === n.id ? (
                <div className="comment-box">
                  <textarea autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); editNote(c.initiative_id, c.slug, n.id, draft); setEditing(null); } if (e.key === "Escape") setEditing(null); }} />
                  <div className="comment-actions"><button className="tiny-btn primary" onClick={() => { editNote(c.initiative_id, c.slug, n.id, draft); setEditing(null); }}>Save</button><button className="tiny-btn ghost" onClick={() => setEditing(null)}>Cancel</button></div>
                </div>
              ) : (
                <div className="comment-text">{n.text}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
