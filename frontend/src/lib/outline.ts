import type { merge, model } from "../../wailsjs/go/models";
import { addLocalDays, hhmm, startOfDay, when, type When } from "./axis";
import { dateWords, parseISO } from "./dates";

/** Roadmap › Stages as an outline (docs/ux/specs/roadmap-as-a-plan.md,
 *  docs/specs/roadmap-as-a-plan.md FR-4): which rows each Detail step shows,
 *  how waves join stages, the Rounds row's segments and their merge below
 *  4 px, the diamonds' stagger, and every label in words. Pure: "now" and
 *  pixel scales come in as arguments. */

export type Step = 1 | 2 | 3 | 4;
export const STEPS: Step[] = [1, 2, 3, 4];

/** The Detail switch's words, whole and short (the narrow window's). */
export const STEP_WORDS: Record<Step, { long: string; short: string }> = {
  1: { long: "Current stage", short: "Current" },
  2: { long: "All stages", short: "All" },
  3: { long: "+ Waves", short: "+ Waves" },
  4: { long: "+ Rounds and cards", short: "+ Rounds" },
};

/** Where the switch's arrows take it: the radio group's wrap-around. */
export function stepAfter(step: Step, key: string): Step | null {
  const i = STEPS.indexOf(step);
  if (key === "ArrowRight" || key === "ArrowDown") return STEPS[(i + 1) % STEPS.length];
  if (key === "ArrowLeft" || key === "ArrowUp") return STEPS[(i + STEPS.length - 1) % STEPS.length];
  if (key === "Home") return 1;
  if (key === "End") return 4;
  return null;
}

/** A gate's key for finding its record: a number compares by value, so `4`,
 *  `04` and `0004` all name record 0004, as the scan's check does. */
export function gateKey(n: string): string {
  const t = n.trim();
  return /^\d+$/.test(t) ? String(Number(t)) : t;
}

// ---- stages ----------------------------------------------------------------

export type StageState = "done" | "current" | "planned";

/** A stage on the axis, as Stages has drawn it since FR-20: it starts at the
 *  previous stage's end, else its first gate's raising; it ends at `done`,
 *  else `target`; a current stage without either runs to today; a stage
 *  that is neither done nor dated takes an undated slot (0022). Day starts
 *  in ms; null is no date. */
export type StageGeo = { start: number | null; end: number | null; toToday: boolean; slot: number; state: StageState };

export function stageGeometry(stages: model.Stage[], decisions: model.Decision[] | undefined, today: number): StageGeo[] {
  const byGate = new Map((decisions ?? []).map((d) => [gateKey(d.number), d]));
  let slots = 0;
  let prevEnd: number | null = null;
  return stages.map((s) => {
    const raised = (s.gates ?? []).map((g) => byGate.get(gateKey(g))).map((d) => parseISO(d?.raised)?.getTime()).filter((t): t is number => t !== undefined);
    const end = parseISO(s.done)?.getTime() ?? parseISO(s.target)?.getTime() ?? null;
    const state: StageState = s.done ? "done" : s.current ? "current" : "planned";
    let start: number | null = prevEnd ?? (raised.length ? Math.min(...raised) : null);
    if (start !== null && end !== null && start > end) start = end;
    const toToday = end === null && state === "current" && start !== null && start <= today;
    const slot = end === null && state !== "done" ? slots++ : -1;
    prevEnd = end ?? (toToday ? today : null);
    return { start, end, toToday, slot, state };
  });
}

/** The stage's word in the label column: `done 28 Sep`, `now`, `planned ·
 *  two waves` (its appetite), `planned · target 5 Nov`. */
export function stageWord(s: model.Stage, state: StageState, now?: Date): string {
  if (state === "done") return `done ${dateWords(s.done, now)}`;
  if (state === "current") return "now";
  if (s.target) return `planned · target ${dateWords(s.target, now)}`;
  return s.appetite ? `planned · ${s.appetite}` : "planned";
}

/** Each stage id's first position: a duplicated id (a problem the scan
 *  reports) joins its waves, cards and records to the first stage that
 *  carries it, and the later one says so. */
export function firstIndexOf(stages: model.Stage[]): Map<string, number> {
  const m = new Map<string, number>();
  stages.forEach((s, i) => { if (s.id && !m.has(s.id)) m.set(s.id, i); });
  return m;
}

// ---- waves -----------------------------------------------------------------

export const waveKey = (w: model.Wave) => (w.dot ? `dot:${w.record}` : `wave:${w.record}#${w.wave}`);

/** Waves under each stage (O2): by the wave's stages, each once, under the
 *  first stage with that id; a wave none of whose stages is on the roadmap
 *  is outside any stage, and so is every dot. Oldest first, as the board
 *  carries them. */
export function wavesByStage(waves: model.Wave[], stages: model.Stage[]): { by: Map<number, model.Wave[]>; outside: model.Wave[] } {
  const first = firstIndexOf(stages);
  const by = new Map<number, model.Wave[]>();
  const outside: model.Wave[] = [];
  for (const w of waves) {
    const at = [...new Set((w.stages ?? []).map((id) => first.get(id)).filter((i): i is number => i !== undefined))];
    if (w.dot || at.length === 0) { outside.push(w); continue; }
    for (const i of at) by.set(i, [...(by.get(i) ?? []), w]);
  }
  return { by, outside };
}

/** `· also in The joins` (O2): the other roadmap stages a wave sits under. */
export function alsoIn(w: model.Wave, here: number, stages: model.Stage[]): string[] {
  const first = firstIndexOf(stages);
  const idx = [...new Set((w.stages ?? []).map((id) => first.get(id)).filter((i): i is number => i !== undefined && i !== here))];
  return idx.sort((a, b) => a - b).map((i) => stages[i].title || stages[i].id);
}

/** A wave's result word: `merged`, `in flight`; a dot is a run record with
 *  no waves block, `prose only`. The block has no stop time, so `stopped`
 *  is never said (Found, not asked). */
export function waveWord(w: model.Wave): string {
  if (w.dot) return "prose only";
  return w.merged ? "merged" : "in flight";
}

/** A wave's span on the axis: launch (else its first round) to merge, else
 *  its last round's end, else now while in flight. A dot is its day. Null
 *  when nothing is dated. */
export function waveSpan(w: model.Wave, now: number): { from: number; to: number; timed: boolean; open: boolean } | null {
  if (w.dot) {
    const d = parseISO(w.date)?.getTime();
    return d === undefined ? null : { from: d, to: addLocalDays(d, 1), timed: false, open: false };
  }
  const starts = [when(w.launched), ...(w.rounds ?? []).map((r) => when(r.start))].filter((x): x is When => !!x);
  if (starts.length === 0) return null;
  const from = when(w.launched)?.at ?? Math.min(...starts.map((s) => s.at));
  const timed = starts.some((s) => s.timed);
  const merged = when(w.merged);
  if (merged) return { from, to: Math.max(merged.at, from), timed, open: false };
  return { from, to: Math.max(now, from), timed, open: true };
}

/** The cards of a wave in the order they were launched: by each card's
 *  first round's start; a card with no round of its own comes after, in
 *  the block's order, as do ties. Slugs only; the caller joins them to the
 *  board's cards. */
export function cardsInLaunchOrder(w: model.Wave): string[] {
  const first = new Map<string, number>();
  for (const r of w.rounds ?? []) {
    const t = when(r.start)?.at;
    if (t === undefined) continue;
    if (!first.has(r.card) || t < (first.get(r.card) as number)) first.set(r.card, t);
  }
  return (w.cards ?? []).map((slug, i) => ({ slug, i, t: first.get(slug) ?? Infinity }))
    .sort((a, b) => (a.t === b.t ? a.i - b.i : a.t - b.t)).map((c) => c.slug);
}

// ---- rounds ----------------------------------------------------------------

export type Tone = "built" | "pass" | "fail" | "take";

export type Segment = {
  n: number;           // the round's number in its wave, from 1
  from: number;
  to: number;          // its end, or now while in flight
  open: boolean;       // in flight
  tone: Tone;
  word: string;        // inside when it fits, else in the hover
  title: string;       // the hover: number, times, result, reviewer, reason
};

/** The reason's first words, for `fail · gate row 2`: up to its first
 *  colon, semicolon, comma or full stop, at most four words. */
export function firstWords(reason: string | undefined, most = 4): string {
  const t = (reason ?? "").split("\n")[0].split(/[:;,.—]/)[0].trim();
  return t.split(/\s+/).filter(Boolean).slice(0, most).join(" ");
}

function toneOf(r: model.Round): Tone {
  if (r.result === "fail") return "fail";
  if (r.kind === "take") return "take";
  if (r.kind === "review" || r.kind === "ui-review") return "pass";
  return "built";
}

function wordOf(r: model.Round, open: boolean): string {
  if (open) return r.kind === "build" ? "building" : r.kind === "take" ? "in take" : "in review";
  const tone = toneOf(r);
  if (tone === "fail") { const w = firstWords(r.reason); return w ? `fail · ${w}` : "fail"; }
  return tone;
}

const KIND_WORD: Record<string, string> = { build: "build", review: "review", "ui-review": "UI review", take: "take" };

/** A wave's rounds as segments, in block order; a round without a start is
 *  not drawn (nothing is invented, 0022). */
export function roundSegments(w: model.Wave, now: number): Segment[] {
  const out: Segment[] = [];
  (w.rounds ?? []).forEach((r, i) => {
    const s = when(r.start);
    if (!s) return;
    const e = when(r.end);
    const open = !e;
    const to = e ? Math.max(e.at, s.at) : Math.max(now, s.at);
    const word = wordOf(r, open);
    const times = `${dateWords(new Date(s.at))} ${hhmm(s.at)}–${e ? hhmm(e.at) : "now"}`;
    const result = open ? "in flight" : r.result && r.result !== "n/a" ? r.result : "done";
    const reason = (r.reason ?? "").split("\n")[0].trim();
    const title = [`Round ${i + 1} · ${KIND_WORD[r.kind] ?? r.kind} · ${r.card}`, times, result, r.reviewer ? `by ${r.reviewer}` : "", reason].filter(Boolean).join(" · ");
    out.push({ n: i + 1, from: s.at, to, open, tone: open ? toneOf({ ...r, result: "" } as model.Round) : toneOf(r), word, title });
  });
  return out;
}

/** Narrower than this, a segment cannot be seen: the row merges (spec). */
export const MIN_SEGMENT = 4;

/** Whether the Rounds row draws one merged segment: some segment is under
 *  MIN_SEGMENT px at this scale (Fit and Days, since rounds are minutes). */
export function mergesAt(segs: Segment[], x: (ms: number) => number, min = MIN_SEGMENT): boolean {
  return segs.some((s) => x(s.to) - x(s.from) < min);
}

/** `Rounds · 3, 1 failed`, the label column's words for a wave's Rounds
 *  row; `rounds not recorded` when the wave has none. */
export function roundsHeading(segs: Segment[]): string {
  if (segs.length === 0) return "rounds not recorded";
  const k = segs.filter((s) => s.tone === "fail").length;
  return `Rounds · ${segs.length}${k ? `, ${k} failed` : ""}`;
}

/** The merged segment's words after it: `3 rounds · 1 fail`, the count
 *  and the fail part apart so the fail takes the magenta. */
export function mergedWords(segs: Segment[]): { count: string; fail: string } {
  const k = segs.filter((s) => s.tone === "fail").length;
  return { count: `${segs.length} round${segs.length === 1 ? "" : "s"}`, fail: k ? `${k} fail` : "" };
}

// ---- decisions -------------------------------------------------------------

/** The records drawn on a stage's row: those that gate it, then those that
 *  join it with `stage:`, each once, by number. A duplicated stage id's
 *  records sit on its first stage only. */
export function stageDecisions(stages: model.Stage[], index: number, decisions: model.Decision[] | undefined): model.Decision[] {
  const s = stages[index];
  const first = firstIndexOf(stages);
  if (first.get(s.id) !== index) return [];
  const byGate = new Map((decisions ?? []).map((d) => [gateKey(d.number), d]));
  const out = new Map<string, model.Decision>();
  for (const g of s.gates ?? []) { const d = byGate.get(gateKey(g)); if (d) out.set(d.number, d); }
  for (const d of decisions ?? []) if (d.stage && d.stage === s.id) out.set(d.number, d);
  return [...out.values()].sort((a, b) => a.number.localeCompare(b.number));
}

/** A decision record's name on its diamond, and its hover:
 *  `0071 Accept the time-zoom spec, ruled 3 Oct by pablo`, or
 *  `0002 …, raised 20 Sep, waiting`. */
export function decisionName(d: model.Decision, now?: Date): string {
  const head = `${d.number} ${d.title}`.trim();
  if (d.status === "ruled" && d.ruled) return `${head}, ruled ${dateWords(d.ruled, now)}${d.ruled_by ? ` by ${d.ruled_by}` : ""}`;
  if (d.status === "proposed") return `${head}, raised ${dateWords(d.raised, now)}, waiting`;
  return `${head}, ${d.status}${d.raised ? `, raised ${dateWords(d.raised, now)}` : ""}`;
}

export type Gem = { number: string; at: number; kind: "raised" | "ruled" | "waiting" };

/** A record's diamonds: hollow at raised (`waiting` while it waits), solid
 *  at ruled. Superseded and withdrawn records keep their raised diamond. */
export function gemsOf(d: model.Decision): Gem[] {
  const raised = parseISO(d.raised)?.getTime();
  const ruled = d.status === "ruled" ? parseISO(d.ruled)?.getTime() : undefined;
  const out: Gem[] = [];
  if (raised !== undefined) out.push({ number: d.number, at: raised, kind: d.status === "proposed" ? "waiting" : "raised" });
  if (ruled !== undefined) out.push({ number: d.number, at: ruled, kind: "ruled" });
  return out;
}

/** Same-day diamonds stagger 4 px; past three, a `+N` rides the third and
 *  the rest are not drawn (design system, Timeline). Per gem, in order. */
export const GEM_STAGGER = 4;
export function staggerGems(days: number[], most = 3): { dx: number; shown: boolean; more: number }[] {
  const count = new Map<number, number>();
  for (const d of days) count.set(startOfDay(d), (count.get(startOfDay(d)) ?? 0) + 1);
  const seen = new Map<number, number>();
  return days.map((d) => {
    const k = startOfDay(d);
    const i = seen.get(k) ?? 0;
    seen.set(k, i + 1);
    const n = count.get(k) as number;
    return { dx: Math.min(i, most - 1) * GEM_STAGGER, shown: i < most, more: i === most - 1 && n > most ? n - most : 0 };
  });
}

// ---- rows ------------------------------------------------------------------

export type OutlineRow =
  | { kind: "stage"; key: string; level: 0; index: number; open: boolean }
  | { kind: "outside"; key: string; level: 0; open: boolean; count: number }
  | { kind: "exit"; key: string; level: 1; index: number; k: number }
  | { kind: "wave"; key: string; level: 1; stage: number; wave: model.Wave; open: boolean }
  | { kind: "rounds"; key: string; level: 2; stage: number; wave: model.Wave }
  | { kind: "card"; key: string; level: 1 | 2; stage: number; slug: string }
  | { kind: "note"; key: string; level: 1 | 2; text: string };

export type OutlineInput = {
  stages: model.Stage[];
  waves: model.Wave[];
  cards: Pick<merge.BoardCard, "slug" | "stage">[];
};

export const OUTSIDE = -1;

/** The cards with no stage on the roadmap (none, or one it does not have). */
export function outsideCards(input: OutlineInput): string[] {
  const ids = new Set(input.stages.map((s) => s.id));
  return input.cards.filter((c) => !c.stage || !ids.has(c.stage)).map((c) => c.slug);
}

/** The rows the outline draws at a Detail step, with the chevrons the lead
 *  turned (`open`, by row key: true opens a row the step leaves shut, false
 *  shuts one it opens; the switch clears them):
 *  1 the current stage and its exit items; 2 every stage; 3 under each
 *  stage its waves; 4 under each wave its Rounds row and its cards, and a
 *  stage's cards in no wave after its waves. `Outside any stage` is last
 *  whenever a wave or a card has no stage on the roadmap. */
export function outlineRows(input: OutlineInput, step: Step, open: ReadonlyMap<string, boolean> = new Map()): OutlineRow[] {
  const { stages, waves } = input;
  const rows: OutlineRow[] = [];
  const first = firstIndexOf(stages);
  const { by, outside } = wavesByStage(waves, stages);
  const recorded = waves.some((w) => !w.dot);
  const inWave = new Set(waves.flatMap((w) => w.cards ?? []));
  const isOpen = (key: string, byStep: boolean) => open.get(key) ?? byStep;
  const current = stages.findIndex((s) => s.current);

  const waveRows = (stage: number, ws: model.Wave[]) => {
    for (const w of ws) {
      const key = `${stage}/${waveKey(w)}`;
      const wo = isOpen(key, step >= 4);
      rows.push({ kind: "wave", key, level: 1, stage, wave: w, open: wo });
      if (!wo) continue;
      rows.push({ kind: "rounds", key: `${key}/rounds`, level: 2, stage, wave: w });
      for (const slug of cardsInLaunchOrder(w)) rows.push({ kind: "card", key: `${key}/card:${slug}`, level: 2, stage, slug });
    }
  };

  const shown = step === 1 ? (current >= 0 ? [current] : []) : stages.map((_, i) => i);
  for (const i of shown) {
    const s = stages[i];
    const key = `stage:${i}`;
    const so = isOpen(key, step >= 3);
    rows.push({ kind: "stage", key, level: 0, index: i, open: so });
    if (step === 1 && i === current) {
      const exits = s.exit ?? [];
      if (exits.length === 0) rows.push({ kind: "note", key: `${key}/no-exit`, level: 1, text: "No exit items written" });
      exits.forEach((_, k) => rows.push({ kind: "exit", key: `${key}/exit:${k}`, level: 1, index: i, k }));
    }
    if (!so) continue;
    if (first.get(s.id) !== i) {
      rows.push({ kind: "note", key: `${key}/dup`, level: 1, text: `Shares the id ${s.id}: its work is under stage ${(first.get(s.id) as number) + 1}` });
      continue;
    }
    const ws = by.get(i) ?? [];
    if (ws.length === 0) rows.push({ kind: "note", key: `${key}/no-waves`, level: 1, text: recorded ? "No waves in this stage" : "No waves recorded yet" });
    waveRows(i, ws);
    if (step >= 4) {
      const loose = input.cards.filter((c) => c.stage === s.id && !inWave.has(c.slug));
      for (const c of loose) rows.push({ kind: "card", key: `${key}/card:${c.slug}`, level: 1, stage: i, slug: c.slug });
      const any = ws.some((w) => (w.cards ?? []).length > 0) || loose.length > 0;
      if (!any) rows.push({ kind: "note", key: `${key}/no-cards`, level: 1, text: "No cards" });
    }
  }
  if (step === 1 && current < 0 && stages.length > 0) rows.push({ kind: "note", key: "no-current", level: 1, text: "Every stage is done" });

  const looseOut = outsideCards(input).filter((slug) => !inWave.has(slug));
  const count = outsideCards(input).length;
  if (outside.length > 0 || count > 0) {
    const key = "outside";
    const oo = isOpen(key, step >= 3);
    rows.push({ kind: "outside", key, level: 0, open: oo, count });
    if (oo) {
      waveRows(OUTSIDE, outside);
      if (step >= 4) for (const slug of looseOut) rows.push({ kind: "card", key: `${key}/card:${slug}`, level: 1, stage: OUTSIDE, slug });
    }
  }
  return rows;
}

/** `Outside any stage · 23 cards`, the row's words when it is shut. */
export function outsideWords(count: number): string {
  return `Outside any stage · ${count} card${count === 1 ? "" : "s"}`;
}

/** Where ↑ and ↓ take the outline's focus: the row before or after,
 *  stopping at the ends. */
export function rowAfter(keys: string[], at: string, key: string): string | null {
  const i = keys.indexOf(at);
  if (i < 0) return keys[0] ?? null;
  if (key === "ArrowDown") return keys[Math.min(i + 1, keys.length - 1)];
  if (key === "ArrowUp") return keys[Math.max(i - 1, 0)];
  if (key === "Home") return keys[0];
  if (key === "End") return keys[keys.length - 1];
  return null;
}

/** The parent row of a key, for ← on a row that is already shut. */
export function parentKey(rows: OutlineRow[], at: string): string | null {
  const i = rows.findIndex((r) => r.key === at);
  if (i < 0) return null;
  const level = rows[i].level;
  for (let j = i - 1; j >= 0; j--) if (rows[j].level < level) return rows[j].key;
  return null;
}

