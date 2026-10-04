import { X } from "lucide-react";
import { marked } from "marked";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMarkdownEdges } from "../lib/useScrollEdges";
import { Help } from "../../wailsjs/go/main/App";
import type { service } from "../../wailsjs/go/models";
import { openBox } from "../lib/boxStack";
import { focusBoxBelow } from "./RuleDecisionBox";
import "../styles/help.css";

type Section = { id: string; depth: number; title: string };

/** The Help (FR-1..3): help_doc read at the moment the Help opens, rendered
 *  as markdown with a list of its sections; fenced blocks are diagrams, kept
 *  monospace and scrolling sideways. Nothing here runs anything. */
export function HelpView({ top, onClose }: { top: number; onClose: () => void }) {
  const [doc, setDoc] = useState<service.HelpDoc | null>(null);
  const [failed, setFailed] = useState("");
  const body = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  // Read on open, every open: the file is never kept.
  useEffect(() => {
    Help().then(setDoc, (e) => setFailed(String(e)));
    close.current?.focus();
  }, []);
  // leftovers-7 FR-2: closing Help puts focus back into the rule box under
  // it, at the field it last held; with no box, on Help's opener (the
  // control focused when it opened, else the top bar's Help button, since
  // WebKit does not focus a clicked button).
  useEffect(() => {
    const a = document.activeElement;
    const opener = a instanceof HTMLElement && a !== document.body && !a.closest(".rb") ? a : document.querySelector<HTMLElement>('.topbar button[aria-label="Help"]');
    return () => { if (!focusBoxBelow()) opener?.focus(); };
  }, []);
  // Escape closes Help when it is the topmost open box (leftovers-5 FR-1).
  const closeNow = useRef(onClose);
  closeNow.current = onClose;
  useEffect(() => openBox(() => closeNow.current()), []);

  // Name the headings and let a diagram take focus (so the keyboard can
  // scroll it sideways) in the HTML string itself, not on the rendered DOM:
  // React owns the article's innerHTML and may set it again after an effect,
  // which dropped ids added afterwards, so the section list found nothing to
  // scroll to (FR-9).
  const { html, sections } = useMemo(() => {
    if (!doc?.text) return { html: "", sections: [] as Section[] };
    const tpl = document.createElement("template");
    tpl.innerHTML = marked.parse(doc.text) as string;
    const found: Section[] = [];
    tpl.content.querySelectorAll<HTMLHeadingElement>("h1, h2, h3").forEach((h, i) => {
      h.id = `help-section-${i}`;
      found.push({ id: h.id, depth: Number(h.tagName[1]), title: h.textContent ?? "" });
    });
    tpl.content.querySelectorAll("pre").forEach((pre) => {
      pre.setAttribute("tabindex", "0");
      pre.setAttribute("aria-label", "diagram, scrolls sideways");
    });
    return { html: tpl.innerHTML, sections: found };
  }, [doc]);
  useMarkdownEdges(body, html);

  // The article (.help-doc, overflow-y: auto) is the element that scrolls;
  // the fixed overlay around it does not, so the heading moves into its view.
  const go = (id: string) => body.current?.querySelector<HTMLElement>(`#${id}`)?.scrollIntoView({ block: "start" });

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
