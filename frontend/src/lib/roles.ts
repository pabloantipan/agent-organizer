// The transversal roles as a row and a drawer say them
// (docs/ux/specs/transversal-roles.md, States and Words; T5). Everything here
// reads model.Role from the agents feed and nothing else; dates go through
// lib/dates, the noun "message" through lib/health. A role's mail is not the
// lead's queue (0034, T4): nothing here feeds queueOf or the Needs me badge.
import type { model } from "../../wailsjs/go/models";
import { dateWords, daysBetween, parseISO, today } from "./dates";
import { messages } from "./health";

type Role = model.Role;

/** A role's sessions that have an agent process: live (the feed's own rule). */
export const liveSessions = (r: Role) => (r.sessions ?? []).filter((s) => s.state === "working" || s.state === "running");

const pct = (v: number | null | undefined) => (v == null ? null : `${Math.round(v)}% context`);

/** The state column (States): `live · 42% context`, `2 sessions · 61%
 *  context` with the highest, `not running · last seen 2 Oct`, `not
 *  running`. `live` is whether the dot shows, `working` whether it moves. */
export function roleState(r: Role, now: Date = today()): { text: string; live: boolean; working: boolean } {
  if (r.state === "live") {
    const n = liveSessions(r).length;
    const ctx = pct(r.context);
    const head = n > 1 ? `${n} sessions` : "live";
    return { text: ctx ? `${head} · ${ctx}` : head, live: true, working: !!r.working };
  }
  if (r.state === "not_running" && r.last_seen) {
    return { text: `not running · last seen ${dateWords(String(r.last_seen), now)}`, live: false, working: false };
  }
  return { text: "not running", live: false, working: false };
}

/** The bitácora the row reads: of those found, the one whose HAND-OFF (else
 *  last log line) is newest; the first found on a tie. A role with one
 *  bitácora per initiative (Aglaea) is on what it wrote last. */
export function leadBitacora(r: Role): model.RoleBitacora | null {
  const all = r.bitacoras ?? [];
  let best: model.RoleBitacora | null = null;
  let bestDate = "";
  for (const b of all) {
    const d = b.hand_off?.date || lastLog(b)?.date || "";
    if (!best || d > bestDate) { best = b; bestDate = d; }
  }
  return best;
}

const lastLog = (b: model.RoleBitacora) => (b.log ?? [])[(b.log ?? []).length - 1];

/** Whether a YYYY-MM-DD is more than seven days before `now`. */
export function olderThanAWeek(date: string | undefined, now: Date = today()): boolean {
  const d = parseISO(date);
  return !!d && daysBetween(d, now) > 7;
}

/** The doing-now column (States): `hand-off 30 Sep · <first line>`, its last
 *  log line dated when the bitácora has no HAND-OFF, `no bitácora yet` when
 *  none was found. `stale` dims the date: a HAND-OFF older than a week (the
 *  feed's flag), or a log line as old. */
export function roleDoing(r: Role, now: Date = today()): { date: string; text: string; stale: boolean; none: boolean } {
  const b = leadBitacora(r);
  if (!b) return { date: "", text: "no bitácora yet", stale: false, none: true };
  const h = b.hand_off;
  if (h) {
    return { date: h.date ? `hand-off ${dateWords(h.date, now)}` : "hand-off", text: h.first_line || h.title, stale: !!h.stale, none: false };
  }
  const l = lastLog(b);
  if (l) return { date: dateWords(l.date, now), text: l.text, stale: olderThanAWeek(l.date, now), none: false };
  return { date: "", text: "no hand-off yet", stale: false, none: true };
}

/** One line of doing now, the way a hover or an accessible name reads it. */
export const doingLine = (d: { date: string; text: string }) => [d.date, d.text].filter(Boolean).join(" · ");

/** The mail column (States): `1 message waiting`, `N messages waiting`,
 *  nothing when none, nothing with `mailbox not reachable` as its title when
 *  the mailbox could not be read (never zero). */
export function roleMail(r: Role): { text: string; count: number; unknown: boolean; title: string } {
  if (r.mail_unknown) return { text: "", count: 0, unknown: true, title: "mailbox not reachable" };
  const n = (r.mail ?? []).length;
  return { text: n > 0 ? `${messages(n)} waiting` : "", count: n, unknown: false, title: n > 0 ? `${messages(n)} waiting` : "no mail waiting" };
}

/** The where column: the initiatives it touched as text, never chips, the
 *  first three and `+N`. `all` is the whole list for the hover. */
export function roleWhere(r: Role, shown = 3): { text: string; all: string } {
  const ids = r.initiatives ?? [];
  const all = ids.join(", ");
  if (ids.length <= shown) return { text: all, all };
  return { text: `${ids.slice(0, shown).join(", ")} +${ids.length - shown}`, all };
}

/** Initials for the strip, unique over the configured list in its order:
 *  each takes the shortest prefix of its name no earlier role holds, so
 *  Hephaistos, Aglaea, Ariadna, Daedalus read H, A, Ar, D. */
export function roleInitials(names: string[]): Map<string, string> {
  const out = new Map<string, string>();
  const taken = new Set<string>();
  for (const name of names) {
    const letters = Array.from(name);
    let n = 1;
    let pick = letters.slice(0, 1).join("");
    while (taken.has(pick.toLowerCase()) && n < letters.length) {
      n++;
      pick = letters.slice(0, n).join("");
    }
    pick = pick.charAt(0).toUpperCase() + pick.slice(1).toLowerCase();
    taken.add(pick.toLowerCase());
    out.set(name, pick);
  }
  return out;
}

/** What a Home row says, cell by cell, and the whole for its hover and its
 *  accessible name: what gives way at a narrow width stays there. */
export function roleRow(r: Role, now: Date = today()) {
  const state = roleState(r, now);
  const doing = roleDoing(r, now);
  const mail = roleMail(r);
  const where = roleWhere(r);
  const label = [
    r.name,
    state.working ? `${state.text}, working` : state.text,
    `doing now: ${doingLine(doing)}${doing.stale ? " (older than a week)" : ""}`,
    mail.unknown ? "mailbox not reachable" : mail.text || "no mail waiting",
    where.all ? `in ${where.all}` : "",
  ].filter(Boolean).join("; ");
  return { name: r.name, state, doing, mail, where, label };
}

/** The roles that do not run here, named once (Which roles): `Talos, Hermione
 *  · PLV infra, on odyssey`, one part per description in the configured
 *  order. Empty when every role runs here. */
export function elsewhereLine(roles: Role[]): string {
  const parts: { desc: string; names: string[] }[] = [];
  for (const r of roles) {
    if (r.here) continue;
    const p = parts.find((x) => x.desc === r.description);
    if (p) p.names.push(r.name);
    else parts.push({ desc: r.description, names: [r.name] });
  }
  return parts.map((p) => (p.desc ? `${p.names.join(", ")} · ${p.desc}` : p.names.join(", "))).join("; ");
}

/** A session line's state word (the drawer, Sessions): working, running,
 *  exited, as the feed has them. */
export const sessionWord = (s: model.RoleSession) => s.state || "exited";

/** When a session started, as the feed knows it: its process's uptime, else
 *  the zellij session's age. */
export const sessionStarted = (s: model.RoleSession) => (s.uptime ? `up ${s.uptime}` : s.created ? `session ${s.created}` : "");

/** The drawer's Sessions when it has none (States): `Last seen 2 Oct in
 *  organizer`, or that it starts outside Deltagos. */
export function noSessionLine(r: Role, now: Date = today()): string {
  if (r.last_seen) return `Last seen ${dateWords(String(r.last_seen), now)}${r.last_seen_in ? ` in ${r.last_seen_in}` : ""}`;
  return "No session yet. It starts outside Deltagos.";
}

/** A thread's age as Needs me says it: 5m, 3h, 2d. */
export function ageWords(seconds: number): string {
  const s = Math.max(0, seconds);
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

/** A folded HAND-OFF of another host: `odyssey · 2 Oct`. */
export const otherHandOffLine = (h: model.RoleHandOff, now: Date = today()) =>
  [h.host || h.title, h.date ? dateWords(h.date, now) : ""].filter(Boolean).join(" · ");
