import { useEffect, useMemo } from "react";
import { marked } from "marked";
import { Code2, FolderSearch, Terminal, X } from "lucide-react";
import { api } from "../hooks/useWails";
import { ageLabel, shortHome } from "../lib";
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
                <button onClick={() => api.openInEditor(c.path)}><Code2 size={14} /> Open card in editor</button>
                <button onClick={() => api.openTerminal(dir)}><Terminal size={14} /> Terminal at initiative</button>
                <button onClick={() => api.reveal(c.path)}><FolderSearch size={14} /> Reveal in Finder</button>
              </div>
            ) : (
              <div className="meta">On {c.machine}. Actions work only on the local machine.</div>
            )}
            <div className="section-label">Path</div>
            <div className="mono meta wrap">{shortHome(c.path)}</div>
          </aside>
        </div>
      </div>
    </div>
  );
}
