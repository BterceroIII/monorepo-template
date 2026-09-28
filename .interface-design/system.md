# Interface Design System

## Data Tables

- Use a flat table inside the module card, with horizontal scrolling for dense desktop data.
- Match the opportunities list pattern: 48px muted header, uppercase compact labels, explicit column widths, and subtle row hover states.
- Make data rows clickable when they open a detail view. Stop propagation on inline controls such as status selectors and action menus.
- Keep the primary entity visually prominent with semibold brand-colored text and a secondary line for identifying metadata.
- Use compact, rounded pagination controls with a page-size selector and previous/next icon buttons.
- Represent loading with skeleton rows, errors with an actionable empty state, and filtered-empty results with a contextual empty state.
- Keep mobile presentation separate from the desktop table when the table would be difficult to scan at narrow widths.
- Keep table headers in normal document flow; do not use `sticky top-0` inside page tables because it can overlap the global topbar and filters while scrolling.
- Use `overflow-x-auto` on the table container for dense desktop tables and keep the global topbar as the only sticky surface.

## Visual Language

- Favor quiet surface shifts and subtle borders over strong shadows for dense operational interfaces.
- Use the existing brand teal for primary entity links and existing semantic status colors for badges and selectors.
- Use the established spacing scale, compact controls, and rounded-xl module surfaces.
