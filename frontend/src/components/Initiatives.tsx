import { useState } from "react";
import type { merge } from "../../wailsjs/go/models";
import { Bot, ChartGantt, Code2, Copy, Kanban, Terminal } from "lucide-react";
import { api } from "../hooks/useWails";
import { shortHome } from "../lib";
import { useBoard } from "../stores/board.store";

/** What the Initiatives tab showed when a row was open, now folded into
 *  Home: the repos with branch, dirt and last commit, the scanner's
 *  problems, and the actions on the initiative's root. */
export function InitiativeDetail({ i }: { i: merge.BoardInitiative }) {
  const repos = i.repos_state ?? [];
  return (
    <div className="init-detail">
      {i.title && <p className="init-detail-title">{i.title}</p>}
      <div className="init-detail-meta">
        <span className={`lz ${i.local ? "live" : "remote"} mono`}>{i.machine}</span>
        {i.also_on?.length > 0 && <span>also on {i.also_on.join(", ")}</span>}
        <span className="mono">{shortHome(i.path)}</span>
      </div>
      <div className="init-detail-label">Repos</div>
      {repos.length === 0 && <div className="init-detail-none">none listed in initiative.yaml</div>}
      <ul className="init-repos">
        {repos.map((r) => (
          <li key={r.name}>
            <span className="mono">{r.name}</span>
            {r.missing ? (
              <span className="missing">missing</span>
            ) : (
              <>
                <span className="mono" title={r.branch}>{r.branch}</span>
                <span className="mono dirty">{r.dirty > 0 ? `±${r.dirty}` : ""}</span>
                <span className="num">{r.last_commit}</span>
              </>
            )}
          </li>
        ))}
      </ul>
      {i.problems?.length > 0 && (
        <>
          <div className="init-detail-label">Problems</div>
          {i.problems.map((p, k) => (
            <div key={k} className="init-problem">{shortHome(p.path)}: {p.msg}</div>
          ))}
        </>
      )}
      <Actions id={i.id} path={i.path} local={i.local} />
    </div>
  );
}

function Actions({ id, path, local }: { id: string; path: string; local: boolean }) {
  const [note, setNote] = useState<string | null>(null);
  const { openInitiative } = useBoard();
  const flash = (m: string) => { setNote(m); window.setTimeout(() => setNote(null), 2500); };
  return (
    <div className="init-actions">
      <button onClick={() => openInitiative(id, "work")}><Kanban size={14} /> Work</button>
      <button onClick={() => openInitiative(id, "agents")}><Bot size={14} /> Agents</button>
      <button onClick={() => openInitiative(id, "roadmap")}><ChartGantt size={14} /> Roadmap</button>
      {!local && <span className="init-detail-none">remote initiative: files are on another machine</span>}
      {local && <button onClick={() => api.openInEditor(path)}><Code2 size={14} /> Editor</button>}
      {local && <button onClick={() => api.openTerminal(path)}><Terminal size={14} /> Terminal</button>}
      {local && <button onClick={() => api.copyReviewPrompt(id).then(() => flash("review prompt copied"), (e) => flash(String(e)))}><Copy size={14} /> Copy review prompt</button>}
      {local && <button onClick={() => api.runReview(id).then(() => flash("terminal opened with the agent"), (e) => flash(String(e)))}><Bot size={14} /> Review with agent</button>}
      {note && <span className="init-detail-none">{note}</span>}
    </div>
  );
}
