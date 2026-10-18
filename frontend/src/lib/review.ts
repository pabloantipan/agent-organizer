import type { review, service } from "../../wailsjs/go/models";

/** The Review view's pure half (docs/ux/specs/review-view.md §3.1, §3.2,
 *  §4, §5; review-map v2 FR-18): what the worklist holds and in what order,
 *  what the header counts, and every state's words, copied from the design.
 *  Components/Review.tsx draws them. */

/** Where the review is (§2): one card's change at one head, and the symbol
 *  shown. head "" is the change's current head; symbol "" is none chosen. */
export type ReviewPlace = { initiative: string; card: string; head: string; symbol: string };

export type MarkState = "" | "reviewed" | "question" | "blocked";

/** The words of §4, exactly. */
export const WORDS = {
  noMap: "No review map for this change yet.",
  makeMap: "Make the map",
  stop: "Stop",
  tryAgain: "Try again",
  copyCommand: "Copy the command",
  makeAgain: "Make it again",
  changedSince: "changed since you reviewed",
  nothing: "Nothing to review at symbol level: the change touches no Go or TS definition.",
  nextToReview: "Next to review",
  back: "← Card",
  sectionLabel: "Review",
  reviewChange: "Review the change",
} as const;

/** §4 making: `Making the map · 2 s`, a counter, no spinner. */
export const makingLabel = (seconds: number) => `Making the map · ${Math.max(0, Math.floor(seconds))} s`;

/** Seconds since a make started (RFC3339), never below its reported elapsed. */
export function elapsedOf(make: Pick<service.ReviewMake, "started" | "elapsed"> | null | undefined, now: number = Date.now()): number {
  if (!make) return 0;
  const t = Date.parse(make.started);
  const counted = Number.isNaN(t) ? 0 : (now - t) / 1000;
  return Math.max(make.elapsed ?? 0, counted);
}

export const short = (sha: string | undefined) => (sha ?? "").slice(0, 7);

/** §4 the branch moved: `The branch moved since this map (4d2a91b → 9e0f3c1).` */
export const movedLine = (mapHead: string, head: string) => `The branch moved since this map (${short(mapHead)} → ${short(head)}).`;

/** The flag words of §3.3's table; any other flag is drawn as written. */
export const FLAG_WORDS: Record<string, string> = {
  undeclared: "not in the card's declared changes",
  outside_footprint: "outside the card's footprint",
  declared_not_changed: "declared, not changed",
  untested: "no direct test",
};
export const flagWords = (f: string) => FLAG_WORDS[f] ?? f;
/** Amber flags are "look at this, nothing has stopped"; the rest are muted. */
export const flagLook = (f: string): "amber" | "dashed" | "muted" => (f === "undeclared" || f === "outside_footprint" ? "amber" : f === "declared_not_changed" ? "dashed" : "muted");

/** The marks as the row draws them (§3.2): none, ✓, ?, ✕. */
export const MARK_GLYPH: Record<MarkState, string> = { "": "", reviewed: "✓", question: "?", blocked: "✕" };

const RISK_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** A changed definition: a symbol that is not an affected neighbour. */
const changed = (n: review.Node) => n.level === "symbol" && n.change !== "affected";
const isTest = (n: review.Node) => n.kind === "test";
const pkgOf = (m: review.RevMap) => new Map((m.nodes ?? []).filter((n) => n.level === "package").map((n) => [n.id, n]));

/** A symbol's short name: what follows its package (`go:x/svc.Greet` →
 *  `Greet`, `ts:web/src/format.ts#formatName` → `formatName`). In Must
 *  visit, where no package heads it, it carries the package's last part
 *  (`shared.Upload`, §3's sketch); a TS one carries its file's stem. */
export function shortName(n: review.Node, qualified = false): string {
  const id = n.id.replace(/^[a-z]+:/, "");
  const hash = id.lastIndexOf("#");
  if (hash >= 0) {
    const name = id.slice(hash + 1);
    if (!qualified) return name;
    const stem = id.slice(0, hash).split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
    return stem ? `${stem}.${name}` : name;
  }
  const pkg = n.parent.replace(/^[a-z]+:/, "");
  const name = pkg && id.startsWith(pkg + ".") ? id.slice(pkg.length + 1) : id.split("/").pop() ?? id;
  if (!qualified) return name;
  const last = pkg.split("/").pop() ?? "";
  return last ? `${last}.${name}` : name;
}

/** A package group's title: the package's directory as the map writes it. */
const pkgTitle = (pkg: review.Node | undefined, id: string) => pkg?.file || id.replace(/^[a-z]+:/, "");

export type Row = {
  id: string;
  /** The changed node; null for a declared, not changed row. */
  node: review.Node | null;
  name: string;
  change: string;
  flags: string[];
  mark: MarkState;
  /** §4 new map, same symbol: the previous head's mark did not carry. */
  changedSince: boolean;
  /** Counted by coverage and walked by Next to review. */
  counted: boolean;
};

export type GroupKind = "must" | "package" | "declared" | "tests";
export type Group = { key: string; kind: GroupKind; title: string; rows: Row[]; collapsed: boolean };

/** The marks of a head, by symbol, and the symbols whose marks did not
 *  carry to it. */
export function marksOf(marks: review.Marks | null | undefined): { by: Map<string, MarkState>; changed: Set<string> } {
  const by = new Map<string, MarkState>();
  for (const m of marks?.marks ?? []) if (m.state) by.set(m.symbol, m.state as MarkState);
  const changedSet = new Set((marks?.changed ?? []).map((m) => m.symbol).filter((s) => !by.has(s)));
  return { by, changed: changedSet };
}

function fileOrder(a: review.Node, b: review.Node) {
  return a.file.localeCompare(b.file) || (a.range_head?.[0] ?? a.range_base?.[0] ?? 0) - (b.range_head?.[0] ?? b.range_base?.[0] ?? 0) || a.id.localeCompare(b.id);
}

/** Inside a group (§3.2): flagged before unflagged, then risk high to low
 *  when present, then file order. */
export function rowOrder(a: review.Node, b: review.Node) {
  const fa = (a.flags ?? []).length > 0 ? 0 : 1;
  const fb = (b.flags ?? []).length > 0 ? 0 : 1;
  if (fa !== fb) return fa - fb;
  const ra = a.risk ? RISK_RANK[a.risk] ?? 3 : 3;
  const rb = b.risk ? RISK_RANK[b.risk] ?? 3 : 3;
  return ra - rb || fileOrder(a, b);
}

/** The worklist (§3.2): Must visit (the undeclared), then one group per
 *  package by how many changed symbols it holds, then Declared, not
 *  changed (mismatches with no node), then Tests changed, collapsed. The
 *  affected nodes are not rows. Empty groups are not drawn. */
export function worklist(m: review.RevMap, marks?: review.Marks | null): Group[] {
  const { by, changed: since } = marksOf(marks);
  const pkgs = pkgOf(m);
  const row = (n: review.Node, qualified: boolean): Row => ({
    id: n.id, node: n, name: shortName(n, qualified), change: n.change,
    flags: (n.flags ?? []).map(flagWords), mark: by.get(n.id) ?? "",
    changedSince: !by.has(n.id) && since.has(n.id), counted: !isTest(n),
  });
  const defs = (m.nodes ?? []).filter(changed);
  const must = defs.filter((n) => !isTest(n) && (n.flags ?? []).includes("undeclared")).sort(rowOrder);
  const inPkg = new Map<string, review.Node[]>();
  for (const n of defs) {
    if (isTest(n) || must.includes(n)) continue;
    inPkg.set(n.parent, [...(inPkg.get(n.parent) ?? []), n]);
  }
  const groups: Group[] = [];
  if (must.length) groups.push({ key: "must", kind: "must", title: "Must visit", rows: must.map((n) => row(n, true)), collapsed: false });
  const pkgGroups = [...inPkg.entries()]
    .map(([id, ns]) => ({ id, ns: ns.sort(rowOrder), title: pkgTitle(pkgs.get(id), id) }))
    .sort((a, b) => b.ns.length - a.ns.length || a.title.localeCompare(b.title));
  for (const g of pkgGroups) groups.push({ key: `pkg:${g.id}`, kind: "package", title: g.title, rows: g.ns.map((n) => row(n, false)), collapsed: false });
  const declared = (m.mismatches ?? []).filter((x) => x.type === "declared_not_changed" && !x.node);
  if (declared.length) {
    groups.push({
      key: "declared", kind: "declared", title: "Declared, not changed", collapsed: false,
      rows: declared.map((x, i) => ({ id: `declared:${i}:${x.file ?? ""}:${x.symbol ?? ""}`, node: null, name: [x.file, x.symbol].filter(Boolean).join(":"), change: "", flags: [], mark: "", changedSince: false, counted: false })),
    });
  }
  const tests = defs.filter(isTest).sort(rowOrder);
  if (tests.length) groups.push({ key: "tests", kind: "tests", title: "Tests changed", rows: tests.map((n) => row(n, true)), collapsed: true });
  return groups;
}

/** The symbols Next to review walks, in the list's order: every counted row. */
export const walkOf = (groups: Group[]) => groups.flatMap((g) => g.rows.filter((r) => r.counted && r.node).map((r) => r));

/** `Next to review` (§3.1): the next unmarked symbol after `from` in the
 *  list's order, wrapping to the top; dir -1 is Shift+N, the one before.
 *  From no symbol, N is the first unmarked and Shift+N the last. null when
 *  every symbol is marked. */
export function nextToReview(groups: Group[], from: string, dir: 1 | -1 = 1): string | null {
  const walk = walkOf(groups);
  const open = walk.filter((r) => !r.mark);
  if (open.length === 0) return null;
  const i = walk.findIndex((r) => r.id === from);
  if (i < 0) return (dir === 1 ? open[0] : open[open.length - 1]).id;
  for (let k = 1; k <= walk.length; k++) {
    const r = walk[(i + dir * k + walk.length * k) % walk.length];
    if (!r.mark && r.id !== from) return r.id;
  }
  return null;
}

export type Coverage = { reviewed: number; of: number; mustLeft: number; risk: { reviewed: number; of: number } | null };

/** Coverage (§3.1): changed non-test symbols with any mark; must-visit left
 *  is the undeclared ones with none; the high-risk count only when a node
 *  carries risk. */
export function coverage(m: review.RevMap, marks?: review.Marks | null): Coverage {
  const { by } = marksOf(marks);
  const counted = (m.nodes ?? []).filter((n) => changed(n) && !isTest(n));
  const marked = (n: review.Node) => by.has(n.id);
  const anyRisk = (m.nodes ?? []).some((n) => !!n.risk);
  const high = counted.filter((n) => n.risk === "high");
  return {
    reviewed: counted.filter(marked).length,
    of: counted.length,
    mustLeft: counted.filter((n) => (n.flags ?? []).includes("undeclared") && !marked(n)).length,
    risk: anyRisk ? { reviewed: high.filter(marked).length, of: high.length } : null,
  };
}

/** `Reviewed 3 of 8 · high risk 2 of 2 · 1 must-visit left`. */
export function coverageLine(c: Coverage): string {
  const parts = [`Reviewed ${c.reviewed} of ${c.of}`];
  if (c.risk) parts.push(`high risk ${c.risk.reviewed} of ${c.risk.of}`);
  if (c.mustLeft > 0) parts.push(`${c.mustLeft} must-visit left`);
  return parts.join(" · ");
}

/** All reviewed (§4): Next to review is gone. */
export const allReviewed = (c: Coverage) => c.of > 0 && c.reviewed >= c.of;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The header's first line (§3.1): `c8e1773 ← 4d2a91b · 8 symbols changed, 9 tests`. */
export function countsLine(m: review.RevMap): string {
  const s = m.stats ?? { changed: 0, changed_tests: 0 };
  return `${short(m.head)} ← ${short(m.base)} · ${plural(s.changed, "symbol", "symbols")} changed, ${plural(s.changed_tests, "test", "tests")}`;
}

const sentence = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

/** Partial map, one line per reason (§3.1, §4 partial): a map that was not
 *  reconciled says why, so it never reads as one with no undeclared
 *  change; then each of the map's problems. */
export function partialLines(m: review.RevMap): string[] {
  const out: string[] = [];
  if (!m.reconciled) out.push(`Not checked against the card's declared changes: ${sentence(m.reconciliation || "no reason given")}`);
  for (const p of m.problems ?? []) if (p.trim()) out.push(sentence(p));
  return out;
}

/** No changed symbol (§4): a docs-only change. */
export const nothingToReview = (m: review.RevMap) => !(m.nodes ?? []).some(changed) && !(m.mismatches ?? []).some((x) => x.type === "declared_not_changed" && !x.node);

/** The file list under "Nothing to review": what the map names. */
export const filesOf = (m: review.RevMap) => [...new Set((m.nodes ?? []).map((n) => n.file).filter(Boolean))].sort();

const MARK_WORD: Record<MarkState, string> = { "": "", reviewed: "reviewed", question: "question", blocked: "blocked" };

/** A row's name (§5): `runLaunches, modified, no direct test, reviewed`. */
export function rowName(r: Row): string {
  if (!r.node) return [r.name, "declared, not changed"].join(", ");
  return [r.name, r.change, ...r.flags, r.changedSince ? WORDS.changedSince : MARK_WORD[r.mark]].filter(Boolean).join(", ");
}

/** A group head's name (§5): `internal/service, 3 symbols, 1 reviewed`. */
export function groupName(g: Group): string {
  const n = g.rows.length;
  const parts = [g.title, g.kind === "declared" ? plural(n, "line", "lines") : plural(n, "symbol", "symbols")];
  if (g.kind !== "declared") parts.push(`${g.rows.filter((r) => r.mark).length} reviewed`);
  return parts.join(", ");
}

/** The screen's state (§4), from the status and the make. A map shown
 *  (map, moved) wins: a make over it is drawn in the header, on Make it
 *  again. With no map, the list area is none, making or failed. */
export type ScreenState = "loading" | "none" | "making" | "failed" | "map" | "moved" | "missing";

export function screenState(status: service.ReviewStatus | null, make: service.ReviewMake | null): ScreenState {
  if (!status) return "loading";
  if (status.state === "missing") return "missing";
  if (status.state === "map" || status.state === "moved") return status.state;
  const mk = make ?? status.make ?? null;
  if (mk?.state === "making") return "making";
  return mk?.state === "failed" ? "failed" : "none";
}

/** The card back's Review section (§2, Amendment 1): a local card whose
 *  change resolves. Another machine's card is `!local`; whether the
 *  initiative sleeps is not asked, since marks live in the data dir. */
export const reviewable = (local: boolean, status: Pick<service.ReviewStatus, "state"> | null | undefined) => local && !!status && status.state !== "missing";

/** §3.4: the list is 300 px from 1440 up, else 280; the facts sit beside
 *  the diff from 1440, under it below. */
export const LIST_WIDE = 1440;
export const listWidth = (window: number) => (window >= LIST_WIDE ? 300 : 280);
export const factsBeside = (window: number) => window >= LIST_WIDE;

/** Whether a key press is typed into a field, where N and Esc are the field's. */
export function inTextField(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") return !/^(button|checkbox|radio|submit|reset|range|color|file|image)$/i.test((el as HTMLInputElement).type || "text");
  return (el as HTMLElement).isContentEditable === true;
}
