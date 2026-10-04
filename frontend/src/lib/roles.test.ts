import { describe, expect, it } from "vitest";
import type { model } from "../../wailsjs/go/models";
import { ageWords, elsewhereLine, leadBitacora, noSessionLine, otherHandOffLine, roleDoing, roleInitials, roleMail, roleRow, roleState, roleWhere, sessionStarted } from "./roles";

const NOW = new Date(2026, 9, 4);

const role = (p: Partial<model.Role>): model.Role => ({
  name: "Hephaistos", description: "", here: true, state: "never_seen", working: false,
  sessions: [], context: null, last_seen: null, last_seen_in: "", bitacoras: [], bitacora_expected: "",
  mail: [], mail_unknown: false, initiatives: [], ...p,
} as unknown as model.Role);

const session = (p: Partial<model.RoleSession>): model.RoleSession => ({
  name: "probe-hefesto", initiative: "", state: "running", working: false, context: null, created: "", uptime: "", pid: 1, ...p,
} as model.RoleSession);

const handOff = (p: Partial<model.RoleHandOff>): model.RoleHandOff => ({
  title: "HAND-OFF 2026-09-30, lodestar", date: "2026-09-30", host: "lodestar", first_line: "Forged Aglaea", body: "", stale: false, ...p,
} as model.RoleHandOff);

const bitacora = (p: Partial<model.RoleBitacora>): model.RoleBitacora => ({
  path: "/h/b.md", initiative: "", hand_off: null, others: [], log: [], ...p,
} as unknown as model.RoleBitacora);

const mail = (n: number) => Array.from({ length: n }, (_, i) => ({ thread_id: `t${i}`, subject: "[for aglaea] x", project: "p", initiative: "i", from: "", status: "open", age_seconds: 60 }) as model.RoleMail);

describe("roleState: the States table's row column", () => {
  it("live, one session: live · 42% context", () => {
    expect(roleState(role({ state: "live", context: 42.4, sessions: [session({ context: 42.4 })] }), NOW)).toEqual({ text: "live · 42% context", live: true, working: false });
  });
  it("live, several: N sessions · the highest context", () => {
    const r = role({ state: "live", context: 61, sessions: [session({ context: 30 }), session({ name: "probe-hefesto-2", context: 61 })] });
    expect(roleState(r, NOW).text).toBe("2 sessions · 61% context");
  });
  it("counts only sessions with a process", () => {
    const r = role({ state: "live", context: 42, sessions: [session({ context: 42 }), session({ name: "old", state: "exited" })] });
    expect(roleState(r, NOW).text).toBe("live · 42% context");
  });
  it("live with no context reported says live alone", () => {
    expect(roleState(role({ state: "live", sessions: [session({})] }), NOW).text).toBe("live");
  });
  it("working moves the dot", () => {
    expect(roleState(role({ state: "live", working: true, sessions: [session({ state: "working", working: true })] }), NOW).working).toBe(true);
  });
  it("not running, seen before: last seen as words", () => {
    expect(roleState(role({ state: "not_running", last_seen: "2026-10-02T14:03:05.5-03:00" as unknown as model.Role["last_seen"] }), NOW)).toEqual({ text: "not running · last seen 2 Oct", live: false, working: false });
  });
  it("never seen: not running", () => {
    expect(roleState(role({ state: "never_seen" }), NOW).text).toBe("not running");
    expect(roleState(role({ state: "not_running" }), NOW).text).toBe("not running");
  });
});

describe("roleDoing: doing now", () => {
  it("a HAND-OFF: its date as words and first line", () => {
    const d = roleDoing(role({ bitacoras: [bitacora({ hand_off: handOff({}) })] }), NOW);
    expect(d).toEqual({ date: "hand-off 30 Sep", text: "Forged Aglaea", stale: false, none: false });
  });
  it("no bitácora: no bitácora yet", () => {
    expect(roleDoing(role({}), NOW)).toEqual({ date: "", text: "no bitácora yet", stale: false, none: true });
  });
  it("a bitácora without a HAND-OFF: its last log line, dated", () => {
    const b = bitacora({ log: [{ date: "2026-09-28", text: "older" }, { date: "2026-10-03", text: "the last line" }] as model.RoleLogLine[] });
    expect(roleDoing(role({ bitacoras: [b] }), NOW)).toEqual({ date: "3 Oct", text: "the last line", stale: false, none: false });
  });
  it("a log line older than a week is stale", () => {
    const b = bitacora({ log: [{ date: "2026-09-21", text: "x" }] as model.RoleLogLine[] });
    expect(roleDoing(role({ bitacoras: [b] }), NOW).stale).toBe(true);
  });
  it("a HAND-OFF older than a week keeps the feed's stale flag", () => {
    const d = roleDoing(role({ bitacoras: [bitacora({ hand_off: handOff({ date: "2026-09-21", stale: true }) })] }), NOW);
    expect(d.date).toBe("hand-off 21 Sep");
    expect(d.stale).toBe(true);
  });
  it("with several bitácoras the newest wins", () => {
    const a = bitacora({ path: "/a", hand_off: handOff({ date: "2026-09-20", first_line: "old" }) });
    const b = bitacora({ path: "/b", log: [{ date: "2026-10-01", text: "new" }] as model.RoleLogLine[] });
    expect(leadBitacora(role({ bitacoras: [a, b] }))?.path).toBe("/b");
  });
  it("a date from another year carries its year", () => {
    expect(roleDoing(role({ bitacoras: [bitacora({ hand_off: handOff({ date: "2025-12-30" }) })] }), NOW).date).toBe("hand-off 30 Dec 2025");
  });
});

describe("roleMail", () => {
  it("one message waiting, N messages waiting, nothing when none", () => {
    expect(roleMail(role({ mail: mail(1) })).text).toBe("1 message waiting");
    expect(roleMail(role({ mail: mail(3) })).text).toBe("3 messages waiting");
    expect(roleMail(role({})).text).toBe("");
  });
  it("unknown is nothing in the column, never zero, titled mailbox not reachable", () => {
    expect(roleMail(role({ mail_unknown: true, mail: [] }))).toEqual({ text: "", count: 0, unknown: true, title: "mailbox not reachable" });
  });
});

describe("roleWhere", () => {
  it("text, the first three and +N", () => {
    expect(roleWhere(role({ initiatives: ["organizer", "camp", "hestia"] })).text).toBe("organizer, camp, hestia");
    const w = roleWhere(role({ initiatives: ["a", "b", "c", "d", "e"] }));
    expect(w).toEqual({ text: "a, b, c +2", all: "a, b, c, d, e" });
    expect(roleWhere(role({})).text).toBe("");
  });
});

describe("roleInitials: unique over the configured list", () => {
  it("H, A, Ar, D for the default list", () => {
    const m = roleInitials(["Hephaistos", "Aglaea", "Ariadna", "Daedalus", "Talos", "Hermione"]);
    expect([...m.values()]).toEqual(["H", "A", "Ar", "D", "T", "He"]);
  });
  it("grows a prefix until it is free", () => {
    expect([...roleInitials(["Ana", "Ann", "Anna"]).values()]).toEqual(["A", "An", "Ann"]);
  });
});

describe("roleRow: hover and accessible name hold every column", () => {
  it("names state, doing now, mail and where", () => {
    const r = role({ name: "Aglaea", state: "live", context: 42, sessions: [session({ context: 42 })], mail: mail(1), initiatives: ["init-a"], bitacoras: [bitacora({ hand_off: handOff({ first_line: "reviewing" }) })] });
    expect(roleRow(r, NOW).label).toBe("Aglaea; live · 42% context; doing now: hand-off 30 Sep · reviewing; 1 message waiting; in init-a");
  });
  it("says when the mailbox cannot be read", () => {
    expect(roleRow(role({ mail_unknown: true }), NOW).label).toContain("mailbox not reachable");
  });
});

describe("the drawer's words", () => {
  it("names the roles that do not run here in one line", () => {
    const rs = [role({}), role({ name: "Talos", here: false, description: "PLV infra, on odyssey" }), role({ name: "Hermione", here: false, description: "PLV infra, on odyssey" })];
    expect(elsewhereLine(rs)).toBe("Talos, Hermione · PLV infra, on odyssey");
    expect(elsewhereLine([role({})])).toBe("");
  });
  it("Sessions empty: last seen in, or that it starts outside Deltagos", () => {
    expect(noSessionLine(role({ last_seen: "2026-10-02T10:00:00Z" as unknown as model.Role["last_seen"], last_seen_in: "organizer" }), NOW)).toBe("Last seen 2 Oct in organizer");
    expect(noSessionLine(role({}), NOW)).toBe("No session yet. It starts outside Deltagos.");
  });
  it("another host's HAND-OFF folds as host · date", () => {
    expect(otherHandOffLine(handOff({ host: "odyssey", date: "2026-10-02" }), NOW)).toBe("odyssey · 2 Oct");
  });
  it("a session's start and a thread's age", () => {
    expect(sessionStarted(session({ uptime: "02:10:00" }))).toBe("up 02:10:00");
    expect(sessionStarted(session({ created: "3h ago" }))).toBe("session 3h ago");
    expect([ageWords(120), ageWords(7200), ageWords(200000)]).toEqual(["2m", "2h", "2d"]);
  });
});
