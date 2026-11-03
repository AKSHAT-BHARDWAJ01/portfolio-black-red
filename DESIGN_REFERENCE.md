# Design reference — Black × Crimson portfolio

How the current site is designed and built. It describes the source in this repository; when the code changes, update this file with it.

- [Principles](#principles)
- [Colour](#colour)
- [Typography](#typography)
- [The nerve line](#the-nerve-line)
- [Line animation architecture](#line-animation-architecture)
- [Section connections](#section-connections)
- [Responsive behaviour](#responsive-behaviour)
- [Reduced motion](#reduced-motion)
- [Projects visual system](#projects-visual-system)
- [Research paper presentation](#research-paper-presentation)
- [Component architecture](#component-architecture)
- [Changing the design](#changing-the-design)

## Principles

- **Black dominates; crimson marks what matters.** The page is almost entirely dark neutrals. Crimson is reserved for the line, section markers, calls to action and the research card.
- **One line connects the page.** A single crimson path runs from the hero headline to the contact links, through every section.
- **The line never interrupts reading.** It is routed through gutters and the gaps between blocks, not across body text.
- **Nothing is invented.** Copy, links and project data live in [`src/content.ts`](src/content.ts). Project visuals are conceptual drawings and say so.
- **Motion is an enhancement.** Every page and every piece of content works without it.

## Colour

All colours are tokens on `:root` in [`src/index.css`](src/index.css).

| Token | Value | Use |
| --- | --- | --- |
| `--bg` | `#08090B` | Page background |
| `--s1`, `--s2` | `#101114`, `#17191E` | Raised surfaces (cards, `.glass`) |
| `--wine` | `#181215` | Tinted section panel, drawn behind the line |
| `--tx` | `#F5F3F1` | Primary text (warm off-white) |
| `--tx2`, `--tx3` | `#A3A3AD`, `#747782` | Secondary and tertiary text |
| `--red` | `#E53945` | The line, nodes, accents |
| `--red-hi` | `#FF4B55` | Section labels, focus rings, hover and lit states |
| `--red-lo` | `#9F303B` | Deep crimson in glows and pressed states |
| `--red-btn` | `#C42B36` | Filled buttons |
| `--red-soft` | `#FF8A8F` | DOI text |
| `--red-line` | `rgba(229,57,69,.22)` | Faint crimson rules and borders |
| `--line` | `rgba(255,255,255,.1)` | Hairline dividers |
| `--line-hover` | `rgba(229,57,69,.45)` | Card border on hover |
| `--line-control` | `rgba(255,255,255,.36)` | Outline of a control that has no other boundary |

Contrast decisions, recorded in the CSS:

- White text on `#E53945` measures 4.2:1, below the 4.5:1 target, so filled buttons use the deeper `--red-btn` (5.6:1).
- A control's only boundary must reach 3:1 against `--bg`; `--line-control` at 36% white gives 3.26:1.

The line is one colour, with no gradient. The travelling spark is a pale `#FFC4C7`.

## Typography

| Role | Face | Use |
| --- | --- | --- |
| Display and body | Space Grotesk | Headlines, copy, buttons |
| Accent | Instrument Serif, italic | `<em>` words in headlines, stage lines, venue and tool lists |
| Labels | JetBrains Mono | 12px, uppercase, 0.14em tracking: section markers, tags, record fields |

Fonts are loaded by `<link>` in [`index.html`](index.html). Headlines use fluid sizes (for example the hero at `clamp(40px, 7.6vw, 150px)`) with tight negative tracking. The second hero line is outlined text rather than filled, which keeps the headline light.

## The nerve line

The line is an organic SVG path, not a straight rule. It is built from these parts, all styled in `index.css` under `.nerve`:

| Part | Look |
| --- | --- |
| Track | A very faint crimson hairline showing the whole route before it is drawn |
| Segment | The 2px crimson stroke, with a wider, low-opacity copy under it as a glow |
| Spark | A short pale highlight at the drawing tip |
| Twig | A short curl that grows off a leg toward the nearer page edge (not drawn on phones) |
| Node | A small ring and core at each milestone; larger with a slow breathing ring for section milestones |
| Terminal halo | An extra ring around the final node at the contact links |

Nodes start dim and fill when the line reaches them. The first node, at the full stop of the hero headline, is lit from the start.

## Line animation architecture

All of it lives in [`src/components/NerveLine.tsx`](src/components/NerveLine.tsx). Geometry is measured from the page; nothing is hand-placed.

**1. Anchors.** Any element with `data-node` becomes a milestone. Attributes tune it:

| Attribute | Meaning |
| --- | --- |
| `data-node` | Where the line attaches: `gl` / `gr` (left or right page gutter), `el` / `er` (the element's left or right edge), `c` (centre) |
| `data-node-y` | `top` or `bottom` of the element (default: vertical centre) |
| `data-dx` | Sideways offset in px on desktop |
| `data-swing` | How far a leg swings sideways; `0` runs it straight along an edge |
| `data-f` | Where along the leg the sideways crossing happens (0–1), to place it in whitespace |
| `data-bow` | Vertical bow for a nearly level leg (negative lifts it) |
| `data-major` | A section milestone: larger node, breathing ring |
| `data-clear` | A selector for blocks the leg into this node must not cross |

**2. Measuring.** `measure()` converts anchors to nodes using `offsetLeft`/`offsetTop`, which ignore transforms, so reveal offsets, the hero exit and card tilt cannot skew it. It runs on mount, whenever `<main>` resizes, and once fonts load. The SVG is redrawn only when the measured geometry actually changes.

**3. Legs.** Between consecutive nodes:

- A nearly level leg (under 90px of vertical travel) is one soft arc.
- Any other leg leaves vertically, crosses sideways with a horizontal tangent, and arrives vertically. Its swing grows with the available space, and consecutive legs alternate sides so they do not repeat.
- If a node lists `data-clear` blocks and the usual curve would cross one, `clearLane()` takes a detour instead: into the left gutter lane above the blocks, straight down past them, then across to the node. The hero uses this below desktop width so the line does not cross the intro and buttons.

**4. Drawing.** Each leg is a path with `pathLength="1"` and a dash of 1, so its stroke offset runs from 1 (undrawn) to 0 (drawn). One scrubbed GSAP timeline per leg (scrub 0.5s) drives that offset and carries the spark. Drawing starts and ends when the leg's two nodes pass 62% of the viewport height; the first leg starts at the top of the page, already slightly drawn, so the line is emerging from the full stop on load; the last leg ends as the page bottoms out. Because everything is scrubbed to scroll position, scrolling back retraces the line exactly.

**5. Lighting.** A `ScrollTrigger` per node adds `.on` to the node and `.node-on` to the anchor element when the line reaches it. Content can respond to `.node-on`; the research card does. The final node lights near the very bottom, since the page cannot scroll far enough to put it mid-viewport.

**6. Section tints.** Elements marked `data-tint` get a `--wine` panel drawn behind the line, so a tinted section never hides it.

On desktop the route has 25 milestones; on mobile 24, because one is hidden.

## Section connections

The route, top to bottom. "Gutter" means the page margin; "edge" means the edge of an element.

| Section | What the line does |
| --- | --- |
| Hero | Starts at the full stop of the headline and leaves downward through the space between the intro and the buttons |
| About | Meets the left edge of the about copy, runs down its edge, then reaches the right gutter beside the third capability card |
| Experience | Section milestone at the heading; attaches to the end of "Platform Engineer", then the right gutter beside the first achievement, then the second internship card |
| Projects | Section milestone at the heading, then each project card in turn, alternating left and right edges |
| How I work | Section milestone in the left gutter, then along the top edges of the four stepped stages |
| Research | Section milestone at the heading, then into the right edge of the featured paper (which lights up), then the middle recognition item |
| Toolkit | Section milestone in the left gutter, then the last toolkit row |
| Contact | Section milestone at the heading, ending at the LinkedIn link, which carries the terminal node |

## Responsive behaviour

Breakpoints are in `index.css`. The site is checked at 1440, 1024, 768 and 390px, with no horizontal overflow at any of them.

| Width | Behaviour |
| --- | --- |
| 1280px and up | Full navigation with availability note; floating tags beside the About copy |
| Up to 1279px | Floating About tags and the availability note are hidden (there is no free space) |
| Up to 1023px | Narrower navigation; the research card stacks its record under the main column; the line runs in a single compact lane in the left gutter instead of weaving between columns |
| 768 to 1023px | About and projects stack to one column; the stages form two columns; the navigation's resume pill is hidden (the hero and contact carry it) |
| Under 768px | 24px gutters; navigation collapses to a menu button that opens a full-screen sheet; the hero stacks and its buttons span the width |

Hero details on phones:

- The `eas update` chip sits above the intro. It moves up 26px at 400px wide and below, where the intro wraps to four lines, and is dropped on screens 720px tall or shorter, where there is no room for it between the headline and the intro.
- On screens 700px tall or shorter the intro gets a 56px top margin. Without it the line's opening stretch, which is already drawn at load, would run into the intro.
- At 340px wide and below the navigation tightens its spacing so the name, Resume pill and menu button fit inside the bar.

## Reduced motion

When the visitor prefers reduced motion:

- **JavaScript:** everything inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')` is skipped: Lenis smooth scrolling, the hero intro and exit, section reveals, project entrances, parallax, pointer parallax and the line's scroll wiring. The matchMedia context reverts or rebuilds live if the preference changes.
- **The line:** CSS shows it complete, with every node lit, the spark hidden and no scroll-drawn animation.
- **The research card:** its glow and border are fully on, and the title rule is drawn.
- **Everything else:** CSS animations and transitions are off, and hover lifts and card tilt are disabled.

Content is never hidden behind an animation, so nothing needs motion to be readable.

## Projects visual system

- **Four conceptual illustrations** in [`ProjectVisual.tsx`](src/components/ProjectVisual.tsx), one per project: a medical-report flow, a kanban board, a spending chart, and an article with text-to-speech controls. Each is an SVG on a 640×400 canvas that scales with its card.
- **Honest labelling:** every illustration carries a badge reading "Conceptual illustration · not a screenshot". The illustrations are decorative and hidden from assistive technology.
- **Cards** use the shared `.glass` surface plus `.holo`: a blurred crimson layer behind the card that brightens on hover, and a small pointer tilt (mouse only, off under reduced motion).
- **Layout:** cards alternate sides down the page, and the line attaches to the near edge of each one. At tablet width and below they stack.
- **Entrance:** the heading rises out of masks with a rule drawing beneath it; each project's visual then wipes open and its number and copy follow. The animation targets the inner visual, never the card, because the card owns the hover transform.
- **Case studies:** each project opens a full-screen dialog at `#/work/<slug>`. It traps focus, freezes the page behind it, restores focus on close, and links to the next project and the project's source repository.
- **Forks are labelled.** Where the linked repository is a fork, its "View source" link carries a small FORK badge, the screen-reader text says so, and the case study names the upstream. A repository that calls the project by another name says that too (Webopedia's repository is named Wajipedia). This lives in the `REPOS` map in `content.ts`.
- **Technologies and claims are checked against the repositories.** Tags, features and outcomes on the cards come from what the linked repositories' manifests, source and history support, not from memory. Add a technology only when a repository shows it.

## Research paper presentation

The IEEE paper is the one place on the page that gets a luminous treatment.

- **Card:** a dark editorial panel with a main column (title, authors, venue, actions) and a record column (type, year, venue, pages, authors, DOI). Below 1024px the record stacks under the main column.
- **Glow:** a blurred crimson ambience behind the card and a gradient border drawn with a mask. Both are dim until the line arrives.
- **Connection:** the line plugs into the card's right edge. When it reaches that node, `.node-on` is set on the card, the glow and border brighten, and a short crimson rule draws under the title.
- **Details:** an outlined "IEEE" mark in the record column, a primary "Read the paper" button to the DOI, and a link back to the Healthcare.AI case study.
- **Below the card:** three recognition items (a paper presentation, a hackathon win and a certification), kept visually secondary. The presentation is labelled as separate from the publication.

## Component architecture

```text
main.tsx            React root
└─ App.tsx          page, state and wiring
   ├─ Nav           navigation, active-section tracking, mobile sheet
   ├─ NerveLine     the line (measure + scroll wiring)
   ├─ sections      hero, about, experience, projects, process, research, toolkit, contact
   ├─ ProjectVisual conceptual illustration for a project
   └─ CaseStudy     project dialog
lib/motion.ts       Lenis, hero exit, reveals, project entrances
lib/useFocusTrap.ts focus trapping for the menu and case study
content.ts          all copy, links, project data, repository URLs
```

- **`App.tsx`** owns the open case study (synchronised with the URL hash and `popstate`), a `lock()` that freezes the page behind an overlay (stops Lenis, sets `inert` on `<main>`), and a `go()` that scrolls to a section and moves focus to it. It sets up motion once, inside the reduced-motion media query.
- **`Nav.tsx`** highlights the section crossing the middle of the viewport with an `IntersectionObserver`, so it works with or without motion.
- **`NerveLine.tsx`** is described above; it reads the DOM and owns the SVG.
- **`motion.ts`** holds the shared GSAP and Lenis setup: Lenis drives scrolling and GSAP's ticker is the single animation loop for both.
- **`content.ts`** is the single source for text and links. Project repository links are in the `REPOS` map; remove an entry to hide a project's "View source" link.

Accessibility is built into this structure: a skip link, visible focus states, focus-trapped dialogs, screen-reader text on external links and downloads, and the reduced-motion behaviour above.

## Changing the design

- Change colour or type in the tokens and rules in `index.css`, not in components.
- To add a milestone to the line, put `data-node` on the element; the line re-measures itself. If a leg crosses text, adjust `data-f`, `data-swing` or `data-clear` on the node it arrives at.
- After any change, run `npx tsc --noEmit` and `npm run build`, then check the page at 1440, 1024, 768 and 390px with motion on and with reduced motion on. Confirm the line draws to the end, reverses when scrolled back, and crosses no text.
- Keep the line one colour, keep it out of body text, and keep project illustrations labelled as conceptual.
