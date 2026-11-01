# Test data for `mapSvg.test.ts`

## harbor-containers.svg

The harbor fixture's L2 (containers) diagram as Deltagos draws it, unchanged:
the output of `internal/diagram` (`Renderer.Render`, the path `App.RenderDiagram`
takes), so the same dark config, CSS, classDef lines and `-b transparent`.

- Source: the one ```mermaid block of `contracts/c4-map/expected-containers.md`
  in agent-mailbox-specs at ca14f12 (the file last changed in cee0b06; the
  checkout contains 54cf10d).
- Renderer: mmdc 11.12.0 (`~/.nvm/versions/node/v24.0.1/bin/mmdc`), style files
  `~/.mermaid/classdefs-dark.mmd` (sha256 8f47bb92…), `mermaid-config-dark.json`
  (3f6262aa…), `mermaid-styles-dark.css` (86e29240…).
- How: a throwaway test in `internal/diagram` (not committed) that read the
  block, called `New()` with `CacheDir` pointed at a temporary directory, and
  wrote `Render`'s string here. 2026-11-01, l58-render (lf58-map-render).

Its node labels are HTML inside `<foreignObject>` (mermaid 11 reads only the
root `htmlLabels`); leftovers-58 Amendment 1 is why the sanitizer turns them
into `<text>`. Re-render it the same way if the dark style changes.
