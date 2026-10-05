import { useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
import { marked } from "marked";
import { X } from "lucide-react";
import type { model } from "../../wailsjs/go/models";
import { useBoard } from "../stores/board.store";
import { dateWords } from "../lib/dates";
import { openBox } from "../lib/boxStack";
import { useScrollEdges } from "../lib/useScrollEdges";
import { focusBoxBelow } from "./RuleDecisionBox";
import { ageWords, noSessionLine, otherHandOffLine, roleState, sessionStarted, sessionWord } from "../lib/roles";
import "../styles/roles.css";

// A role's drawer (docs/ux/specs/transversal-roles.md, A click): the card
// back's pattern, capped at the window, scrolling its own body, Escape
// closing it, focus on its title and back on what opened it. Show only
// (R6): nothing here attaches, kills, starts or messages. Every line that
// goes somewhere goes through the store's navigation.

// What opened the drawer, kept here and not in the store: WebKit does not
// focus a button on a click, so document.activeElement cannot tell.
let opener: HTMLElement | null = null;

/** Opens a role's drawer from a row or a rail item, which gets the focus
 *  back when it closes. */
export function openRoleFrom(el: HTMLElement | null, name: string) {
  opener = el;
  useBoard.getState().openRole(name);
}

/** After a session line lands on its initiative's Agents (R5, A3): focus
 *  goes to that session's row, by its data-session, read by its name, never
 *  to one of its actions; a crew seat's row (Crew, data-seat) is found by the
 *  session its Attach names. The row shows as selected until focus leaves
 *  it. Waits for the sub-view to mount, two seconds at most. */
function landOnSession(session: string) {
  const until = Date.now() + 2000;
  const tryLand = () => {
    const row = document.querySelector<HTMLElement>(`.agents li[data-session="${CSS.escape(session)}"]`)
      ?? document.querySelector<HTMLElement>(`.agents button[title="${CSS.escape(`probe ${session}`)}"]`)?.closest<HTMLElement>("li[data-seat]") ?? null;
    if (!row) { if (Date.now() < until) window.setTimeout(tryLand, 50); return; }
    row.focus();
    row.scrollIntoView({ block: "center" });
    row.classList.add("role-landed");
    const off = (e: FocusEvent) => {
      if (e.relatedTarget instanceof Node && row.contains(e.relatedTarget)) return;
      row.classList.remove("role-landed");
      row.removeEventListener("focusout", off);
    };
    row.addEventListener("focusout", off);
  };
  window.setTimeout(tryLand, 0);
}

export function RoleDrawer() {
  const { agents, roleOpen, openRole, openInitiative, openSlackThread } = useBoard();
  const role = (agents?.roles ?? []).find((r) => r.here && r.name === roleOpen) ?? null;
  const open = !!role;
  const title = useRef<HTMLHeadingElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const edges = useScrollEdges(scroller, open);
  const titleId = useId();
  const descId = useId();
  // A landing closes the drawer without handing focus back: focus goes to
  // the thing named (design system, Focus and names, Navigating).
  const landing = useRef(false);
  const close = () => openRole(null);
  useEffect(() => (open ? openBox(() => openRole(null)) : undefined), [open, openRole]);
  useFocusReturn(open ? roleOpen : null, title, landing);

  if (!role) return null;
  const st = roleState(role);
  const go = (fn: () => void) => { landing.current = true; openRole(null); fn(); };
  // An open box keeps the keyboard: Tab and Shift+Tab loop inside it.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !box.current) return;
    const items = Array.from(box.current.querySelectorAll<HTMLElement>("button, summary, [href], [tabindex]:not([tabindex='-1'])")).filter((el) => !el.hasAttribute("disabled"));
    if (items.length === 0) return;
    const first = items[0], last = items[items.length - 1];
    const at = document.activeElement;
    if (e.shiftKey && (at === first || at === title.current)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
  };
  const sessions = role.sessions ?? [];
  const mail = role.mail ?? [];
  const inits = role.initiatives ?? [];
  return (
    <div className="modal-backdrop" onClick={close}>
      <div ref={box} className="modal card-back role-drawer" onClick={(e) => e.stopPropagation()} onKeyDown={onKeyDown} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
        <header className="modal-head">
          <div>
            <h2 ref={title} id={titleId} tabIndex={-1}>{role.name}</h2>
            <div id={descId} className="rd-desc">{role.description}</div>
            <div className="rd-state">
              {st.live && <span className={`live-dot ${st.working ? "working" : ""}`} aria-hidden="true" />}
              <span className="num">{st.working ? `${st.text} · working` : st.text}</span>
            </div>
          </div>
          <button className="ghost" onClick={close} aria-label={`Close ${role.name}`}><X size={16} /></button>
        </header>
        <div ref={scroller} className={`modal-body rd-body ${edges.top ? "edge-top" : ""} ${edges.bottom ? "edge-bottom" : ""}`}>
          <Section label="Sessions">
            {sessions.length === 0
              ? <p className="rd-empty">{noSessionLine(role)}</p>
              : <ul className="rd-list">
                  {sessions.map((s) => <SessionLine key={`${s.name}#${s.pid}`} s={s} onGo={() => go(() => { openInitiative(s.initiative, "agents"); landOnSession(s.name); })} />)}
                </ul>}
          </Section>
          <Section label="Doing now">
            <DoingNow role={role} />
          </Section>
          <Section label="Mail waiting">
            {role.mail_unknown
              ? <p className="rd-empty">Mailbox not reachable.</p>
              : mail.length === 0
                ? <p className="rd-empty">No mail waiting.</p>
                : <ul className="rd-list">
                    {mail.map((m) => (
                      <li key={m.thread_id}>
                        <button className="rd-line mail" onClick={() => go(() => openSlackThread(m.initiative, m.thread_id))} aria-label={`Open the thread ${m.subject} in ${m.initiative}'s Conversations`}>
                          <span className="rd-main">{m.subject}</span>
                          <span className="rd-meta">{[m.from && `from ${m.from}`, m.initiative].filter(Boolean).join(" · ")}</span>
                          <span className="rd-age num" title={`${ageWords(m.age_seconds)} old`}>{ageWords(m.age_seconds)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>}
          </Section>
          <Section label="Initiatives">
            {inits.length === 0
              ? <p className="rd-empty">None yet.</p>
              : <p className="rd-inits">
                  {inits.map((id, i) => (
                    <span key={id}>{i > 0 && ", "}<a href="#" className="rd-init mono" onClick={(e) => { e.preventDefault(); go(() => openInitiative(id, "overview")); }} aria-label={`Open ${id}`}>{id}</a></span>
                  ))}
                </p>}
          </Section>
        </div>
      </div>
    </div>
  );
}

/** Focus and names: focus lands on the title when the drawer opens, and
 *  goes back to its opener when it closes, unless a line navigated; over an
 *  open rule box it goes back into the box. The opener may have left the
 *  page (the rail folded to the strip): then the role's other opener, by
 *  its data-role. */
function useFocusReturn(name: string | null, title: React.RefObject<HTMLHeadingElement | null>, landing: React.MutableRefObject<boolean>) {
  const was = useRef<string | null>(null);
  useLayoutEffect(() => {
    if (name && name !== was.current) { landing.current = false; title.current?.focus(); }
    if (!name && was.current) {
      const o = opener;
      const last = was.current;
      opener = null;
      if (!landing.current && !focusBoxBelow()) {
        const back = o?.isConnected ? o : document.querySelector<HTMLElement>(`[data-role="${CSS.escape(last)}"]`);
        back?.focus();
      }
      landing.current = false;
    }
    was.current = name;
  }, [name, title, landing]);
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <section className="rd-sec" aria-labelledby={id}>
      <h3 id={id} className="section-label">{label}</h3>
      {children}
    </section>
  );
}

function SessionLine({ s, onGo }: { s: model.RoleSession; onGo: () => void }) {
  const ctx = s.context == null ? "" : `${Math.round(s.context)}% context`;
  const started = sessionStarted(s);
  const parts = (
    <>
      <span className="rd-main mono">{s.name}</span>
      <span className="rd-meta">{s.initiative || "outside every initiative"}</span>
      <span className={`rd-word ${s.state}`}>{(s.state === "working" || s.state === "running") && <i className={`live-dot ${s.working ? "working" : ""}`} aria-hidden="true" />}{sessionWord(s)}</span>
      <span className="rd-num num">{ctx}</span>
      <span className="rd-meta num">{started}</span>
    </>
  );
  if (!s.initiative) return <li><div className="rd-line static" title="not in any initiative: it has no Agents to land on">{parts}</div></li>;
  return (
    <li>
      <button className="rd-line" onClick={onGo} aria-label={`${s.name} in ${s.initiative}: ${sessionWord(s)}${ctx ? `, ${ctx}` : ""}; open its Agents`}>{parts}</button>
    </li>
  );
}

/** Doing now (States): each bitácora found, its HAND-OFF rendered read-only
 *  with its date and path, this machine's first (the feed's pick) and the
 *  others folded as `<host> · <date>`; a bitácora without one shows its
 *  last five log lines; none says where one was looked for. */
function DoingNow({ role }: { role: model.Role }) {
  const bs = role.bitacoras ?? [];
  if (bs.length === 0) {
    return <p className="rd-empty">No bitácora yet{role.bitacora_expected ? <> at <code className="mono">{role.bitacora_expected}</code></> : ""}.</p>;
  }
  return <>{bs.map((b) => <Bitacora key={b.path} b={b} />)}</>;
}

function Bitacora({ b }: { b: model.RoleBitacora }) {
  const h = b.hand_off;
  return (
    <div className="rd-bitacora">
      {h ? (
        <>
          <div className="rd-handoff-head">
            <span className="rd-host">{h.host || "hand-off"}</span>
            <span className={`num ${h.stale ? "stale" : ""}`}>{h.date ? `hand-off ${dateWords(h.date)}` : "hand-off"}</span>
            {h.stale && <span className="rd-stale">older than a week</span>}
          </div>
          <div className="rd-path mono">{b.path}</div>
          <HandOffBody body={h.body} />
          {(b.others ?? []).map((o, i) => (
            <details key={i} className="rd-other">
              <summary>{otherHandOffLine(o)}{o.stale ? " · older than a week" : ""}</summary>
              <HandOffBody body={o.body} />
            </details>
          ))}
        </>
      ) : (
        <>
          <div className="rd-path mono">{b.path}</div>
          {(b.log ?? []).length === 0
            ? <p className="rd-empty">No HAND-OFF and no dated line yet.</p>
            : <ul className="rd-log">
                {(b.log ?? []).map((l, i) => <li key={i}><span className="num">{dateWords(l.date)}</span> {l.text}</li>)}
              </ul>}
        </>
      )}
    </div>
  );
}

function HandOffBody({ body }: { body: string }) {
  const html = useMemo(() => marked.parse(body || "") as string, [body]);
  return <div className="markdown rd-handoff" dangerouslySetInnerHTML={{ __html: html }} />;
}
