# Personal Blog Design Spec

## Overview

A personal blog built with Astro v5, deployed on GitHub Pages. The blog serves as a platform for both technical articles and life essays, with a distinctive visual style that prioritizes restraint, whitespace, and typographic rhythm over flashy gradients or AI-generic aesthetics.

## Tech Stack

- **Framework:** Astro v5 (static site generation)
- **Styling:** Pure CSS with CSS custom properties (no Tailwind, no CSS framework)
- **Language:** TypeScript
- **Content:** Markdown with Content Collections
- **Code Highlighting:** Shiki (Astro built-in)
- **Deployment:** GitHub Pages via GitHub Actions
- **Plugins:** `@astrojs/sitemap`, `@astrojs/rss` (only these two)

## Project Structure

```
my-blog/
├── src/
│   ├── content/
│   │   └── blog/
│   │       ├── hello-world.md
│   │       └── my-second-post.md
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── ThemeToggle.astro
│   │   ├── home/
│   │   │   ├── Hero.astro
│   │   │   ├── TechStack.astro
│   │   │   └── LatestPosts.astro
│   │   └── ui/
│   │       └── ScrollReveal.astro
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── blog/tags/
│   │   │   └── [tag].astro
│   │   ├── rss.xml.ts
│   │   ├── about.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css
├── public/
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Pages

### Homepage `/`

Four sections, top to bottom:

1. **Hero:** Bold oversized heading (72px+) stating who you are. One line of subdued smaller text beneath. Background is a solid color with a subtle grain texture (CSS SVG noise filter, no external assets) and a mouse-following gradient spotlight (on touch devices, spotlight is static-centered or disabled). Content fades in on load — no typewriter effect.

2. **Tech Stack:** A grid of technology icons. All icons render in grayscale by default. On hover, the hovered icon transitions to its brand color while the rest remain gray. Each icon has a small label underneath. No category headings — the icons speak for themselves.

3. **Latest Posts:** The 6 most recent blog posts as cards (3×2 grid on desktop, single column on mobile). Each card shows title, description, date, and tags. Cards have a clean design with subtle translate + shadow shift on hover.

4. **Footer:** Copyright, social links, site navigation. Minimal.

### Blog List `/blog`

- All published posts in reverse chronological order
- Tag filtering via build-time static pages: each tag gets its own page at `/blog/tags/[tag]`. Clicking a tag navigates to that page. No client-side JS filtering needed.
- Each entry shows: title, description, publish date, tags, cover image (if present)
- Card style consistent with the Latest Posts section on the homepage

### Blog Post `/blog/[slug]`

- Title and meta info: title, publish date, updated date, tags, estimated reading time
- Table of contents (TOC): auto-generated from headings. Desktop: fixed on the side, highlights current section on scroll. Tablet: collapsible panel at the top of the article. Mobile: hidden entirely (article headings serve as landmarks).
- Body: Markdown rendered HTML with Shiki code highlighting
- Previous / Next post navigation at the bottom

### About `/about`

- Personal introduction page: brief bio, a photo (optional), social/contact links
- Free-form Markdown content, uses `BaseLayout`

### 404

- Custom 404 page: centered message with illustration or emoji, a link back to homepage

## Article Frontmatter Schema

```yaml
---
title: string        # required
description: string  # required, used for list pages and SEO
pubDate: date        # required
updatedDate: date    # optional
tags: string[]       # required
cover: string        # optional, path relative to /public/covers/ (e.g. "my-post.jpg"). Cards without cover display title-only layout.
draft: boolean       # optional, default false — true hides from production
---
```

## Visual Design

### Design Philosophy

Restrained, generous whitespace, less is more. Impact comes from typographic rhythm and subtle details, not from gradient stacking or neon effects.

### Color Palette

Only one accent color, used sparingly: current nav underline, hovered links, tag badges. Everything else relies on black/white/gray hierarchy.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `--bg` | `#fafafa` warm white | `#111111` pure black |
| `--text` | `#171717` near-black | `#ededed` soft white |
| `--text-secondary` | `#737373` mid-gray | `#737373` mid-gray |
| `--accent` | `#e85d04` burnt orange | `#fb923c` warm orange |
| `--border` | `#e5e5e5` | `#262626` |
| `--card-bg` | `#ffffff` | `#1a1a1a` |

### What We Do vs. What We Don't

| Don't (AI-generic) | Do (designer feel) |
|---|---|
| Gradient backgrounds, neon glow | Bold typography — oversized headings, extreme whitespace |
| Full-screen particle animations | One deliberate dynamic element in Hero (mouse-follow spotlight) |
| Glowing card borders on hover | Clean cards, hover = subtle translate + shadow change |
| Colorful icons everywhere | Monochrome icons, brand color only on hover |
| Transition animations on everything | Precise, purposeful animation — only to guide the eye |

### Typography

- Headings: `system-ui, -apple-system, sans-serif`
- Body: same stack, optimized for CJK + Latin mixed reading. `<html lang="zh-CN">`. Line-height set to 1.8 for comfortable CJK reading. CJK font fallback: `"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`.
- Code: `'JetBrains Mono', 'Fira Code', monospace`
- No external font loading — maximum load speed

### Theme Switching

- Toggle icon (moon/sun) in top-right of header
- Default follows system preference (`prefers-color-scheme`)
- Manual toggle persisted via `localStorage`
- Implemented with CSS custom properties, smooth transition on switch

### Responsive Breakpoints

| Breakpoint | Width | Layout |
|-----------|-------|--------|
| Mobile | `< 640px` | Single column, TOC hidden, hamburger menu |
| Tablet | `640px - 1024px` | Two-column cards, TOC collapsible |
| Desktop | `> 1024px` | Full layout, TOC fixed on side |

## Animation & Interaction

All animations implemented with pure CSS + vanilla JS. No animation libraries.

- **Hero fade-in:** Content opacity 0 → 1 on page load
- **Mouse-follow spotlight:** Subtle radial gradient that follows cursor position in Hero area (vanilla JS + CSS). On touch devices, spotlight is static-centered or disabled.
- **Scroll reveal:** Homepage sections only — fade-in + slide-up when entering viewport via `IntersectionObserver`. Not used on blog post pages.
- **Tech stack hover:** Grayscale → brand color transition on individual icon hover
- **Post cards hover:** `translateY(-2px)` + box-shadow deepening
- **Theme toggle:** Smooth CSS variable transition (`transition: background-color 0.3s, color 0.3s`)

## Content & SEO

- `<title>` and `<meta name="description">` auto-generated from article frontmatter
- Open Graph tags for social sharing previews
- `sitemap.xml` auto-generated via `@astrojs/sitemap`
- RSS feed via `@astrojs/rss`

## Performance Targets

- Lighthouse score 90+ across all categories
- Zero JS blocking first paint — static HTML output by default
- Images optimized via Astro built-in `<Image>` component
- JS only loaded where interactivity is needed (theme toggle, scroll reveal, mouse spotlight)

## Deployment

- **Repository:** GitHub repo (e.g. `username.github.io` or custom name)
- **CI/CD:** GitHub Actions — push to `main` triggers build and deploy
- **URL:** `https://username.github.io` (free)
- **Custom domain:** Optional future addition via CNAME

### Publishing Workflow

```
Write .md file → git add → git commit → git push → GitHub Actions auto-build → live
```
