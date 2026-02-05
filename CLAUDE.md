# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build static site to dist/
pnpm preview      # Preview production build
pnpm import:obsidian <vault-path> <folder-name>  # Import from Obsidian vault
```

## Architecture

**Astro 5.0 static blog** with Tailwind CSS and TypeScript. Korean language site.

### Content Collections

Two collections defined in `src/content/config.ts`:

- **posts** (`src/content/posts/`): Blog posts with title, description, date, tags, draft, image
- **til** (`src/content/til/`): "Today I Learned" entries with title, date, tags (lighter schema)

### Routing

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.astro` | Recent posts grid |
| `/posts/[slug]` | `pages/posts/[...slug].astro` | Post detail |
| `/til` | `pages/til/index.astro` | TIL archive grouped by month |
| `/til/[slug]` | `pages/til/[...slug].astro` | TIL detail |
| `/about` | `pages/about.astro` | About page |

### Layout Hierarchy

`BaseLayout.astro` → `PostLayout.astro`

- BaseLayout: HTML structure, meta tags, theme script, header/footer
- PostLayout: Post-specific styling, prose formatting

### Key Patterns

- **Dark mode**: CSS class-based (`dark` on HTML), persisted to localStorage
- **Syntax highlighting**: Shiki with `github-dark` theme (server-side)
- **Path alias**: `@/*` maps to `src/*`
- **Fonts**: Pretendard (sans), JetBrains Mono (mono)

### Obsidian Import Script

`scripts/import-obsidian.mjs` converts Obsidian notes:
- Parses YAML frontmatter
- Converts `![[image.png]]` to standard markdown
- Copies images to `public/images/posts/<slug>/`
