# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Use **pnpm** (not npm or yarn). Node.js 20 required.

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
- **tit** (`src/content/tit/`): "Today I Thought" entries with title, date, tags (lighter schema)

### Routing

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/index.astro` | Recent posts grid |
| `/posts/[slug]` | `pages/posts/[...slug].astro` | Post detail |
| `/tit` | `pages/tit/index.astro` | TIT archive grouped by month |
| `/tit/[slug]` | `pages/tit/[...slug].astro` | TIT detail |
| `/about` | `pages/about.astro` | About page |

### Layout Hierarchy

`BaseLayout.astro` → `PostLayout.astro`

- BaseLayout: HTML structure, meta tags, theme script, header/footer
- PostLayout: Post-specific styling, prose formatting

### Key Patterns

- **Dark mode**: CSS class-based (`dark` on HTML), persisted to localStorage; inline script in BaseLayout detects system preference on first load
- **Syntax highlighting**: Shiki with `github-dark` theme (server-side)
- **Path alias**: `@/*` maps to `src/*`
- **Fonts**: Pretendard (sans), JetBrains Mono (mono)
- **Base path**: `/joo-log` in production, `/` in dev (set in `astro.config.mjs`)
- **Drafts**: Posts with `draft: true` are excluded from the home page listing
- **TIT filtering**: Client-side tag filtering using vanilla JS on `/tit`

### Commit Convention

Conventional commits enforced via Husky + commitlint (`commitlint.config.js`).

### Obsidian Import Script

`scripts/import-obsidian.mjs` converts Obsidian notes:
- Parses YAML frontmatter
- Converts `![[image.png]]` to standard markdown
- Copies images to `public/images/posts/<slug>/`

## Claude Code 관련 질문 응답 방침

claude-code-guide는 틀린 답을 낼 때가 있다. 사용자가 추가 질문을 하면 Claude Code 공식 문서 https://code.claude.com/docs/en/overview 에서 md 파일을 curl로 참조해서 답해. 그 후에는 AskUserQuestion으로 퀴즈를 내서 직접 따라하게 안내해.
