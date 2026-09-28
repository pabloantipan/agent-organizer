import { X } from "lucide-react";
import { marked } from "marked";
import { useEffect, useMemo, useRef, useState } from "react";
import { Help } from "../../wailsjs/go/main/App";
import type { service } from "../../wailsjs/go/models";
import "../styles/help.css";

type Section = { id: string; depth: number; title: string };

/** The Help (FR-1..3): help_doc read at the moment the Help opens, rendered
 *  as markdown with a list of its sections; fenced blocks are diagrams, kept
 *  monospace and scrolling sideways. Nothing here runs anything. */
export function HelpView({ top, onClose }: { top: number; onClose: () => void }) {
  const [doc, setDoc] = useState<service.HelpDoc | null>(null);
  const [failed, setFailed] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const body = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  // Read on open, every open: the file is never kept.
  useEffect(() => {
    Help().then(setDoc, (e) => setFailed(String(e)));
    close.current?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const html = useMemo(() => (doc?.text ? (marked.parse(doc.text) as string) : ""), [doc]);

  // Name the rendered headings so the sections list can reach them, and let
  // a diagram take focus so the keyboard can scroll it sideways.
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const found: Section[] = [];
    el.querySelectorAll<HTMLHeadingElement>("h1, h2, h3").forEach((h, i) => {
      h.id = `help-section-${i}`;
      found.push({ id: h.id, depth: Number(h.tagName[1]), title: h.textContent ?? "" });
    });
    el.querySelectorAll("pre").forEach((pre) => {
      pre.tabIndex = 0;
      pre.setAttribute("aria-label", "diagram, scrolls sideways");
    });
    setSections(found);
  }, [html]);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ block: "start" });

  return (
    <section className="help" style={{ top }} role="dialog" aria-label="Help">
      <header className="help-head">
        <h1 className="help-title">Help</h1>
        {doc && <span className="help-source mono" title={`read from ${doc.key}`}>{doc.path}</span>}
        <span className="spacer" />
        <button ref={close} className="ghost" onClick={onClose} title="Close the Help (Esc)"><X size={14} /> Close</button>
      </header>
      {failed && <p className="help-problem" role="alert">{failed}</p>}
      {doc?.problem && (
        <div className="help-problem" role="alert">
          <p>{doc.problem}</p>
          <p className="help-problem-meta">path tried <span className="mono">{doc.path}</span> · config key <span className="mono">{doc.key}</span></p>
        </div>
      )}
      {html && (
        <div className="help-body">
          <nav className="help-sections" aria-label="sections">
            <span className="help-sections-label">Sections</span>
            {sections.map((s) => (
              <button key={s.id} className={`help-section d${s.depth}`} onClick={() => go(s.id)}>{s.title}</button>
            ))}
          </nav>
          <article ref={body} className="markdown help-doc" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      )}
    </section>
  );
}
