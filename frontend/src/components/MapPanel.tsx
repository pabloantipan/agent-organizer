// The map's right side (docs/specs/leftovers-58.md FR-7, FR-8;
// map-and-roadmap Amendment 1, "The node panel"): the text alternative of
// the drawn level. With no node picked it lists every node of the level,
// each with its status words, so nothing the figure shows is only drawn.
// A picked node shows its facts and ends with Grounding, one line per
// evidence entry, each line either an action or the reason it has none
// (never a press that does nothing):
//   repo <dir>@<sha>   opens the editor at the repo (OpenInEditor)
//   deploy <path>      opens the file in the editor
//   record NNNN        opens the record in the spec reader's drawer
//   curated: <page>    opens docs/architecture/<page> in the spec reader
// c4-map/1 carries no members for a merged node, so none are listed.
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { merge, model, service } from "../../wailsjs/go/models";
import { api } from "../hooks/useWails";
import { openSpec, useSpecReader } from "./SpecReader";

type Node = service.C4Node;
type Evidence = service.C4Evidence;

/** What a grounding line does when pressed. */
export type GroundAct =
  | { to: "editor"; path: string }
  | { to: "record"; number: string }
  | { to: "spec"; path: string };

/** One grounding line: its words, whether they are a path (mono), and its
 *  action, or the reason it has none (`reason`), or neither (a kind that
 *  names nothing to open: pipeline, cluster, external). */
export type GroundLine = { key: string; kind: string; word: string; ref: string; mono: boolean; act: GroundAct | null; reason?: string };

/** What a line needs to know of the initiative on this machine. */
export type GroundCtx = {
  root: string;
  repos: Pick<model.RepoState, "name" | "path" | "missing">[];
  decisions: Pick<model.Decision, "number">[];
  /** map.json `inputs`: the repos the map was made from. */
  inputs: Record<string, string | null>;
};

export const MAP_DIR = "docs/architecture";

/** The repo a `<dir>[/<path>]` names on this machine: its path, or why not. */
function inRepo(ctx: GroundCtx, dirPath: string): { path: string } | { reason: string } {
  const [name, ...rest] = dirPath.split("/");
  const rs = ctx.repos.find((r) => r.name === name);
  if (!rs) return { reason: `not on this machine: ${name} is not in this initiative's repos` };
  if (rs.missing) return { reason: `not on this machine: ${name} has no checkout here` };
  const sub = rest.filter(Boolean).join("/");
  return { path: sub ? `${rs.path}/${sub}` : rs.path };
}

const isRepoName = (ctx: GroundCtx, name: string) => ctx.repos.some((r) => r.name === name) || name in (ctx.inputs ?? {});

/** One evidence entry as a line (FR-8). */
export function groundLine(e: Evidence, ctx: GroundCtx, k = 0): GroundLine {
  const ref = (e.ref ?? "").trim();
  const base = { key: `${k}:${e.kind}:${ref}`, kind: e.kind, ref };
  switch (e.kind) {
    case "repo": {
      const r = inRepo(ctx, ref.split("@")[0]);
      return { ...base, word: "repo", mono: true, ...("path" in r ? { act: { to: "editor", path: r.path } } : { act: null, reason: r.reason }) };
    }
    case "deploy": {
      const file = ref.split(/\s+/)[0] ?? "";
      if (!file.includes("/") && !/\.\w+$/.test(file)) return { ...base, word: "deploy", mono: true, act: null, reason: "not a file: the deploy adapter's own reference" };
      const first = file.split("/")[0];
      if (isRepoName(ctx, first)) {
        const r = inRepo(ctx, file);
        return { ...base, word: "deploy", mono: true, ...("path" in r ? { act: { to: "editor", path: r.path } } : { act: null, reason: r.reason }) };
      }
      return { ...base, word: "deploy", mono: true, act: { to: "editor", path: `${ctx.root}/${file}` } };
    }
    case "record": {
      const number = ref.padStart(4, "0");
      const known = ctx.decisions.some((d) => d.number === number);
      return { ...base, ref: number, word: "record", mono: false, ...(known ? { act: { to: "record", number } } : { act: null, reason: "not among this initiative's decisions" }) };
    }
    case "curated": {
      // ReadSpec reads the map's curated pages (leftovers-58 FR-10).
      return { ...base, word: "curated:", mono: false, act: { to: "spec", path: `${MAP_DIR}/${ref}` } };
    }
    default:
      return { ...base, word: e.kind, mono: true, act: null };
  }
}

/** The context of an initiative as the board carries it. */
export function groundCtx(i: merge.BoardInitiative, inputs: Record<string, string | null> | undefined): GroundCtx {
  return { root: i.path, repos: i.repos_state ?? [], decisions: i.decisions ?? [], inputs: inputs ?? {} };
}

/** The record a ruled node was ruled by: its first `record` evidence. */
export function ruledBy(n: Node): string | null {
  if (n.status !== "ruled") return null;
  const r = (n.grounding ?? []).find((g) => g.kind === "record");
  return r ? r.ref.trim().padStart(4, "0") : null;
}

/** A node's status in words, as the panel and the list say it. */
export function statusWords(n: Node): string[] {
  const out: string[] = [];
  const ruled = ruledBy(n);
  if (n.status === "ruled") out.push(ruled ? `ruled ${ruled}` : "ruled");
  else if (n.status) out.push(n.status);
  else out.push("status unknown");
  if (!(n.grounding ?? []).length) out.push("not grounded");
  return out;
}

/** Opens a record in the spec reader's drawer; focus goes back to `el`
 *  when it closes (the drawer's own opener is for specs it reads). */
export function openRecord(el: HTMLElement | null, i: merge.BoardInitiative, number: string): boolean {
  const d = (i.decisions ?? []).find((x) => x.number === number);
  if (!d) return false;
  const root = `${i.path}/`;
  const path = d.path.startsWith(root) ? d.path.slice(root.length) : d.path;
  useSpecReader.setState({ initiative: i.id, stack: [{ kind: "record", path, section: "", text: d.body ?? "", number: d.number, title: d.title }] });
  const un = useSpecReader.subscribe((s) => {
    if (s.initiative && s.stack.length) return;
    un();
    if (el?.isConnected) el.focus();
  });
  return true;
}

/** Runs a line's action. Editor opens go through the bound OpenInEditor. */
export async function runGround(act: GroundAct, el: HTMLElement | null, i: merge.BoardInitiative): Promise<void> {
  if (act.to === "editor") return api.openInEditor(act.path);
  if (act.to === "record") { openRecord(el, i, act.number); return; }
  return openSpec(el, i.id, act.path, true);
}

const errText = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim() || "it did not open";

function GroundRow({ line, initiative }: { line: GroundLine; initiative: merge.BoardInitiative }) {
  const [err, setErr] = useState("");
  const words = (
    <>
      <span className="map-ground-kind">{line.word}</span> <span className={line.mono ? "mono" : undefined}>{line.ref}</span>
    </>
  );
  if (!line.act) {
    return (
      <li className="map-ground-line" data-kind={line.kind}>
        <span className={line.reason ? "map-ground-off" : undefined}>{words}</span>
        {line.reason && <span className="map-ground-why">{line.reason}</span>}
      </li>
    );
  }
  const act = line.act;
  const press = (e: MouseEvent<HTMLButtonElement>) => {
    setErr("");
    runGround(act, e.currentTarget, initiative).catch((x) => setErr(errText(x)));
  };
  const title = act.to === "editor" ? `Open ${act.path} in the editor` : act.to === "record" ? `Open record ${act.number}` : `Read ${act.path}`;
  return (
    <li className="map-ground-line" data-kind={line.kind}>
      <button type="button" className="linkish map-ground-act" onClick={press} title={title}>{words}</button>
      {err && <span className="map-ground-why" role="status">Not opened: {err}</span>}
    </li>
  );
}

export type Drill = { label: string; go: () => void } | { none: string } | null;

type PanelProps = {
  initiative: merge.BoardInitiative;
  index: service.C4Map;
  /** The nodes of the level shown, in reading order. */
  nodes: Node[];
  levelName: string;
  picked: Node | null;
  pick: (id: string | null) => void;
  /** What opening the picked node does: a deeper level, or why not. */
  drill: Drill;
};

/** The right side: the level's nodes, or one node's facts and grounding. */
export function MapPanel({ initiative, index, nodes, levelName, picked, pick, drill }: PanelProps) {
  // When what the panel shows changes under a press that unmounted the
  // pressed control (a list entry, ← All of, a level), focus lands here:
  // back on the node's list entry, else on the panel's title. A press on
  // the figure keeps focus on its node.
  const box = useRef<HTMLElement>(null);
  const shown = `${levelName}:${picked?.id ?? ""}`;
  const last = useRef({ shown, picked: picked?.id ?? null });
  useEffect(() => {
    const prev = last.current;
    if (prev.shown === shown) return; // the first run (twice under StrictMode) moves nothing
    last.current = { shown, picked: picked?.id ?? null };
    const el = box.current;
    if (!el || typeof document === "undefined") return;
    const a = document.activeElement;
    if (a && a !== document.body && !el.contains(a)) return;
    const back = !picked && prev.picked ? el.querySelector<HTMLElement>(`[data-node="${CSS.escape(prev.picked)}"]`) : null;
    (back ?? el.querySelector<HTMLElement>(".map-panel-title"))?.focus();
  }, [shown]);
  if (!picked) {
    return (
      <aside ref={box} className="map-panel" aria-label={`${levelName}: the map as text`}>
        <h3 className="map-panel-title" tabIndex={-1}>{levelName}</h3>
        <p className="map-panel-meta">{nodes.length} {nodes.length === 1 ? "node" : "nodes"}. Pick one for its grounding.</p>
        <ul className="map-panel-list">
          {nodes.map((n) => (
            <li key={n.id}>
              <button type="button" className="linkish map-panel-node" data-node={n.id} onClick={() => pick(n.id)}>{n.label}</button>
              <span className="map-panel-words"> {[n.kind ?? "kind unknown", ...statusWords(n)].join(" · ")}</span>
            </li>
          ))}
        </ul>
      </aside>
    );
  }
  const ctx = groundCtx(initiative, index.inputs);
  const ground = (picked.grounding ?? []).map((g, k) => groundLine(g, ctx, k));
  const ruled = ruledBy(picked);
  const parent = picked.parent ? nodesLabel(index, picked) : null;
  const ungrounded = !ground.length;
  return (
    <aside ref={box} className="map-panel" aria-label={`${picked.label}: node`}>
      <button type="button" className="ghost map-panel-back" onClick={() => pick(null)}>← All of {levelName}</button>
      <h3 className="map-panel-title" tabIndex={-1}>{picked.label}{ungrounded && <span className="map-panel-drift">, not grounded</span>}</h3>
      <dl className="map-facts">
        <dt>id</dt><dd className="mono">{picked.id}</dd>
        <dt>kind</dt><dd>{picked.kind ?? "kind unknown"}</dd>
        <dt>status</dt>
        <dd className={`map-status map-status-${picked.status ?? "unknown"}`}>
          {picked.status === "ruled" && ruled && ctx.decisions.some((d) => d.number === ruled) ? (
            <button type="button" className="linkish map-ruled-link" onClick={(e) => openRecord(e.currentTarget, initiative, ruled)} title={`Open record ${ruled}`}>ruled {ruled}</button>
          ) : (
            statusWords(picked)[0]
          )}
        </dd>
        {parent && (<><dt>in</dt><dd>{parent}</dd></>)}
      </dl>
      {drill && ("none" in drill ? <p className="map-panel-meta map-no-l3">{drill.none}</p> : (
        <button type="button" className="map-drill" onClick={drill.go}>{drill.label}</button>
      ))}
      <h4 className="map-panel-sub">Grounding</h4>
      {ungrounded ? (
        <p className="map-panel-drift-line">not grounded: no evidence names this node.</p>
      ) : (
        <ul className="map-ground">
          {ground.map((l) => <GroundRow key={l.key} line={l} initiative={initiative} />)}
        </ul>
      )}
    </aside>
  );
}

/** The label of a node's parent, the system or a container. */
function nodesLabel(index: service.C4Map, n: Node): string {
  const p = n.parent ?? "";
  const hit = (index.nodes ?? []).find((x) => x.id === p && x.level !== "modules" && x.id !== n.id);
  return hit?.label ?? p;
}
