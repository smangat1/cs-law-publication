# HB

HB is a static publication site for tech law writing. It is intentionally code-first: there is no in-browser editor, no upload surface, and no public admin path.

## Publishing model

All content lives in [content/site-content.json](/Users/samyanmangat/Documents/LawPub/content/site-content.json).

- Add or edit `pieces` to publish articles and essays.
- Add or edit `issues` to publish issue packages.
- Keep issue-specific theming inside each issue's `theme` object.
- Keep issue route wrappers thin. The canonical content should always live in the shared content source.

## Dynamic routes

- Pieces render through [piece.html](/Users/samyanmangat/Documents/LawPub/piece.html) with `?id=...`
- Topics render through [topic.html](/Users/samyanmangat/Documents/LawPub/topic.html) with `?name=...`
- Authors render through [author.html](/Users/samyanmangat/Documents/LawPub/author.html) with `?name=...`
- Issues render through the path defined on each issue object, currently [issues/issue-1.html](/Users/samyanmangat/Documents/LawPub/issues/issue-1.html)

## Generated public artifacts

RSS and sitemap are generated from the shared content source:

```bash
node scripts/generate-publication-assets.mjs
```

This updates:

- [rss.xml](/Users/samyanmangat/Documents/LawPub/rss.xml)
- [sitemap.xml](/Users/samyanmangat/Documents/LawPub/sitemap.xml)

## Design note

Issues are allowed to feel like their own editorial worlds. The site-level system stays coherent, but issue pages can shift palette, surface treatment, and atmosphere through the data-driven issue theme layer.
