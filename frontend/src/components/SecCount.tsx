import type { ReactNode } from "react";

/** A count after a title, `<title> · N`, the one way every section title
 *  draws one (leftovers-71 FR-2; run-report Amendment 7, AR34; design system,
 *  "A count after a title").
 *
 *  `.sec-title` is a flex row with a gap (shell.css). Written by hand as a
 *  text node and the count's span, the two were two flex items: the space by
 *  the dot collapsed at the item's edge and the gap stood in for it, wider
 *  than the space on the other side. Here the title, the dot and the count
 *  are one element, so the spaces each side of the `·` are spaces.
 *
 *  With `name`, the count numbers the title and the name follows the dot,
 *  as Overview's stage title reads: `Stage 2 · Build`.
 *
 *  `title` may be an element (the rail's renameable group name); the dot and
 *  the count still follow it inside this one element. */
export function SecCount({ title, n, name, countClass = "sec-count", className }: {
  title: ReactNode; n: number; name?: string;
  /** The count's class beside `num` where a place styles its own count
   *  (the rail's `rail-group-n`); `sec-count` otherwise (leftovers-72 FR-2). */
  countClass?: string;
  /** The element's class where a place lays it out itself (the rail's
   *  group header keeps the name's ellipsis: `rail-group-title`). */
  className?: string;
}) {
  const count = <span className={`num ${countClass}`}>{n}</span>;
  if (name !== undefined) return <span className={className}>{title} {count}{" · "}{name}</span>;
  return <span className={className}>{title}{" · "}{count}</span>;
}
