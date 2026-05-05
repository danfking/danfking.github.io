# danfking.github.io

Source for **Daniel King's blog** at <https://danfking.github.io>.

Writing about agentic development, developer tools, MCP, and what changes when humans and AI agents share the work.

## Local development

```bash
bundle exec jekyll serve
```

Then open <http://localhost:4000>.

## Adding a post

Drop a Markdown file into `_posts/` named `YYYY-MM-DD-slug.md` with the standard Jekyll frontmatter:

```yaml
---
layout: post
title: "Post title"
date: YYYY-MM-DD
tags: [tag1, tag2]
---
```

## Cross-posts from the LinkedIn series

Posts in the Project Metis LinkedIn series are repackaged here as Jekyll posts (drop the LinkedIn meta sections, add frontmatter, keep the body). See `_posts/2026-04-30-day-one-ide-fix.md` for the calibration.
