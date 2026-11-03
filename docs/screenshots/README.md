# Screenshots

These are screenshots of the real site. Each one was taken in headless Chromium from the production build (`npm run build`, then `npm run preview`) after fonts had loaded. No mockups or design files are included. The site is not deployed yet, so no live URL is given here.

There are two sets, and they answer different questions.

| Set | Folder | Browser motion setting | Use it to see |
| --- | --- | --- | --- |
| Layout reference | this folder | Reduced motion (except the hero) | The whole page at once: every section visible and the whole crimson line drawn |
| Normal motion | [`normal-motion/`](normal-motion/) | Animation on | The line mid-draw at specific scroll positions |

In reduced-motion mode the site shows its finished state. With animation on, the line draws as you scroll and nodes light as it reaches them, so any single frame shows only part of it.

Every image that shows the project cards (the full-page captures, `projects-desktop.png`, `mobile-projects.png` and the projects frames in `normal-motion/`) was captured after the cards were corrected to list only technologies found in each repository, and to mark forked repositories with a FORK badge.

Sizes are CSS pixels. Images are at a device pixel ratio of 1, except `mobile-projects.png` and `normal-motion/mobile-hero-390.png`, which are at 2 (so the file is twice the viewport size).

## Layout reference

| File | Viewport | Section | Description |
| --- | --- | --- | --- |
| [`desktop-full-page.png`](desktop-full-page.png) | 1440 × 900 | Whole page | The full desktop page, from the hero to the footer, with the line drawn through every section. |
| [`laptop-full-page.png`](laptop-full-page.png) | 1024 × 768 | Whole page | The full page at laptop width. |
| [`tablet-full-page.png`](tablet-full-page.png) | 768 × 1024 | Whole page | The full page at tablet width. Columns stack and the line runs in the left gutter. |
| [`mobile-full-page.png`](mobile-full-page.png) | 390 × 844 | Whole page | The full page on a phone, with the compact navigation and stacked sections. Re-captured after the mobile hero chip spacing fix. |
| [`hero-desktop.png`](hero-desktop.png) | 1440 × 900 | Hero | "I build systems that connect." The line comes out of the headline's full stop. Animation on, after the entrance finished. |
| [`about-desktop.png`](about-desktop.png) | 1440 × 900 | 01 · About | Introduction and the three capability cards. The line runs between the columns. |
| [`experience-desktop.png`](experience-desktop.png) | 1440 × 900 | 02 · Experience | Platform Engineer at JulleyOnline.in, plus the two AI research internships. |
| [`projects-desktop.png`](projects-desktop.png) | 1440 × 900 | 03 · Selected projects | All four projects, with the line weaving between their conceptual illustrations. |
| [`research-desktop.png`](research-desktop.png) | 1440 × 900 | 05 · Research & recognition | The featured IEEE ICoECIT 2026 paper card with its crimson glow, plus a presentation, a hackathon win and a certification. |
| [`toolkit-desktop.png`](toolkit-desktop.png) | 1440 × 900 | 06 · Technical toolkit | The five areas of the working stack. |
| [`contact-desktop.png`](contact-desktop.png) | 1440 × 900 | 07 · Contact | "Let's build something meaningful," with contact links. The line ends at LinkedIn. |
| [`mobile-projects.png`](mobile-projects.png) | 390 × 844 | 03 · Selected projects | The four projects stacked on a phone, with the line in the left gutter. |

Section screenshots capture the whole section, so a section taller than the viewport gives a taller image. The fixed navigation bar appears at the top of each one, as it does in the browser.

## Normal motion

Captured with animation on. The browser scrolled to each position in steps, waited for the scrubbed line to settle, then took a screenshot. "Nodes lit" is the number of line milestones that had lit at that point, out of 25 on desktop and 24 on mobile.

### Hero to About

| File | Viewport | Scroll | Nodes lit | Description |
| --- | --- | --- | --- | --- |
| [`hero-01-loaded.png`](normal-motion/hero-01-loaded.png) | 1440 × 900 | 0 px | 1 | The hero just loaded. Only a short tail of the line shows, leaving the headline's full stop. |
| [`hero-02-line-leaving-headline.png`](normal-motion/hero-02-line-leaving-headline.png) | 1440 × 900 | 300 px | 1 | The hero is exiting: headline lines drift up and dim while the line extends downward. |
| [`hero-03-routing-down-past-hero-text.png`](normal-motion/hero-03-routing-down-past-hero-text.png) | 1440 × 900 | 380 px | 1 | The line runs through the gap between the dimmed intro paragraph and the buttons. |
| [`hero-04-arriving-at-about.png`](normal-motion/hero-04-arriving-at-about.png) | 1440 × 900 | 760 px | 2 | The line arrives at the left edge of the About copy and lights its node. |
| [`hero-05-about-node-lit.png`](normal-motion/hero-05-about-node-lit.png) | 1440 × 900 | 1230 px | 4 | The line has run down the About copy and across toward the right gutter beside the capability cards. |

### Experience

| File | Viewport | Scroll | Nodes lit | Description |
| --- | --- | --- | --- | --- |
| [`experience-01-section-entry.png`](normal-motion/experience-01-section-entry.png) | 1440 × 900 | 1740 px | 5 | The Experience heading, with the line arriving down the right gutter. |
| [`experience-02-platform-engineer-milestone.png`](normal-motion/experience-02-platform-engineer-milestone.png) | 1440 × 900 | 1882 px | 6 | The line curves around the end of "Platform Engineer" and heads into the first achievement. |
| [`experience-03-internships-and-branches.png`](normal-motion/experience-03-internships-and-branches.png) | 1440 × 900 | 2710 px | 8 | The two internship cards, with the line along the right and short twigs grown along its route. |

### Projects

| File | Viewport | Scroll | Nodes lit | Description |
| --- | --- | --- | --- | --- |
| [`projects-01-entering.png`](normal-motion/projects-01-entering.png) | 1440 × 900 | 3298 px | 9 | The "Built to be useful." heading, with the line sweeping in toward the first project. |
| [`projects-02-healthcare-to-taskflow.png`](normal-motion/projects-02-healthcare-to-taskflow.png) | 1440 × 900 | 4019 px | 10 | Halfway between Healthcare.AI and TaskFlow. The line is part drawn, with the spark at its tip. |
| [`projects-03-taskflow-to-burry-ai.png`](normal-motion/projects-03-taskflow-to-burry-ai.png) | 1440 × 900 | 4631 px | 11 | The leg from TaskFlow to Burry AI, mid-draw. |
| [`projects-04-burry-ai-to-webopedia.png`](normal-motion/projects-04-burry-ai-to-webopedia.png) | 1440 × 900 | 5215 px | 12 | The leg from Burry AI to Webopedia, mid-draw. |
| [`projects-05-last-project-reached.png`](normal-motion/projects-05-last-project-reached.png) | 1440 × 900 | 5653 px | 13 | Webopedia reached, with the line continuing beneath it toward the next section. |

### Research

| File | Viewport | Scroll | Nodes lit | Description |
| --- | --- | --- | --- | --- |
| [`research-01-section-entry.png`](normal-motion/research-01-section-entry.png) | 1440 × 900 | 7154 px | 20 | The Research heading and the top of the featured IEEE paper card, with the line arriving at its right edge. |
| [`research-02-ieee-paper-and-glow.png`](normal-motion/research-02-ieee-paper-and-glow.png) | 1440 × 900 | 7513 px | 20 | The featured paper card, with its crimson glow and the line's node at its right edge. |
| [`research-03-honors-line-continuing.png`](normal-motion/research-03-honors-line-continuing.png) | 1440 × 900 | 7993 px | 21 | The line leaves the paper card, lights a node on the recognition row and runs on toward the toolkit, with the spark at its tip. |

### Mobile

| File | Viewport | Scroll | Nodes lit | Description |
| --- | --- | --- | --- | --- |
| [`mobile-hero-390.png`](normal-motion/mobile-hero-390.png) | 390 × 844 (image 780 × 1688) | 0 px | 1 | The mobile hero, with the `eas update` chip clear of the intro paragraph. |
| [`mobile-projects-mid-scroll.png`](normal-motion/mobile-projects-mid-scroll.png) | 390 × 844 | 4667 px | 9 | Between Healthcare.AI and TaskFlow, with the line in the left gutter. |
| [`mobile-projects-late-scroll.png`](normal-motion/mobile-projects-late-scroll.png) | 390 × 844 | 5952 px | 11 | Between Burry AI and Webopedia. |

## Animation preview

[`../media/line-scroll.gif`](../media/line-scroll.gif) is a **frame-based scroll-sequence preview, not a real-time screen recording**. It is 70 browser screenshots taken at successive scroll positions 64 px apart (from the top of the page to the TaskFlow project), played back at about 11 frames per second. It is 720 × 450 and about 2.2 MB. Nothing is drawn over the frames, and the playback speed is not the speed of a real scroll.
