// The spec reader's pure halves (docs/specs/diagrams.md FR-6 to FR-8;
// diagrams-in-app §3): what a spec reference names, the ids and Contents of
// a rendered body, and where a link inside it goes. The drawer is
// components/SpecReader.tsx.

/** A reference as a card's spec: field or a link writes it: the file,
 *  relative to the initiative root, and the section after `#`. The first
 *  word only, since a card's field carries prose after the path
 *  ("docs/specs/x.md (FR-1 to FR-3)"); the service reads it the same way
 *  (`specRel` in internal/service/spec.go). Null when it names no file
 *  inside the root. */
export function specRef(ref: string): { path: string; section: string } | null {
  const word = (ref ?? "").trim().split(/\s+/)[0]?.replace(/[,;:]+$/, "") ?? "";
  return pathRef(word);
}

/** A path as the scan lists it (a Specs entry; spaces are part of it), with
 *  an optional `#section`. */
export function pathRef(word: string): { path: string; section: string } | null {
  const hash = word.indexOf("#");
  const file = hash < 0 ? word : word.slice(0, hash);
  const section = hash < 0 ? "" : word.slice(hash + 1);
  if (!file || file.startsWith("/")) return null;
  const path = joinPath("", file);
  return path ? { path, section } : null;
}

/** `rel` resolved against the directory `dir`, both relative to the root,
 *  with `.` and `..` folded; null when it climbs out of the root. */
export function joinPath(dir: string, rel: string): string | null {
  const out: string[] = [];
  for (const part of [...dir.split("/"), ...rel.split("/")]) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      if (out.length === 0) return null;
      out.pop();
      continue;
    }
    out.push(part);
  }
  return out.length ? out.join("/") : null;
}

/** The directory a root-relative file sits in. */
export const dirOf = (path: string) => path.split("/").slice(0, -1).join("/");

/** A heading's anchor, GitHub's way: lower case, punctuation dropped,
 *  spaces to hyphens ("Change on the map" → change-on-the-map). */
export function slug(text: string): string {
  return text.trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
}

/** The heading that leads with the change on the map (spec-craft step 5). */
export const isMapHeading = (text: string) => /^change on the map$/i.test(text.trim());

export type ContentsItem = { id: string; text: string; map: boolean };

const decode = (s: string) =>
  s.replace(/<[^>]*>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/** marked's HTML with an id on every heading (repeats get -1, -2 as GitHub
 *  does) and the `##` headings as Contents: `Change on the map` first and
 *  marked, the rest in the document's order. The body keeps its order. */
export function withAnchors(html: string): { html: string; contents: ContentsItem[] } {
  const seen = new Map<string, number>();
  const items: ContentsItem[] = [];
  const out = html.replace(/<h([1-6])>([\s\S]*?)<\/h\1>/g, (_, level: string, inner: string) => {
    const text = decode(inner).trim();
    const base = slug(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n ? `${base}-${n}` : base;
    if (level === "2") items.push({ id, text, map: isMapHeading(text) });
    return `<h${level} id="${id}" tabindex="-1">${inner}</h${level}>`;
  });
  return { html: out, contents: [...items.filter((i) => i.map), ...items.filter((i) => !i.map)] };
}

/** The id a `#section` lands on among the body's ids: the same id, its
 *  slug, or else none. */
export function sectionId(ids: string[], section: string): string | null {
  if (!section) return null;
  let want = section;
  try { want = decodeURIComponent(section); } catch { /* keep it as written */ }
  if (ids.includes(want)) return want;
  const s = slug(want);
  return ids.includes(s) ? s : null;
}

export type LinkTarget =
  | { kind: "outside"; url: string }
  | { kind: "here"; section: string }
  | { kind: "record"; number: string; path: string; section: string }
  | { kind: "spec"; path: string; section: string }
  | { kind: "missing"; path: string }
  | { kind: "file"; path: string }
  | { kind: "none" };

/** What the reader knows of an initiative to follow a link: its records by
 *  root-relative path, and the spec files it may read (FR-6). */
export type ReaderIndex = { records: Map<string, string>; specs: Set<string> };

const RECORD = /(^|\/)working-on\/decisions\/(\d{4})-[^/]*\.md$/;

/** Where a link in the file `from` goes (FR-8; diagrams-in-app §3): an
 *  outside link to the browser; `#x` within the file; a decision record or
 *  a spec into the drawer; a record path the initiative does not hold reads
 *  missing; any other path in the root is a code path for the editor. */
export function linkTarget(from: string, href: string, idx: ReaderIndex): LinkTarget {
  const h = (href ?? "").trim();
  if (!h) return { kind: "none" };
  if (/^(https?|mailto):/i.test(h)) return { kind: "outside", url: h };
  if (/^[a-z][a-z0-9+.-]*:/i.test(h)) return { kind: "none" };
  if (h.startsWith("#")) return { kind: "here", section: h.slice(1) };
  const hash = h.indexOf("#");
  const file = hash < 0 ? h : h.slice(0, hash);
  const section = hash < 0 ? "" : h.slice(hash + 1);
  let rel = file;
  try { rel = decodeURI(file); } catch { /* keep it as written */ }
  const path = rel.startsWith("/") ? null : joinPath(dirOf(from), rel);
  if (!path) return { kind: "none" };
  const number = idx.records.get(path);
  if (number) return { kind: "record", number, path, section };
  if (RECORD.test(path)) return { kind: "missing", path };
  if (idx.specs.has(path)) return { kind: "spec", path, section };
  return { kind: "file", path };
}
