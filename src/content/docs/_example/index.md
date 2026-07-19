---
title: How this works
order: 0
---

This is a template, not a real project. Rename this folder (`_example`) to
match a pinned repo's **exact** GitHub name — same case, same punctuation —
and its tile on the home page will link here instead of out to GitHub.

## Adding a project

1. Create a folder under `src/content/docs/` named exactly like the repo,
   e.g. `src/content/docs/my-repo-name/`.
2. Add an `index.md` inside it — this becomes the project's main doc page.
3. Add more `.md` files in the same folder for extra pages (e.g.
   `getting-started.md`). They show up automatically in the sidebar,
   sorted by `order` (or by title if `order` is omitted).

## Frontmatter

Every page needs:

```yaml
---
title: Page title shown in the sidebar and heading
order: 1 # optional, controls sidebar position
---
```

Delete this `_example` folder whenever you don't need it anymore.
