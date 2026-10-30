# Akshat Bhardwaj — Portfolio (Black × Crimson organic line)

> Working copy of `~/portfolio-line-experiment` (baseline `2f5e670`, left untouched). Branch: `black-red-portfolio-dev`. No remote; not for deployment. The original portfolio lives untouched in `~/portfolio`.
>
> - **Identity:** black and crimson tokens on `:root` in `src/index.css`.
> - **Line:** one crimson line (`src/components/NerveLine.tsx`) runs from the full stop of the hero headline to the contact links, through every section.
> - **Transitions:** the hero leaves with a scrubbed, reversible exit (`initHeroExit` in `src/lib/motion.ts`). The gravity transitions are removed.
> - **Screenshots:** in `screens/black-red/` (git-ignored). `screens/{1440,1024,768,390}/` are the baseline captures.

React 19 + TypeScript + Vite 8 + Tailwind 4, with GSAP (ScrollTrigger) and Lenis for scroll-driven motion.

## Run locally

```sh
npm ci            # install exactly what package-lock.json specifies
npm run dev       # dev server (http://localhost:5173)
npm run build     # production build into dist/
npm run preview   # serve the built dist/ locally
npx tsc --noEmit  # TypeScript check
```

## Preserved version

- Branch: `complete-portfolio`
- Tag: `portfolio-v1-preserved`

Restore or inspect it:

```sh
git checkout portfolio-v1-preserved          # detached, read-only view
git switch -c my-work portfolio-v1-preserved # or continue from it on a new branch
```

## Screenshots

`baseline/` (original Figma Make captures) and `screens/after/` (current build) are **git-ignored** and live only in this folder on disk. They are not part of the tag or any clone — back them up separately.

## Publishing notes

- The site is deliberately private: `<meta name="robots" content="noindex, nofollow">` in `index.html` and `Disallow: /` in `public/robots.txt`. Remove both only when launch is approved.
- Output is a static site (`dist/`), deployable to any static host. No hosting is configured.
- External dependency: Google Fonts (Space Grotesk, Instrument Serif, JetBrains Mono) loaded from `index.html`. The site is not fully offline-self-contained.
