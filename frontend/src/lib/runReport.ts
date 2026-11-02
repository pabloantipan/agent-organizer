// Overview's `While you were away` (docs/specs/leftovers-57.md FR-7 to
// FR-13, 0169; run-report §3 with Amendments 1 and 2; progress-and-waves
// option B). Everything drawn comes from `factory report --json` as
// App.Report returns it: this module only orders it and puts it in words.
// It computes no count, percent, span or track of its own (AR15).

import type { model, service } from "../../wailsjs/go/models";
import { oneLine, underRoot, unreadFiles } from "./unread";

export type Report = service.FactoryReport;
export type Window = service.ReportWindow;

const HOUR = 3600 * 1000;
/** The recent rule's two spans (0167 Q2): 24 h past the window's end once
 *  seen on this machine, 7 days at most whatever happens. */
export const RECENT_SEEN_MS = 24 * HOUR;
export const RECENT_MAX_MS = 7 * 24 * HOUR;

export type RunPlace = "head" | "fold";

/** The recent rule (FR-12, 0167 Q2), the one place it is written; Home's
 *  run signal (lf57-home-signal) reads it too. A live run heads Overview
 *  whatever its age. A finished one heads it until it has been seen on
 *  this machine and 24 h have passed since the window ended, or 7 days
 *  have passed; then it folds to the end as `Last run · <date>`. Times in
 *  ms; `seenAt` null when the window has never been shown here. */
export function runPlace(o: { live: boolean; until: number; seenAt: number | null; now: number }): RunPlace {
  if (o.live) return "head";
  const age = o.now - o.until;
  if (age >= RECENT_MAX_MS) return "fold";
  if (o.seenAt !== null && age >= RECENT_SEEN_MS) return "fold";
  return "head";
}

// ---------- seen times, a per-viewer convenience in browser storage ----------

const store = (): Storage | undefined => {
  try { return globalThis.localStorage; } catch { return undefined; }
};
const SEEN_KEY = (initiative: string, until: number) => `runreport.seen.${initiative}.${until}`;
const PRESET_KEY = (initiative: string) => `runreport.preset.${initiative}`;

/** When the window ending at `until` (epoch s) was first shown here, in ms. */
export function seenAtOf(initiative: string, until: number): number | null {
  try {
    const v = store()?.getItem(SEEN_KEY(initiative, until));
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  } catch { return null; }
}

/** Marks the window seen now, once; later calls keep the first time. */
export function markSeen(initiative: string, until: number, now = Date.now()): void {
  try {
    if (seenAtOf(initiative, until) === null) store()?.setItem(SEEN_KEY(initiative, until), String(now));
  } catch { /* per-viewer convenience */ }
}

export function rememberedPreset(initiative: string): string | null {
  try { return store()?.getItem(PRESET_KEY(initiative)) ?? null; } catch { return null; }
}
export function rememberPreset(initiative: string, key: string): void {
  try { store()?.setItem(PRESET_KEY(initiative), key); } catch { /* per-viewer convenience */ }
}

// ---------- words for times ----------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const p2 = (n: number) => String(n).padStart(2, "0");
const at = (t: number) => new Date(t * 1000);

/** `00:52`, local clock, from epoch seconds. */
export const clock = (t: number) => { const d = at(t); return `${p2(d.getHours())}:${p2(d.getMinutes())}`; };
/** `26 Oct`, local date, from epoch seconds. */
export const day = (t: number) => { const d = at(t); return `${d.getDate()} ${MONTHS[d.getMonth()]}`; };
const sameDay = (a: number, b: number) => at(a).toDateString() === at(b).toDateString();

/** A window as the picker names it: `26 Oct 23:40 – 07:10`, the end's date
 *  added only when it falls on another day than the start's next one. */
export function windowWords(since: number, until: number): string {
  const end = sameDay(since, until) || sameDay(since + 86400, until) ? clock(until) : `${day(until)} ${clock(until)}`;
  return `${day(since)} ${clock(since)} – ${end}`;
}

/** `1 h 58 min`, `30 min`, `2 h`. */
export function spanWords(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}
/** The same, spelled out for an accessible name: `1 hour 58 minutes`. */
export function spanSpoken(minutes: number): string {
  const h = Math.floor(minutes / 60), m = minutes % 60;
  const hw = `${h} ${h === 1 ? "hour" : "hours"}`, mw = `${m} ${m === 1 ? "minute" : "minutes"}`;
  if (h === 0) return mw;
  return m === 0 ? hw : `${hw} ${mw}`;
}

export const cardsWord = (n: number) => `${n} ${n === 1 ? "card" : "cards"}`;

// ---------- the window control (FR-3, A1, A2) ----------

export type PresetKind = "current" | "autonomous" | "last24" | "custom";
export type Preset = { key: string; kind: PresetKind; label: string; since: number; until: number };

export const LAST_24 = "last24";
export const CUSTOM = "custom";

/** The picker's presets, in order: `Running now` for a `current` window,
 *  each window that moved something (newest first, as the command lists
 *  them), then `Last 24 hours`. `Custom…` is the select's last option and
 *  not a preset. `now` in epoch s. */
export function presetsOf(windows: Window[] | null | undefined, now: number): Preset[] {
  const out: Preset[] = [];
  for (const w of windows ?? []) {
    if (w.kind === "current") out.push({ key: "current", kind: "current", label: "Running now", since: w.since, until: now });
  }
  for (const w of windows ?? []) {
    if (w.kind !== "current" && w.moved) out.push({ key: `w:${w.since}`, kind: "autonomous", label: windowWords(w.since, w.until), since: w.since, until: w.until });
  }
  out.push({ key: LAST_24, kind: "last24", label: "Last 24 hours", since: now - 86400, until: now });
  return out;
}

/** The latest run: the window the recent rule and Home read, `null` when
 *  there has been none in the 14 days (the section is then absent). */
export function latestRun(presets: Preset[]): Preset | null {
  return presets.find((p) => p.kind === "current" || p.kind === "autonomous") ?? null;
}

/** The preset shown on arrival: the remembered one while it is still
 *  offered, else the latest run. */
export function arrivalPreset(presets: Preset[], remembered: string | null): Preset | null {
  return presets.find((p) => p.key === remembered) ?? latestRun(presets);
}

/** What App.Report is given for a window: `@<epoch>` both ends (FR-3). */
export const argsOf = (since: number, until: number): [string, string] => [`@${since}`, `@${until}`];

/** A datetime-local value (`2026-10-20T09:00`) as epoch seconds, local time;
 *  null when empty or unreadable. */
export function localInput(v: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v.trim());
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  return isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
}
/** Epoch seconds as a datetime-local value. */
export function toLocalInput(t: number): string {
  const d = at(t);
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`;
}
export const FROM_BEFORE_TO = "From must come before To.";

/** Custom's From and To, applied on change: the window, or the line under
 *  the fields when To is not after From (the chart keeps the last good one). */
export function customWindow(from: string, to: string): { since: number; until: number } | { error: string } | null {
  const s = localInput(from), u = localInput(to);
  if (s === null || u === null) return null;
  if (u <= s) return { error: FROM_BEFORE_TO };
  return { since: s, until: u };
}

// ---------- the caption and the rows (FR-7, FR-8) ----------

/** The caption: the denominator and the window, always drawn (AR3, A1). */
export function captionOf(r: Report): string {
  const w = r.window;
  const n = r.progress?.denominator?.count ?? 0;
  if (!w) return r.why ?? "";
  const span = sameDay(w.since, w.until)
    ? `between ${clock(w.since)} and ${clock(w.until)}, ${day(w.since)}`
    : `between ${day(w.since)} ${clock(w.since)} and ${day(w.until)} ${clock(w.until)}`;
  const planned = /planned/i.test(r.progress?.denominator?.kind ?? "") ? ` Share is of the ${n} planned.` : n > 0 ? ` Share is of those ${n}.` : "";
  return `${n === 0 ? "No card" : cardsWord(n)} passed review ${span}.${planned}`;
}

export const NO_CARD_PASSED = "No card passed review in this run.";

export type ModeRow = { kind: "mode"; t: number; words: string };
export type LineRow = {
  kind: "line"; t: number; line: service.ProgressLine;
  waves: string[]; wave: service.WaveLine | null; tokens: service.LineTokens | null;
};
export type DeadRow = { kind: "dead"; t: number; dead: service.DeadSpan; now: boolean };
export type Row = ModeRow | LineRow | DeadRow;

/** The words of the first and last rows: `autonomous mode on/off` for a run
 *  of the factory's, `window start/end` for Last 24 hours and Custom (A1,
 *  odyssey FR-8). A picked window comes back as kind `given`, so the preset
 *  says which it was. A live run ends on `now <t>`. */
export function modeWords(kind: PresetKind, live: boolean, until: number): [string, string] {
  const run = kind === "current" || kind === "autonomous";
  const start = run ? "autonomous mode on" : "window start";
  const end = live ? `now ${clock(until)}` : run ? "autonomous mode off" : "window end";
  return [start, end];
}

/** One row per `progress.lines` item and per dead span, between the two
 *  mode rows, in time order. A dead span reaching the window's end is
 *  `stopped now` only while the run is live (FR-7). */
export function rowsOf(r: Report, kind: PresetKind, live: boolean, lineTokens: service.LineTokens[] | null | undefined): Row[] {
  const w = r.window;
  if (!w) return [];
  const [start, end] = modeWords(kind, live, w.until);
  const waveLines = r.waves?.lines ?? [];
  const body: Row[] = [];
  for (const line of r.progress?.lines ?? []) {
    const wave = waveLines.find((x) => x.t === line.t) ?? null;
    const tokens = (lineTokens ?? []).find((x) => x.t === line.t) ?? null;
    body.push({ kind: "line", t: line.t, line, waves: wave?.waves ?? [], wave, tokens });
  }
  for (const dead of r.progress?.dead ?? []) {
    body.push({ kind: "dead", t: dead.start, dead, now: live && dead.end >= w.until });
  }
  body.sort((a, b) => a.t - b.t);
  return [{ kind: "mode", t: w.since, words: start }, ...body, { kind: "mode", t: w.until, words: end }];
}

/** A row's time: the clock, with the weekday only when the window spans
 *  two days and this row's day is not the previous row's (§3). */
export function rowTime(rows: Row[], i: number, spans: boolean): string {
  const t = rows[i].t;
  if (spans && i > 0 && !sameDay(rows[i - 1].t, t)) return `${DAYS[at(t).getDay()]} ${clock(t)}`;
  return clock(t);
}
export const spansDays = (r: Report) => !!r.window && !sameDay(r.window.since, r.window.until);

/** The wave column (option B): the wave keys, `–` for a line no wave
 *  lists, `·` for mode and dead rows. */
export function waveCell(row: Row): string {
  if (row.kind !== "line") return "·";
  return row.waves.length ? row.waves.join(" ") : "–";
}

/** `execution 1, no cause given 1`: failures by cause, as the report orders them. */
export const causeWords = (by: Record<string, number> | null | undefined) =>
  Object.entries(by ?? {}).map(([c, n]) => `${c} ${n}`).join(", ");

/** `1.2k`, `52k`, `1.6M`: tokens, never money (0020). */
export function tokenWords(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return String(n);
}

export const NO_TOKENS = "no tokens recorded";

/** Whether the usage ledger has a run for a line (FR-4, AR25): the service
 *  writes an entry for every line, `sessions: 0` when it found none, which
 *  is unknown, never zero tokens. */
export const hasTokens = (row: LineRow) => !!row.tokens && (row.tokens.sessions ?? 0) > 0;

/** The disclosure's summary of a line's cost (FR-8, PW2): rounds, failures
 *  by cause, build time, tokens. `null` parts are left out, never made up. */
export function costWords(row: LineRow): string {
  const w = row.wave;
  const parts: string[] = [];
  if (!w || w.waves.length === 0) parts.push("no wave lists these cards");
  if (w) {
    parts.push(`${w.round_count} ${w.round_count === 1 ? "round" : "rounds"}`);
    parts.push(w.failed > 0 ? `${w.failed} failed: ${causeWords(w.failed_by_cause)}` : "none failed");
    parts.push(`${w.build_minutes} min building`);
  }
  parts.push(hasTokens(row) ? `${tokenWords(row.tokens!.tokens)} tokens` : NO_TOKENS);
  return parts.join(" · ");
}

/** The rounds of a line's cards, from the waves that list them, in written order. */
export function roundsOf(r: Report, row: LineRow): (service.ReportRound & { wave: string })[] {
  const cards = new Set(row.line.cards);
  const out: (service.ReportRound & { wave: string })[] = [];
  for (const wv of r.waves?.waves ?? []) {
    for (const rd of wv.rounds ?? []) if (cards.has(rd.card)) out.push({ ...rd, wave: wv.key });
  }
  return out;
}

/** One round in words: `a review fail · a-rev · 00:41–00:45 · execution`. */
export function roundWords(rd: service.ReportRound): string {
  const parts = [`${rd.card || "no card"} ${rd.kind}${rd.result && rd.result !== "n/a" ? ` ${rd.result}` : ""}`];
  if (rd.reviewer) parts.push(rd.reviewer);
  parts.push(rd.end ? `${clock(rd.start)}–${clock(rd.end)}` : `${clock(rd.start)}, still open`);
  if (rd.result === "fail") parts.push(rd.cause || "no cause given");
  if (rd.reason) parts.push(rd.reason);
  return parts.join(" · ");
}

/** A footer line (FR-8, PW3): `sup2/1 · sup2 · 2 cards (b, e) · 4 rounds,
 *  1 failed (no cause given 1) · 29 min building · not merged`. */
export function waveFooterWords(w: service.RunWave): string {
  const parts = [w.key];
  if (w.supervisor) parts.push(w.supervisor);
  parts.push(`${cardsWord(w.cards?.length ?? 0)} (${(w.cards ?? []).join(", ")})`);
  parts.push(`${w.round_count} ${w.round_count === 1 ? "round" : "rounds"}, ${w.failed > 0 ? `${w.failed} failed (${causeWords(w.failed_by_cause)})` : "none failed"}`);
  parts.push(`${w.build_minutes} min building`);
  if (w.merged == null) parts.push("not merged");
  return parts.join(" · ");
}

/** The footer line split for drawing (leftovers-67 FR-8, AR27): the wave
 *  (its key, first) and the rest of `waveFooterWords` after it, so the wave
 *  takes the link colour when it presses and the muted one when not. */
export function waveFooterParts(w: service.RunWave): { wave: string; rest: string } {
  const words = waveFooterWords(w);
  return { wave: w.key, rest: words.slice(w.key.length) };
}

/** What a footer with no press says on its line, after the words (AR27). */
export const NO_RUN_RECORD = " · no run record";

/** A row's accessible name in words (FR-13, AR11). */
export function rowName(row: Row, time: string): string {
  if (row.kind === "mode") return `${time}, ${row.words}`;
  if (row.kind === "dead") {
    const d = row.dead;
    if (row.now) return `${clock(d.start)}, ${d.cause}, stopped now`;
    return `${clock(d.start)} to ${clock(d.end)}, ${d.cause}, ${spanSpoken(d.minutes)}`;
  }
  const l = row.line;
  const n = l.cards.length;
  const wave = row.waves.length ? `wave ${row.waves.join(" and ")}` : "no wave";
  return `${time}, ${cardsWord(n)} passed review: ${l.cards.join(", ")}, ${l.pct} percent, ${wave}`;
}

// ---------- states (FR-12) ----------

export const notDrawn = (reason: string) => `Report not drawn: ${reason}`;
export const remoteLine = (machine: string) => `Run reports are drawn on ${machine}.`;
export const COPIED = "Copied the report as text.";
export const COPY_REFUSED = "The clipboard refused the report.";

/** A wails rejection as the FR-2 words: a string, or an Error's message. */
export const reasonOf = (e: unknown) => (e instanceof Error ? e.message : String(e ?? "")).trim() || "factory report failed";

/** Copy as text (FR-11, AR9): the report's own text for the window shown,
 *  byte for byte, then the polite region's words. */
export async function copyReport(text: () => Promise<string>, write: (s: string) => Promise<void>, say: (m: string) => void): Promise<boolean> {
  try {
    await write(await text());
    say(COPIED);
    return true;
  } catch {
    say(COPY_REFUSED);
    return false;
  }
}

// ---------- rulings (FR-10) ----------

/** `while away` for a ruling taken in autonomous mode (`away` is its old name). */
export const whileAway = (r: service.Ruling) => r.mode === "autonomous" || r.mode === "away";

export function rulingName(r: service.Ruling): string {
  const parts = [`${r.id} ${r.title}`.trim()];
  if (r.ruled_by) parts.push(`ruled by ${r.ruled_by}`);
  parts.push(`${day(r.ruled_at)} ${clock(r.ruled_at)}`);
  if (whileAway(r)) parts.push("while away");
  if (r.note) parts.push(r.note);
  return parts.join(", ");
}

// ---------- tracks (FR-9, Amendment 2) ----------

export const NO_TRACKS = "No tracks to draw: no roadmap stages, and no card names a track.";
export const LOCAL_CAPTION = "Local = cards passed review / cards planned for the track (done, open, and still to cut).";

export type TrackRow = { track: service.Track; letter: string; stage: number | null; current: boolean };

/** The tracks to draw and the ones folded: a done track with no move in the
 *  window folds into `N tracks done · Show`; open ones keep the command's
 *  order with the no-stage track (`id` "") last. Letters follow the
 *  command's order so a folded track keeps its letter. */
export function tracksOf(r: Report): { open: TrackRow[]; done: TrackRow[] } {
  const all = r.tracks?.tracks ?? [];
  const moved = new Set((r.progress?.moves ?? []).map((m) => m.slug));
  let stage = 0;
  let currentSeen = false;
  const rows: TrackRow[] = all.map((t, i) => {
    const s = t.roadmap ? ++stage : null;
    const current = !!t.roadmap && !t.done && !currentSeen;
    if (current) currentSeen = true;
    return { track: t, letter: String.fromCharCode(65 + (i % 26)), stage: s, current };
  });
  const folds = (x: TrackRow) => !!x.track.done && !(x.track.done_cards ?? []).some((c) => moved.has(c));
  const open = rows.filter((x) => !folds(x));
  const unstaged = open.filter((x) => x.track.id === "");
  return { open: [...open.filter((x) => x.track.id !== ""), ...unstaged], done: rows.filter(folds) };
}

export const trackTitle = (t: service.Track) => (t.id === "" ? "No stage" : t.title || t.id);

/** An env cell: `67%`, `–` when nothing is planned, `?` when not computed. */
export function envCell(v: unknown): string {
  if (typeof v === "number") return `${v}%`;
  if (v === null || v === undefined || v === "") return "–";
  return String(v);
}

/** `0002 (pablo)`: what it waits on, the owner in parentheses as Copy as
 *  text writes it, so `·` separates waits only (FR-1, AR22). */
export const waitWords = (w: service.Wait) => (w.who ? `${w.what} (${w.who})` : w.what);
export const WAIT_SEP = " · ";
export const waitsWords = (ws: service.Wait[]) => ws.map(waitWords).join(WAIT_SEP);

/** How many waits fit on one line of `avail` px (FR-1): each wait's width,
 *  the separator's before every one after the first, and, when some are
 *  left out, room for the `+N` after the last shown. At least one is shown. */
export function waitsThatFit(widths: number[], sep: number, plus: number, avail: number): number {
  const n = widths.length;
  let used = 0;
  for (let i = 0; i < n; i++) {
    used += (i > 0 ? sep : 0) + widths[i];
    if (used > avail) return Math.max(1, fitWithPlus(widths, sep, plus, avail, i));
  }
  return n;
}
function fitWithPlus(widths: number[], sep: number, plus: number, avail: number, upTo: number): number {
  for (let k = upTo; k >= 1; k--) {
    let used = plus + sep;
    for (let i = 0; i < k; i++) used += (i > 0 ? sep : 0) + widths[i];
    if (used <= avail) return k;
  }
  return 1;
}

/** The `+N` of the waits left out, and its name and hover: the rest in words. */
export function moreWaits(ws: service.Wait[], shown: number): { text: string; name: string } | null {
  const rest = ws.slice(shown);
  if (rest.length === 0) return null;
  return { text: `+${rest.length}`, name: `and ${waitsWords(rest)}` };
}

/** A track row's accessible name (FR-13, AR11). */
export function trackName(x: TrackRow, prev: TrackRow | null, envs: string[]): string {
  const t = x.track;
  const parts = [`${x.letter} ${trackTitle(t)}`];
  if (x.stage !== null) parts.push(`stage ${x.stage}${x.current ? ", now" : ""}`);
  if (prev) parts.push(`after ${prev.letter}`);
  for (const e of envs) {
    const v = t.env?.[e];
    parts.push(`${e} ${typeof v === "number" ? `${v} percent` : envCell(v) === "–" ? "none planned" : envCell(v)}`);
  }
  parts.push(t.planned > 0 ? `${t.passed} of ${t.planned} passed` : "no card names it");
  if ((t.left ?? []).length) parts.push(`left ${t.left.join(", ")}`);
  if ((t.waits ?? []).length) parts.push(`waits on ${t.waits.map(waitWords).join(", ")}`);
  if (t.done) parts.push(`done ${t.done}`);
  return parts.join(", ");
}

/** `Board as of d277111 · 08:00`. */
export const boardAsOf = (tr: service.Tracks) => (tr.rev ? `Board as of ${tr.rev}${tr.rev_time ? ` · ${clock(tr.rev_time)}` : ""}` : "");

// A wave footer's target (leftovers-57 FR-15 to FR-17; progress-and-waves
// Amendment 1, PW4 amended and PW7).

/** Where a wave's footer goes: a finished wave's run record into the spec
 *  reader (`path` relative to the root, as ReadSpec allows it), a run
 *  record the scan could not read to Needs me's unread row, and a running
 *  wave (or a finished one whose record the scan did not read) to Work. An
 *  initiative that is not active has no Needs me rows, so its unread record
 *  opens in the reader with the scan's reason as `unread` (Amendment 6). */
export type WaveTarget = { kind: "record"; path: string; unread?: string } | { kind: "unread"; path: string } | { kind: "work" } | { kind: "none" };

/** What the scan knows of the initiative: its root, the waves it read (each
 *  with its run record's file name, under runs/) and its problems; and
 *  whether it is active, which is when Needs me has rows for it
 *  (`inactiveIds` in lib/queue.ts; absent is active). */
export type Strip = { n: number; supervisor?: string };

/** Whether Work draws this wave's strip: the same number (`openWave` lands
 *  on `wave <n>`), and the same supervisor when both name one, since two
 *  supervisors' waves can share a number in one report. */
export const drawsStrip = (w: Pick<service.RunWave, "wave" | "supervisor">, strips: Strip[] | undefined) =>
  (strips ?? []).some((s) => s.n === Number(w.wave) && (!s.supervisor || !w.supervisor || s.supervisor === w.supervisor));

export type ScanRuns = {
  root: string; waves: Pick<model.Wave, "record">[] | null | undefined; problems: model.Problem[] | null | undefined; active?: boolean;
  /** The waves Work draws a strip for, by number and supervisor
   *  (`stripsOf` in RunReport.tsx, over Work's own `running`); absent is none. */
  strips?: Strip[];
};

/** The scan's runs directory (internal/scan/runs.go `runsDir`): the one
 *  place a wave's `record` file name is read from. */
export const RUNS_DIR = "runs";

/** The report's record path (the path the factory read) relative to the
 *  root; a path written absolute under the root loses the root. */
export function recordRel(record: string, root: string): string {
  return underRoot((record ?? "").trim(), root).replace(/^\.\//, "");
}

/** A wave's target (FR-7; progress-and-waves Amendment 2, PW4 amended
 *  again; leftovers-64 Amendment 1): Work only when Work draws that wave's
 *  strip; else its run record, keyed on the report's `record` matched to the
 *  files the scan read (an unread file is Needs me's row, or the reader with
 *  the reason for an inactive initiative), finished or stopped alike; and a
 *  wave with neither is text with no press (`none`), never a dead link. */
export function waveTarget(w: Pick<service.RunWave, "record" | "merged" | "wave" | "supervisor">, scan: ScanRuns): WaveTarget {
  if (drawsStrip(w, scan.strips)) return { kind: "work" };
  const rel = recordRel(w.record, scan.root);
  if (!rel) return { kind: "none" };
  const bad = unreadFiles(scan.problems).find((f) => underRoot(f.path, scan.root) === rel);
  if (bad) return scan.active === false ? { kind: "record", path: rel, unread: bad.reasons.map(oneLine).join("; ") } : { kind: "unread", path: rel };
  if ((scan.waves ?? []).some((x) => x.record && `${RUNS_DIR}/${x.record}` === rel)) return { kind: "record", path: rel };
  return { kind: "none" };
}

/** The wave as its link names it: its supervisor (`sup95`), or its key when
 *  the supervisor is missing or runs more than one wave in the report. */
export function waveLabel(w: Pick<service.RunWave, "key" | "supervisor">, all: Pick<service.RunWave, "supervisor">[]): string {
  const sup = w.supervisor ?? "";
  if (!sup || all.filter((x) => x.supervisor === sup).length > 1) return w.key;
  return sup;
}

/** The footer link's accessible name and hover (FR-16, PW7); a wave with
 *  no press says why by its key (`sup2/1: no run record`). */
export function waveLinkName(label: string, t: WaveTarget, key = label): string {
  if (t.kind === "none") return `${key}: no run record`;
  if (t.kind === "record") return `open ${label}'s run record`;
  if (t.kind === "unread") return `show ${label}'s run record in Needs me, Deltagos can't read it`;
  return `show ${label} on Work`;
}
