---
name: Vite CSS @import ordering
description: Google Fonts (or any external) @import in a Vite-processed CSS file must come before other @import/@rule statements.
---

CSS spec requires all `@import` statements to precede any other rule (besides `@charset`). In a Vite + Tailwind v4 setup where `index.css` starts with `@import 'tailwindcss';` and `@import 'tw-animate-css';`, adding a Google Fonts `@import url(...)` further down the file (e.g. after `@theme`) causes a Vite/PostCSS warning and the import is dropped/ignored.

**Why:** design subagent output placed the font import after the `@theme` block; Vite logged `@import must precede all other statements`.

**How to apply:** always place any `@import url(...)` (fonts, external stylesheets) as the very first line(s) of the CSS file, before `@import 'tailwindcss'` and everything else.
