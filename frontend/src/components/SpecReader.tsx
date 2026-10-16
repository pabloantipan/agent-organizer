// The spec reader (docs/specs/diagrams.md FR-6 to FR-8; diagrams-in-app §3):
// a drawer from the right, over the current view, that shows a spec or a
// decision record rendered, with its Contents (`Change on the map` first,
// marked ✎) and its figures through DiagramFigure. A link to another spec
// or a record opens in the same drawer with ← Back; Esc or ✕ closes it and
// focus goes back to what opened it. A spec's text comes from the one bound
// read, ReadSpec, which refuses any path the scan did not resolve; a
// record's body is the board's.
import { useEffect, useId, useLayoutEffect, useMemo, useRef } from "react";
import { create } from "zustand";
import { marked } from "marked";
import { X } from "lucide-react";
import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";
import { ReadSpec } from "../../wailsjs/go/main/App";
import type { merge } from "../../wailsjs/go/models";
import { api } from "../hooks/useWails";
import { useBoard } from "../stores/board.store";
import { openBox } from "../lib/boxStack";
import { loopTab } from "../lib/tabTrap";
import { slotDiagrams } from "../lib/diagram";
import { useMarkdownEdges, useScrollEdges } from "../lib/useScrollEdges";
import { linkTarget, pathRef, sectionId, specRef, withAnchors, type ContentsItem, type ReaderIndex } from "../lib/specReader";
import { useDiagrams } from "./DiagramFigure";
import "../styles/spec-reader.css";

/** One file in the drawer's stack: a spec read by ReadSpec, or a record
 *  from the board. `scroll` is where it was left when another file opened
 *  over it, so ← Back lands there. */
export type ReaderEntry = {
  kind: "spec" | "record";
  /** Relative to the initiative root. */
  path: string;
  section: string;
  text: string;
  /** A record's number and title, for its heading. */
  number?: string;
  title?: string;
  error?: string;
  scroll?: number;
};

type ReaderState = {
  initiative: string | null;
  stack: ReaderEntry[];
  /** `<initiative>:<path>` of the specs read as missing. */
  missing: Record<string, true>;
};

export const useSpecReader = create<ReaderState>(() => ({ initiative: null, stack: [], missing: {} }));

const missingKey = (initiative: string, path: string) => `${initiative}:${path}`;

/** Whether a spec was read as missing (its opener reads `missing`). */
export const useSpecMissing = (initiative: string, path: string) =>
  useSpecReader((s) => !!s.missing[missingKey(initiative, path)]);

// What opened the drawer, kept here and not in the store: WebKit does not
// focus a button on a click, so document.activeElement cannot tell.
let opener: HTMLElement | null = null;

/** Where each file was left while the app runs, so reopening a spec lands
 *  where it was (diagrams-in-app §3, Keeping place). */
const leftAt = new Map<string, number>();

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim() || "the file could not be read";

/** Reads a spec. Missing marks it and returns null: nothing opens. */
async function readSpec(initiative: string, path: string, section: string): Promise<ReaderEntry | null> {
  try {
    const doc = await ReadSpec(initiative, path);
    if (doc.missing) {
      useSpecReader.setState((s) => ({ missing: { ...s.missing, [missingKey(initiative, path)]: true } }));
      return null;
    }
    clearMissing(initiative, path);
    return { kind: "spec", path, section, text: doc.text };
  } catch (e) {
    return { kind: "spec", path, section, text: "", error: errText(e) };
  }
}

function clearMissing(initiative: string, path: string) {
  const k = missingKey(initiative, path);
  if (!useSpecReader.getState().missing[k]) return;
  useSpecReader.setState((s) => {
    const m = { ...s.missing };
    delete m[k];
    return { missing: m };
  });
}

/** Opens a spec in the drawer from `el` (a Specs entry, a card's spec:
 *  link), which gets focus back when it closes. `ref` may carry a
 *  `#section`, which the drawer lands on. A missing file opens nothing and
 *  its opener reads `missing`. */
export async function openSpec(el: HTMLElement | null, initiative: string, ref: string, exact = false) {
  const r = exact ? pathRef(ref) : specRef(ref);
  if (!r) return;
  const entry = await readSpec(initiative, r.path, r.section);
  if (!entry) return;
  opener = el;
  useSpecReader.setState({ initiative, stack: [entry] });
}

/** Asks once whether a spec is there, so an opener that names a file the
 *  scan does not list (a card's spec:) reads `missing` before any press. */
export function useSpecProbe(initiative: string, ref: string, on: boolean) {
  useEffect(() => {
    const r = specRef(ref);
    if (!on || !r) return;
    ReadSpec(initiative, r.path).then(
      (doc) => (doc.missing ? useSpecReader.setState((s) => ({ missing: { ...s.missing, [missingKey(initiative, r.path)]: true } })) : clearMissing(initiative, r.path)),
      () => undefined,
    );
  }, [initiative, ref, on]);
}

type OpenerProps = { initiative: string; refText: string; label: string; local: boolean; className?: string; exact?: boolean };

/** A spec's opener: a link-styled button, or the path reading `missing`
 *  with no press; on another machine, the path alone. `exact` is a path as
 *  the scan lists it; else `refText` is a card's spec: field. */
export function SpecOpener(p: OpenerProps) {
  const r = p.exact ? pathRef(p.refText) : specRef(p.refText);
  const missing = useSpecMissing(p.initiative, r?.path ?? "");
  return <SpecOpenerView {...p} missing={missing} />;
}

/** What an opener shows, given whether its file was read as missing. */
export function SpecOpenerView({ initiative, refText, label, local, className, exact = false, missing }: OpenerProps & { missing: boolean }) {
  const r = exact ? pathRef(refText) : specRef(refText);
  if (!r || !local) return <span className={className}>{label}</span>;
  if (missing) {
    return <span className={`sr-opener-missing ${className ?? ""}`}>{label} <span className="sr-missing">missing</span></span>;
  }
  return (
    <button type="button" className={`linkish sr-opener ${className ?? ""}`} onClick={(e) => openSpec(e.currentTarget, initiative, refText, exact)} aria-label={`Read ${label}`}>
      {label}
    </button>
  );
}

/** What the drawer may follow inside an initiative: its records by path
 *  and its readable specs (the files under specs: and its cards' spec:). */
function readerIndex(i: merge.BoardInitiative | undefined, cards: merge.BoardCard[]): ReaderIndex {
  const records = new Map<string, string>();
  const specs = new Set<string>();
  if (!i) return { records, specs };
  const root = `${i.path}/`;
  for (const d of i.decisions ?? []) {
    if (d.path.startsWith(root)) records.set(d.path.slice(root.length), d.number);
  }
  for (const files of Object.values(i.spec_files ?? {})) for (const f of files) specs.add(f);
  for (const c of cards) {
    const r = c.initiative_id === i.id ? specRef(c.spec) : null;
    if (r) specs.add(r.path);
  }
  return { records, specs };
}

/** The drawer. Mounted once, beside the card back (CardDrawer). */
export function SpecReader() {
  const { initiative, stack } = useSpecReader();
  const { view } = useBoard();
  const top = stack[stack.length - 1] ?? null;
  const open = !!initiative && !!top;
  const board = view?.board;
  const init = board?.initiatives.find((x) => x.id === initiative);
  const cards = useMemo(() => Object.values(board?.columns ?? {}).flat(), [board]);
  const idx = useMemo(() => readerIndex(init, cards), [init, cards]);

  const box = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const rendered = useMemo(() => {
    if (!top) return { html: "", contents: [] };
    const md = top.kind === "record" ? `# ${top.number} ${top.title ?? ""}\n\n${top.text}` : top.text;
    return withAnchors(slotDiagrams(marked.parse(md || "") as string));
  }, [top]);
  const html = rendered.html;
  // The body's HTML is set here, not by dangerouslySetInnerHTML: React set
  // it again after the first commit (StrictMode, wails dev), replacing the
  // figure slots and the heading that held focus after they were taken.
  // This runs before the figures' and the landing's effects.
  const shown = useRef<{ el: HTMLElement | null; html: string }>({ el: null, html: "" });
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) { shown.current = { el: null, html: "" }; return; }
    if (shown.current.el === el && shown.current.html === html) return;
    el.innerHTML = html;
    shown.current = { el, html };
  });
  useMarkdownEdges(body, html);
  const figures = useDiagrams(body, html, top?.path ?? "");
  const edges = useScrollEdges(scroller, open, { label: `${top?.path ?? ""}, ${top?.kind === "record" ? "record" : "spec"}` });

  const close = () => {
    const el = scroller.current;
    if (top && el && initiative) leftAt.set(`${initiative}:${top.path}`, el.scrollTop);
    useSpecReader.setState({ initiative: null, stack: [] });
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => (open ? openBox(() => closeRef.current()) : undefined), [open]);

  // Focus back on the opener when the drawer closes.
  const wasOpen = useRef(false);
  useLayoutEffect(() => {
    if (!open && wasOpen.current) {
      const o = opener;
      opener = null;
      if (o?.isConnected) o.focus();
    }
    wasOpen.current = open;
  }, [open]);

  // Landing (FR-7, FR-8): on a `#section`, that heading at the top with
  // focus; on ← Back, the scroll the file was left at; else where the file
  // was last left, focus on the path. Figures that draw after landing
  // change the height above the place, so the place is held until the
  // reader scrolls or presses a key.
  useLayoutEffect(() => {
    const sc = scroller.current;
    const b = body.current;
    if (!open || !top || !sc || !b) return;
    const ids = Array.from(b.querySelectorAll<HTMLElement>("[id]")).map((h) => h.id);
    // ← Back restores the scroll even when the file was opened on a section.
    const id = top.scroll === undefined ? sectionId(ids, top.section) : null;
    const heading = id ? b.querySelector<HTMLElement>(`#${CSS.escape(id)}`) : null;
    const saved = top.scroll ?? leftAt.get(`${initiative}:${top.path}`) ?? 0;
    const place = () => {
      if (heading) sc.scrollTop = heading.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8;
      else sc.scrollTop = saved;
    };
    place();
    (heading ?? title.current)?.focus({ preventScroll: true });
    let held = true;
    const release = () => { held = false; };
    const ro = new ResizeObserver(() => { if (held) place(); });
    ro.observe(b);
    sc.addEventListener("wheel", release, { passive: true });
    sc.addEventListener("pointerdown", release);
    sc.addEventListener("keydown", release);
    const stop = window.setTimeout(release, 5000);
    return () => {
      ro.disconnect();
      window.clearTimeout(stop);
      sc.removeEventListener("wheel", release);
      sc.removeEventListener("pointerdown", release);
      sc.removeEventListener("keydown", release);
    };
  }, [open, top, initiative, html]);

  // Record links the initiative does not hold read `missing` and have no
  // press, before any press (FR-8; a never-acting item is not offered).
  useLayoutEffect(() => {
    const b = body.current;
    if (!open || !top || !b) return;
    b.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
      const t = linkTarget(top.path, a.getAttribute("href") ?? "", idx);
      if (t.kind === "missing" && !a.dataset.missing) markMissing(a);
    });
  }, [open, top, html, idx]);

  if (!open || !top || !initiative) return null;
  const root = init?.path ?? "";
  const local = !!init?.local;

  const push = (entry: ReaderEntry) => {
    const sc = scroller.current;
    useSpecReader.setState((s) => {
      const st = s.stack.slice();
      st[st.length - 1] = { ...st[st.length - 1], scroll: sc?.scrollTop ?? 0 };
      return { stack: [...st, entry] };
    });
  };
  const back = () => {
    const sc = scroller.current;
    if (sc) leftAt.set(`${initiative}:${top.path}`, sc.scrollTop);
    useSpecReader.setState((s) => ({ stack: s.stack.slice(0, -1) }));
  };
  const goSection = (id: string) => {
    const b = body.current;
    const sc = scroller.current;
    const h = b?.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
    if (!h || !sc) return;
    sc.scrollTop = h.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8;
    h.focus({ preventScroll: true });
  };

  const onBodyClick = async (e: React.MouseEvent) => {
    const a = (e.target as HTMLElement).closest?.("a");
    if (!a || !body.current?.contains(a)) return;
    e.preventDefault();
    if (a.dataset.missing) return;
    const t = linkTarget(top.path, a.getAttribute("href") ?? "", idx);
    switch (t.kind) {
      case "outside": BrowserOpenURL(t.url); return;
      case "here": { const id = sectionId(Array.from(body.current.querySelectorAll<HTMLElement>("[id]")).map((h) => h.id), t.section); if (id) goSection(id); return; }
      case "record": {
        const d = (init?.decisions ?? []).find((x) => x.number === t.number);
        if (d) push({ kind: "record", path: t.path, section: t.section, text: d.body ?? "", number: d.number, title: d.title });
        return;
      }
      case "spec": {
        const entry = await readSpec(initiative, t.path, t.section);
        if (entry) push(entry); else markMissing(a);
        return;
      }
      case "missing": markMissing(a); return;
      case "file": if (local) api.openInEditor(`${root}/${t.path}`); return;
      default: return;
    }
  };

  const prev = stack.length > 1 ? stack[stack.length - 2] : null;
  return (
    <div className="modal-backdrop sr-backdrop" onClick={close}>
      <div ref={box} className="sr-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => loopTab(e, box.current)}>
        <header className="sr-head">
          {prev && <button type="button" className="ghost sr-back" onClick={back} aria-label={`Back to ${prev.path}`}>← Back</button>}
          <h2 ref={title} id={titleId} tabIndex={-1} className="sr-path mono" title={top.path}>{top.path}</h2>
          {local && <button type="button" className="sr-editor" onClick={() => api.openInEditor(`${root}/${top.path}`)}>Open in editor</button>}
          <button type="button" className="ghost sr-close" onClick={close} aria-label={`Close ${top.path}`}><X size={16} aria-hidden /></button>
        </header>
        <div ref={scroller} className={`sr-body ${edges.top ? "edge-top" : ""} ${edges.bottom ? "edge-bottom" : ""}`}>
          {top.error ? (
            <p className="sr-error" role="status">Not read: {top.error}</p>
          ) : (
            <>
              <Contents items={rendered.contents} go={goSection} />
              <div ref={body} className="markdown sr-doc" onClick={onBodyClick} />
              {figures}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/** The document's Contents, the change map first. The ✎ is drawn only; the
 *  map's entry says what the mark tells a sighted reader, so its name is
 *  `<heading>, start here` (diagrams-in-app D9, leftovers-38 FR-4). */
export function Contents({ items, go }: { items: ContentsItem[]; go: (id: string) => void }) {
  if (items.length === 0) return null;
  return (
    <nav className="sr-contents" aria-label="Contents">
      <div className="section-label">Contents</div>
      <ol>
        {items.map((c) => (
          <li key={c.id} className={c.map ? "map" : undefined}>
            <button type="button" className="linkish" onClick={() => go(c.id)}>
              {c.map && <span className="sr-map-mark" aria-hidden="true">✎</span>}{c.text}{c.map && <span className="sr-only">, start here</span>}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** A link whose file is not there: it reads `missing` and has no press. */
function markMissing(a: HTMLAnchorElement) {
  if (a.dataset.missing) return;
  a.dataset.missing = "true";
  a.setAttribute("aria-disabled", "true");
  a.removeAttribute("href");
  const word = document.createElement("span");
  word.className = "sr-missing";
  word.textContent = "missing";
  a.after(" ", word);
}
