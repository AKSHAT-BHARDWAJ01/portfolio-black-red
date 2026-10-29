# Akshat Bhardwaj — Portfolio (line-animation experiment)

> Experimental clone of the preserved portfolio (`portfolio-v1-preserved`, `d5ce736`). Branch: `line-animation-experiment`. It has no remote and is not for deployment. The original lives untouched in `~/portfolio`.
>
> What's new here: an SVG "nerve line" (`src/components/NerveLine.tsx`) that draws down the page from Experience to Contact, lighting nodes at milestones, plus a rebuilt Projects section (`initProjects` in `src/lib/motion.ts`). Experimental screenshots are in `screens/` (git-ignored).

React 19 + TypeScript + Vite 8 + Tailwind 4, with GSAP (ScrollTrigger, Physics2D) and Lenis for the gravity-based section transitions.

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
