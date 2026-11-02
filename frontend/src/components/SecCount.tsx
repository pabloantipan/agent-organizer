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
 *  as Overview's stage title reads: `Stage 2 · Build`. */
export function SecCount({ title, n, name }: { title: string; n: number; name?: string }) {
  const count = <span className="num sec-count">{n}</span>;
  if (name !== undefined) return <span>{title} {count}{" · "}{name}</span>;
  return <span>{title}{" · "}{count}</span>;
}
