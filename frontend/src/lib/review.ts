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
  save: "Save",
  v3: "Kept in Deltagos; asking the supervisor comes later.",
  unchanged: "unchanged",
} as const;

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
  const row = (n: review.Node, name: string): Row => ({
    id: n.id, node: n, name, path: n.file, change: n.change,
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
      rows: declared.map((x, i) => ({ id: `declared:${i}:${x.file ?? ""}:${x.symbol ?? ""}`, node: null, name: [x.file, x.symbol].filter(Boolean).join(":"), path: x.file ?? "", change: "", flags: [], mark: "", changedSince: false, counted: false })),
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

/** Why an affected symbol is in the map (§3.3): `unchanged · shown because
 *  it calls runLaunches`; when the changed one calls it instead, the same
 *  line the other way. */
export function affectedLine(m: review.RevMap, affected: review.Node, changedNode: review.Node | null): string {
  if (!changedNode) return WORDS.unchanged;
  const name = shortName(changedNode, true);
  const calls = (m.edges ?? []).some((e) => e.from === affected.id && e.to === changedNode.id);
  return calls ? `${WORDS.unchanged} · shown because it calls ${name}` : `${WORDS.unchanged} · shown because ${name} calls it`;
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

/** What the form shows once a mark is saved: the mark as saved (FR-24), so
 *  `Reviewed, next` with nothing left reads Reviewed, not the old radio. */
export const afterSave = (s: MarkState, note: string) => ({ state: s, note: note.trim() });

/** A mark's saved note on this head, for the panel to start from. */
export function markOf(marks: review.Marks | null | undefined, id: string): { state: MarkState; note: string } {
  const m = (marks?.marks ?? []).find((x) => x.symbol === id && x.state);
  return { state: (m?.state ?? "") as MarkState, note: m?.note ?? "" };
}
