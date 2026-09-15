export function ageDays(iso: string | undefined, now = new Date()): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((now.getTime() - t) / 86400000);
}

export function ageLabel(iso: string | undefined): string {
  const d = ageDays(iso);
  if (d === null) return "?";
  if (d <= 0) return "today";
  if (d === 1) return "1d";
  if (d < 30) return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

export function isStale(iso: string | undefined, days = 7): boolean {
  const d = ageDays(iso);
  return d !== null && d >= days;
}

export function shortHome(p: string): string {
  return p.replace(/^\/Users\/[^/]+|^\/home\/[^/]+/, "~");
}

export function since(date: unknown): string {
  if (!date) return "never";
  const t = typeof date === "string" ? Date.parse(date) : (date as Date).getTime?.();
  if (!t || Number.isNaN(t) || t < 0) return "never";
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function move<T>(list: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
  const out = list.slice();
  const [item] = out.splice(from, 1);
  out.splice(to, 0, item);
  return out;
}

export function uniq<T>(list: T[]): T[] {
  return Array.from(new Set(list));
}

/** The human's comments on a card as the opening context of a conversation. */
export function notesAsContext(notes: { by: string; at: unknown; text: string }[] | undefined, human: string): string {
  if (!notes || notes.length === 0) return "";
  const lines = notes.map((n) => {
    const d = typeof n.at === "string" ? n.at.slice(0, 10) : "";
    return `- ${d ? d + " " : ""}${n.by || human}: ${n.text}`;
  });
  return `Context from ${human}:\n${lines.join("\n")}\n\n`;
}
