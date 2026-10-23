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
  makingShort: "Making the map…",
  flags: "Flags",
  tests: "Tests",
  noTests: "none name it directly",
  calledBy: "Called by",
  calls: "Calls",
  builderSays: "The builder says",
  reviewed: "Reviewed",
  question: "Question",
  blocked: "Blocked",
  note: "Note",
  reviewedNext: "Reviewed, next",
  questionNext: "Save question, next",
  blockNext: "Save block, next",
  save: "Save",
  reviewedLast: "Reviewed",
  questionLast: "Save question",
  blockLast: "Save block",
  saving: "Saving…",
  asking: "Asking…",
  openThread: "Open the thread",
  openInEditor: "Open in editor",
  opening: "Opening…",
  backToReview: "← Review",
  unchanged: "unchanged",
  noneFound: "none found",
} as const;

/** Who a Question or Blocked asks (review-map v3 FR-25, the binding
 *  ReviewAddressee): a seat and why, or seat "" and why nobody. */
export type Addressee = { seat: string; why: string };

/** The muted line under the mark (FR-28; review-view Amendment 3): with
 *  someone to ask, what the ask does and that it wakes them; with nobody,
 *  why and that the mark stays here; on Reviewed or none, no line. */
export function askLine(to: Addressee | null, s: MarkState, again = false): string {
  if (!to || !needsNote(s)) return "";
  if (to.seat && again) return `Saves the mark and asks ${to.seat} again in this review's thread. Wakes ${to.seat}.`;
  return to.seat
    ? `Saves the mark and asks ${to.seat} (${to.why}) in this review's thread. Wakes ${to.seat}.`
    : `No one to ask here: ${to.why}. Kept in Deltagos.`;
}

/** Where a mark stands with its ask (leftovers-41 FR-4, review-view
 *  Amendment 6 A2): not asked, `""`; asked and its note as it was asked,
 *  `asked` (the panel says only who was asked, no promise to ask); asked
 *  and the note edited since, `again` (a new ask is possible). */
export type AskStage = "" | "asked" | "again";
export const askStage = (asked: boolean, note: string, askedNote: string): AskStage =>
  !asked ? "" : note.trim() === askedNote.trim() ? "asked" : "again";

/** What the mark's controls read for the chosen mark and note (FR-28,
 *  FR-38; leftovers-41 FR-4): the primary, whether it shows (an ask
 *  already made with this note is not offered again, and a saved mark
 *  shown as saved offers no save of it again, leftovers-47 FR-3), and the
 *  muted line (none once asked, the `again` line once the note is
 *  edited). */
export function markControls(o: { state: MarkState; note: string; to: Addressee | null; last: boolean; asked: boolean; askedNote: string; saved?: { state: MarkState; note: string } }) {
  const stage = askStage(o.asked, o.note, o.askedNote);
  const primary = primaryOf(o.state, o.note, { seat: o.to?.seat ?? "", last: o.last, again: stage === "again" });
  const nothing = asSaved(o.state, o.note, o.saved) && !primary.ask;
  return {
    stage,
    primary,
    showPrimary: !(stage === "asked" && primary.ask) && !nothing,
    // The line says what the primary does; with none drawn it goes too.
    line: stage === "asked" || nothing ? "" : askLine(o.to, o.state, stage === "again"),
  };
}

/** A saved mark shown as it was saved (leftovers-47 FR-3, review-view
 *  Amendment 11 UW2): its primary would save the same mark again, a press
 *  that does nothing, so it is not drawn; N in the header is the way on.
 *  An unmarked symbol is never as saved. A primary that asks still posts
 *  (`Ask <seat> again` after a Save of an edited note, leftovers-44 FR-1),
 *  so markControls keeps it. */
export const asSaved = (s: MarkState, note: string, saved?: { state: MarkState; note: string }) =>
  !!saved && saved.state !== "" && s === saved.state && note.trim() === saved.note.trim();

/** After an ask (FR-29): the panel's line and the live region's words. */
export const askedLine = (seat: string) => `Asked ${seat}`;

/** A post that failed (FR-29): the mark is saved, the ask is not. The
 *  cause in words, matched on the error text (leftovers-41 FR-1, review-view
 *  Amendment 5 U3): no identity, discuss not running, the thread closed;
 *  anything else is its first line with the home path as `~`. */
export function askFailedLine(seat: string, error: string): string {
  const e = firstLine(error);
  if (/tokens\.json|no discuss identity/.test(e)) return `Saved here; couldn't ask ${seat}: Deltagos has no discuss identity for this cell. organizer doctor says why.`;
  if (e.includes("discuss.sock")) return `Saved here; couldn't ask ${seat}: discuss isn't running. organizer doctor says why.`;
  if (/409|closed/.test(e)) return "Saved here; the review's thread is closed. Try again opens a new one.";
  return `Saved here; couldn't ask ${seat}: ${e.replace(/\/Users\/[^/\s]+/g, "~")}`;
}

/** The first line of an error, without the binding's `Error: `. */
export const firstLine = (e: string) => e.replace(/^Error:\s*/, "").split("\n")[0].trim();

/** What the review's live region says after the marks change (FR-29,
 *  FR-38; §4 all reviewed): `Asked <seat>` once for an ask that posted,
 *  the coverage once when the last symbol is marked, both when one press
 *  does both. An ask that failed says its failure line alone, even on the
 *  last symbol: the coverage would read as success (FR-29, Amendment 4).
 *  "" says nothing. */
export function saidAfter(o: { asked: string; failed?: string; wasDone: boolean | null; done: boolean; cov: Coverage }): string {
  if (o.failed) return o.failed;
  const parts = [o.asked ? askedLine(o.asked) : "", o.wasDone === false && o.done ? coverageLine(o.cov) : ""].filter(Boolean);
  return parts.join(". ");
}

/** §4 making: `Making the map · 2 s`, a counter, no spinner. */
export const makingLabel = (seconds: number) => `Making the map · ${Math.max(0, Math.floor(seconds))} s`;

/** FR-23 (A2, no flash): the progress line and Stop show only once a make
 *  has run 1 s; before it only the button reads `Making the map…`. */
export const PROGRESS_AFTER_MS = 1000;

/** Where a make's 1 s and its counter count from, in this page's clock
 *  (FR-23). Go's `started` is RFC3339 cut to the second, so it reads up
 *  to 999 ms early: a press at .950 s would show the line 50 ms later.
 *  The origin is the press, taken here, when this page pressed; for a make
 *  first seen here (a reload, another window), the latest instant it can
 *  have started: `started` + 1 s, or seenAt less its whole elapsed seconds,
 *  whichever is earlier, never after seenAt. */
export function makeOrigin(make: Pick<service.ReviewMake, "started" | "elapsed">, seenAt: number, pressedAt?: number): number {
  const t = Date.parse(make.started);
  const bounds = [pressedAt ?? seenAt, seenAt - (make.elapsed ?? 0) * 1000];
  if (!Number.isNaN(t)) bounds.push(t + 1000);
  return Math.min(...bounds);
}

/** Milliseconds until a running make's progress line shows; 0 when it
 *  shows now (a make reopened after its first second). */
export function progressDelay(origin: number, now: number = Date.now()): number {
  return Math.max(0, PROGRESS_AFTER_MS - (now - origin));
}

/** Calls show() once a make has run 1 s from its origin (FR-23); the
 *  returned cancel, run when the make ends, keeps a make under 1 s from
 *  ever showing it. show only changes what is drawn: it never moves focus. */
export function afterASecond(origin: number, show: () => void, now: number = Date.now()): () => void {
  const wait = progressDelay(origin, now);
  if (wait === 0) {
    show();
    return () => undefined;
  }
  const t = setTimeout(show, wait);
  return () => clearTimeout(t);
}

/** The counter's seconds from the same origin; once the line shows it
 *  has run 1 s, so it never reads `0 s`. */
export const secondsSince = (origin: number, now: number = Date.now()) => Math.max(1, Math.floor((now - origin) / 1000));

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
export type FlagLook = "amber" | "dashed" | "muted";
export const flagLook = (f: string): FlagLook => (f === "undeclared" || f === "outside_footprint" ? "amber" : f === "declared_not_changed" ? "dashed" : "muted");

/** The marks as the row draws them (§3.2): none, ✓, ?, ✕. */
export const MARK_GLYPH: Record<MarkState, string> = { "": "", reviewed: "✓", question: "?", blocked: "✕" };

const RISK_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

/** A changed definition: a symbol that is not an affected neighbour. */
const changed = (n: review.Node) => n.level === "symbol" && n.change !== "affected";
const isTest = (n: review.Node) => n.kind === "test";
const pkgOf = (m: review.RevMap) => new Map((m.nodes ?? []).filter((n) => n.level === "package").map((n) => [n.id, n]));

/** A TS symbol's file as qualifier parts (review-view Amendment 1, A1;
 *  review-map v2 FR-22): its folders, then its stem, the stem dropped when
 *  it is `index` so the folder names the module (`web/lib/index.ts` →
 *  `web`, `lib`). */
function tsParts(file: string): string[] {
  const parts = file.split("/").filter(Boolean);
  const stem = (parts.pop() ?? "").replace(/\.[^.]+$/, "");
  return stem && stem !== "index" ? [...parts, stem] : parts;
}

/** A symbol's short name: what follows its package (`go:x/svc.Greet` →
 *  `Greet`, `ts:web/src/format.ts#formatName` → `formatName`). In Must
 *  visit, where no package heads it, it carries the package's last part
 *  (`shared.Upload`, §3's sketch); a TS one carries its file's stem, its
 *  folder's name for an `index` file (FR-22). depth 2 is the qualifier
 *  with its parent folder too (`lib/format.formatName`), for two rows of
 *  one group that would read the same. */
export function shortName(n: review.Node, qualified = false, depth: 1 | 2 = 1): string {
  const id = n.id.replace(/^[a-z]+:/, "");
  const hash = id.lastIndexOf("#");
  if (hash >= 0) {
    const name = id.slice(hash + 1);
    if (!qualified) return name;
    const q = tsParts(id.slice(0, hash)).slice(-depth).join("/");
    return q ? `${q}.${name}` : name;
  }
  const pkg = n.parent.replace(/^[a-z]+:/, "");
  const name = pkg && id.startsWith(pkg + ".") ? id.slice(pkg.length + 1) : id.split("/").pop() ?? id;
  if (!qualified) return name;
  const last = pkg.split("/").filter(Boolean).slice(-depth).join("/");
  return last ? `${last}.${name}` : name;
}

/** The qualified names of one group's nodes (FR-22): two that would read
 *  the same both carry their parent folder. */
function qualifiedNames(ns: review.Node[]): string[] {
  const first = ns.map((n) => shortName(n, true));
  const seen = new Map<string, number>();
  for (const q of first) seen.set(q, (seen.get(q) ?? 0) + 1);
  return ns.map((n, i) => ((seen.get(first[i]) ?? 0) > 1 ? shortName(n, true, 2) : first[i]));
}

/** A package group's title: the package's directory as the map writes it. */
const pkgTitle = (pkg: review.Node | undefined, id: string) => pkg?.file || id.replace(/^[a-z]+:/, "");

export type Row = {
  id: string;
  /** The changed node; null for a declared, not changed row. */
  node: review.Node | null;
  name: string;
  /** The row's accessible description (FR-22): the symbol's full path. */
  path: string;
  change: string;
  flags: string[];
  mark: MarkState;
  /** FR-29: the mark was asked of someone (its `asked`). */
  asked: boolean;
  /** §4 new map, same symbol: the previous head's mark did not carry. */
  changedSince: boolean;
  /** Counted by coverage and walked by Next to review. */
  counted: boolean;
};

export type GroupKind = "must" | "package" | "declared" | "tests";
export type Group = { key: string; kind: GroupKind; title: string; rows: Row[]; collapsed: boolean };

/** The marks of a head, by symbol, and the symbols whose marks did not
 *  carry to it. */
export function marksOf(marks: review.Marks | null | undefined): { by: Map<string, MarkState>; changed: Set<string>; asked: Set<string> } {
  const by = new Map<string, MarkState>();
  const asked = new Set<string>();
  for (const m of marks?.marks ?? []) {
    if (m.state) by.set(m.symbol, m.state as MarkState);
    // `asked` marks a question or a block; a mark asked and since changed
    // to Reviewed keeps its ask, not the word (leftovers-44 FR-1).
    if (needsNote(m.state as MarkState) && m.asked) asked.add(m.symbol);
  }
  const changedSet = new Set((marks?.changed ?? []).map((m) => m.symbol).filter((s) => !by.has(s)));
  return { by, changed: changedSet, asked };
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
  const { by, changed: since, asked } = marksOf(marks);
  const pkgs = pkgOf(m);
  const row = (n: review.Node, name: string): Row => ({
    id: n.id, node: n, name, path: n.file, change: n.change,
    flags: (n.flags ?? []).map(flagWords), mark: by.get(n.id) ?? "", asked: asked.has(n.id),
    changedSince: !by.has(n.id) && since.has(n.id), counted: !isTest(n),
  });
  const defs = (m.nodes ?? []).filter(changed);
  const must = defs.filter((n) => !isTest(n) && (n.flags ?? []).includes("undeclared")).sort(rowOrder);
  const inPkg = new Map<string, review.Node[]>();
  for (const n of defs) {
    if (isTest(n) || must.includes(n)) continue;
    inPkg.set(n.parent, [...(inPkg.get(n.parent) ?? []), n]);
  }
  const rowsOf = (ns: review.Node[], qualified: boolean) => {
    const names = qualified ? qualifiedNames(ns) : ns.map((n) => shortName(n));
    return ns.map((n, i) => row(n, names[i]));
  };
  const groups: Group[] = [];
  if (must.length) groups.push({ key: "must", kind: "must", title: "Must visit", rows: rowsOf(must, true), collapsed: false });
  const pkgGroups = [...inPkg.entries()]
    .map(([id, ns]) => ({ id, ns: ns.sort(rowOrder), title: pkgTitle(pkgs.get(id), id) }))
    .sort((a, b) => b.ns.length - a.ns.length || a.title.localeCompare(b.title));
  for (const g of pkgGroups) groups.push({ key: `pkg:${g.id}`, kind: "package", title: g.title, rows: rowsOf(g.ns, false), collapsed: false });
  const declared = (m.mismatches ?? []).filter((x) => x.type === "declared_not_changed" && !x.node);
  if (declared.length) {
    groups.push({
      key: "declared", kind: "declared", title: "Declared, not changed", collapsed: false,
      rows: declared.map((x, i) => ({ id: `declared:${i}:${x.file ?? ""}:${x.symbol ?? ""}`, node: null, name: [x.file, x.symbol].filter(Boolean).join(":"), path: x.file ?? "", change: "", flags: [], mark: "", asked: false, changedSince: false, counted: false })),
    });
  }
  const tests = defs.filter(isTest).sort(rowOrder);
  if (tests.length) groups.push({ key: "tests", kind: "tests", title: "Tests changed", rows: rowsOf(tests, true), collapsed: true });
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

/** A row's name (§5): `runLaunches, modified, no direct test, reviewed`;
 *  an asked mark adds `asked` (FR-29: `question, asked`). */
export function rowName(r: Row): string {
  if (!r.node) return [r.name, "declared, not changed"].join(", ");
  const mark = r.changedSince ? WORDS.changedSince : MARK_WORD[r.mark];
  return [r.name, r.change, ...r.flags, mark, mark && r.asked && !r.changedSince ? "asked" : ""].filter(Boolean).join(", ");
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

/* ---- the symbol's panel (§3.3, review-map v2 FR-19) ---- */

/** One line of a symbol's scoped diff: `+` added, `−` removed, " " context;
 *  head line numbers (§3.3), none on a removed line. */
export type DiffLine = { sign: "+" | "−" | " "; text: string; line: number | null };

/** The text of a range at one sha, as ReviewFile gives it (rv-data):
 *  `first` is the 1-based number of `lines[0]`. */
export type RangeText = Pick<review.Text, "first" | "lines">;

/** A symbol's diff: its base range against its head range, each read with 3
 *  lines of context, line by line (longest common subsequence). An added
 *  symbol (no base) is all `+`, a deleted one (no head) all `−`. No syntax
 *  colour: the sign carries it (§6). */
export function symbolDiff(base: RangeText | null, head: RangeText | null): DiffLine[] {
  const a = base?.lines ?? [];
  const b = head?.lines ?? [];
  const hf = head?.first ?? 1;
  const n = a.length, m = b.length;
  // lcs[i][j]: the longest common run of a[i..] and b[j..].
  const lcs = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) { out.push({ sign: " ", text: b[j], line: hf + j }); i++; j++; }
    // Removed before added, as a reader expects the old line first.
    else if (i < n && (j >= m || lcs[i + 1][j] >= lcs[i][j + 1])) { out.push({ sign: "−", text: a[i], line: null }); i++; }
    else { out.push({ sign: "+", text: b[j], line: hf + j }); j++; }
  }
  return out;
}

/** The shas a node's file is read at: the map's, or its repo's in a map of
 *  several repos (the node's file starts `<repo>/`). */
export function shasOf(m: review.RevMap, n: review.Node): { base: string; head: string } {
  const pair = (m.repos ?? []).find((r) => r.name && n.file.startsWith(`${r.name}/`));
  return pair ? { base: pair.base, head: pair.head } : { base: m.base, head: m.head };
}

const symbolNode = (m: review.RevMap, id: string) => (m.nodes ?? []).find((n) => n.id === id && n.level === "symbol") ?? null;
const uniqNodes = (ns: (review.Node | null)[]) => [...new Map(ns.filter((n): n is review.Node => !!n).map((n) => [n.id, n])).values()];

/** Called by: the symbols that use this one (an edge `from` uses `to`). */
export const calledBy = (m: review.RevMap, id: string) => uniqNodes((m.edges ?? []).filter((e) => e.to === id && e.from !== id).map((e) => symbolNode(m, e.from)));
/** Calls: the symbols this one uses. */
export const callsOf = (m: review.RevMap, id: string) => uniqNodes((m.edges ?? []).filter((e) => e.from === id && e.to !== id).map((e) => symbolNode(m, e.to)));

/** An affected node is an unchanged neighbour, shown read-only (§3.3). */
export const isAffected = (n: review.Node) => n.change === "affected";

/** The list an affected symbol was opened from (FR-40). */
export type Via = "calledBy" | "calls";

/** Which way an affected symbol points (review-view Amendment 2, A1;
 *  FR-30, FR-40): opened from `Called by` it calls the changed one,
 *  `unchanged · calls runLaunches`; opened from `Calls` the changed one
 *  calls it, `unchanged · called by runLaunches`. The list it was opened
 *  from decides, never the edges: with mutual calls both are true. Only
 *  with no list known (none in the place) do the edges say. */
export function affectedLine(m: review.RevMap, affected: review.Node, changedNode: review.Node | null, via?: Via): string {
  if (!changedNode) return WORDS.unchanged;
  const name = shortName(changedNode, true);
  const calls = via ? via === "calledBy" : (m.edges ?? []).some((e) => e.from === affected.id && e.to === changedNode.id);
  return calls ? `${WORDS.unchanged} · calls ${name}` : `${WORDS.unchanged} · called by ${name}`;
}

/** `← back to runLaunches` (§3.3). */
export const backTo = (changedNode: review.Node) => `← back to ${shortName(changedNode, true)}`;

/** The tests that name a symbol (`evidence.tests`, `file::Name`), each with
 *  its node when the test itself changed in this map, so it opens as a
 *  changed symbol (§3.3); null otherwise. */
export function testsOf(m: review.RevMap, n: review.Node): { label: string; node: review.Node | null }[] {
  return (n.evidence?.tests ?? []).map((t) => {
    const [file, name] = t.split("::");
    const node = (m.nodes ?? []).find((x) => x.level === "symbol" && x.kind === "test" && x.change !== "affected" && x.file === file && !!name && (x.id.endsWith(`.${name}`) || x.id.endsWith(`#${name}`))) ?? null;
    return { label: name ? `${file} ${name}` : t, node };
  });
}

/** The mark of §3.3: Question and Blocked need a note; Save needs a mark. */
export const needsNote = (s: MarkState) => s === "question" || s === "blocked";
/** Save is live for a complete mark that differs from the saved one
 *  (FR-24: after the last `Reviewed, next`, Save writes nothing unless the
 *  reader changes the mark). */
export const canSave = (s: MarkState, note: string, saved: { state: MarkState; note: string } = { state: "", note: "" }) =>
  s !== "" && (!needsNote(s) || note.trim() !== "") && (s !== saved.state || note.trim() !== saved.note);

/** The primary follows the chosen radio and saves it (Amendment 2, A2;
 *  FR-31): none or Reviewed `Reviewed, next`, Question `Save question,
 *  next`, Blocked `Save block, next`; it never overrides a chosen mark.
 *  With someone to ask (FR-28, Amendment 3) Question and Blocked read `Ask
 *  <seat>, next` and ask. On the last symbol without a mark (FR-38,
 *  Amendment 4) there is no next: `Reviewed`, `Save question`, `Save
 *  block`, `Ask <seat>`. A mark already asked whose note was edited reads
 *  `Ask <seat> again` (leftovers-41 FR-4). Question and Blocked need a
 *  note first (`ready`). */
export function primaryOf(s: MarkState, note: string, o: { seat?: string; last?: boolean; again?: boolean } = {}): { label: string; mark: Exclude<MarkState, "">; ready: boolean; ask: boolean } {
  const mark = s === "" ? "reviewed" : s;
  const ask = needsNote(mark) && !!o.seat;
  const base = ask ? `Ask ${o.seat}${o.again ? " again" : ""}` : mark === "question" ? WORDS.questionLast : mark === "blocked" ? WORDS.blockLast : WORDS.reviewedLast;
  return { label: o.last ? base : `${base}, next`, mark, ready: !needsNote(mark) || note.trim() !== "", ask };
}

/** No next to move to (FR-38): no symbol other than this one is unmarked. */
export const lastToReview = (groups: Group[], id: string) => nextToReview(groups, id) === null;

/** What the form shows once a mark is saved: the mark as saved (FR-24), so
 *  `Reviewed, next` with nothing left reads Reviewed, not the old radio. */
export const afterSave = (s: MarkState, note: string) => ({ state: s, note: note.trim() });

/** A mark's saved note on this head, for the panel to start from. */
export function markOf(marks: review.Marks | null | undefined, id: string): { state: MarkState; note: string } {
  const m = (marks?.marks ?? []).find((x) => x.symbol === id && x.state);
  return { state: (m?.state ?? "") as MarkState, note: m?.note ?? "" };
}

/** A symbol's ask (leftovers-44 FR-1): whether its mark was asked, kept
 *  through every Save, and the note it was asked with; a mark asked before
 *  `asked_note` was kept, which carries it empty, reads its saved note as
 *  that (leftovers-46 FR-8). */
export function askOf(marks: review.Marks | null | undefined, id: string): { asked: boolean; askedNote: string } {
  const m = (marks?.marks ?? []).find((x) => x.symbol === id && x.state);
  return { asked: !!m?.asked, askedNote: m?.asked_note || m?.note || "" };
}

/** The thread `Open the thread` opens for a symbol (leftovers-42 FR-4):
 *  the mark's own `asked_thread`, else the review's `thread`. */
export function threadOf(marks: review.Marks | null | undefined, id: string): string {
  const m = (marks?.marks ?? []).find((x) => x.symbol === id && x.state);
  return m?.asked_thread || marks?.thread || "";
}

/** Where `Open in editor` opens a symbol (leftovers-42 FR-1, FR-3): the
 *  head start line and the checkout of the file's repo that has the shown
 *  map's head (`ReviewStatus.checkouts`). null when there is nothing to
 *  draw: the status not read yet, or read for another head, or no head
 *  line (a deleted symbol). dir "" is not checked out here. */
export type EditorAt = { file: string; line: number; sha: string; dir: string };
export function editorAt(status: service.ReviewStatus | null | undefined, head: string, n: review.Node, text?: RangeText | null): EditorAt | null {
  const range = n.range_head;
  if (!status || !range?.[0] || status.map_head !== head) return null;
  const line = definitionLine(text, range);
  const cos = status.checkouts ?? [];
  const co = cos.length === 1 && !cos[0].repo ? cos[0] : cos.find((c) => c.repo && n.file.startsWith(`${c.repo}/`));
  if (!co) return null;
  return { file: n.file, line, sha: co.head, dir: co.dir };
}

/** Where the title line points once a press was refused because the head
 *  left (leftovers-43 FR-1, leftovers-46 FR-7): the refused place, not here,
 *  while the status is read again and whenever the re-read has nothing to
 *  say for this head (read for another map_head); else what the re-read
 *  says. Never refused, it is `at`. */
export const editorShown = (at: EditorAt | null, left: EditorAt | null, rereading: boolean): EditorAt | null =>
  left && (rereading || !at) ? { ...left, dir: "" } : at;

/** The muted words when the head is checked out nowhere here (FR-3). */
export const notCheckedOut = (sha: string) => `Not checked out here at ${sha.slice(0, 7)}.`;

/** The line `Open in editor` opens (leftovers-43 FR-3, Amendment 7 U2):
 *  the first line of the head range after its leading comment block (`//`
 *  lines, slash-star blocks, `#` lines, and the blank lines between them);
 *  a decorator or attribute (`@x`, `#[x]`) is code. A range that is all
 *  comment, or whose text is not read yet, opens at its start. `text` is
 *  the head's ReviewFile read, context lines included. */
export function definitionLine(text: RangeText | null | undefined, range: number[]): number {
  const from = range[0], to = range[1] ?? from;
  if (!text) return from;
  let block = false;
  for (let l = from; l <= to; l++) {
    const raw = text.lines[l - text.first];
    if (raw === undefined) return from;
    let t = raw.trim();
    if (block) {
      const end = t.indexOf("*/");
      if (end < 0) continue;
      block = false;
      t = t.slice(end + 2).trim();
    }
    while (t.startsWith("/*")) {
      const end = t.indexOf("*/", 2);
      if (end < 0) { block = true; t = ""; break; }
      t = t.slice(end + 2).trim();
    }
    if (t === "" || t.startsWith("//") || (t.startsWith("#") && !/^#!?\[/.test(t))) continue;
    return l;
  }
  return from;
}

/** What a refused press of `Open in editor` means (FR-1, FR-2): the head
 *  is no longer checked out here (`moved`), or the editor or the service
 *  said why, as one line without the `Error:` prefix. */
export function editorRefusal(e: unknown): { moved: true } | { moved: false; line: string } {
  const m = firstLine(e instanceof Error ? e.message : String(e));
  if (/ is not checked out here$/.test(m)) return { moved: true };
  return { moved: false, line: m.replace(/^editor didn't open:\s*/, "") };
}

/** The line under `Open in editor` when the editor did not start (FR-2). */
export const editorFailed = (line: string) => `Editor didn't open: ${line}`;

/** Whether the mark form draws Save (leftovers-43 FR-4, Amendment 8 A1;
 *  leftovers-44 FR-2): only when it can save, a mark chosen and the mark
 *  or the note differing from what is saved. Drawn, it stays disabled
 *  while a Question or Blocked waits on its note (`canSave`). */
export const saveShown = (s: MarkState, note: string, saved: { state: MarkState; note: string }) =>
  s !== "" && (s !== saved.state || note.trim() !== saved.note);

/** An element id built from a node id or a path (leftovers-44 FR-4,
 *  leftovers-46 FR-6): only letters, digits, `-` and `_`, so an
 *  `aria-describedby` that names it names one element even when the path
 *  holds a space; every other character, `_` included, is `_`, its code
 *  point in hex and `_` again, so no two raw strings share an id. */
export const domId = (prefix: string, raw: string) =>
  `${prefix}-${raw.replace(/[^A-Za-z0-9-]/gu, (c) => `_${c.codePointAt(0)!.toString(16)}_`)}`;

/** Where focus goes when Save leaves after a press (FR-4): the asking
 *  primary when it is drawn, else the mark's radio group; never the body. */
export const focusAfterSave = (o: { showPrimary: boolean; ask: boolean }): "primary" | "radios" =>
  o.showPrimary && o.ask ? "primary" : "radios";
