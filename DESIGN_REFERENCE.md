# Design reference — Connected Systems Portfolio

## Official design source

- Figma Make project: **Connected Systems Portfolio**
- URL: https://www.figma.com/make/iVbUMBEws782H4OZc96kfO/Connected-Systems-Portfolio?t=SZu6xTRTJSgPxai5-1
- To reopen it: open the URL while signed in to the Figma account that owns the project (or find it under Drafts / Recents in Figma as "Connected Systems Portfolio").

## Preserved local implementation (V1)

| Item | Value |
| --- | --- |
| Repository | `~/portfolio-line-experiment` (`/Users/akshat/portfolio-line-experiment`) |
| Branch | `line-animation-experiment` |
| Preservation tag | `portfolio-dual-line-v1-preserved` |
| Preserved commit | `4f5045d33e114da76a691c4bd490bc666b4eb7d7` |
| Base | `portfolio-v1-preserved` (`d5ce736`) in the separate `~/portfolio` repo, which is not modified by this work |
| Screenshots | `~/portfolio-line-experiment/screens/{1440,1024,768,390}/` (13 images each) and `screens/reduced-motion-work.png`. Git-ignored: they exist only on this machine, so back them up separately. |

The tag points at the implementation commit itself; this file was added in a later, documentation-only commit.

### Known difference between this document's brief and the code at the tag

The V1 code contains **one** scroll-drawn line (`src/components/NerveLine.tsx`): an organic SVG spine with a per-segment gradient between accent colours, twigs, and glowing nodes. It runs from the Experience section to Contact, not the whole page. There is **no separate lime-green companion line** and the line does not start at the hero. If the Figma Make design specifies a blue line plus a lime-green companion running the full page, that is not yet implemented here. Compare the Figma project against the tag before relying on it, and treat that gap as the first item to resolve.

## Run the local implementation

```sh
cd ~/portfolio-line-experiment
npm ci
npm run dev        # http://localhost:5173
npm run build      # production build into dist/
npx tsc --noEmit   # TypeScript check
```

Indexing stays disabled (`noindex` meta tag and `public/robots.txt`). There is no remote and nothing is deployed.

## Workflow for future design changes

1. Reopen the same Connected Systems Portfolio project in Figma Make (URL above). Do not create another Figma project or restart the design for routine changes.
2. Start from the existing design and modify only the sections or components that are identified.
3. Preserve the visual identity and the line animation unless a change to them is explicitly requested.
4. Compare against the preserved V1 (`git diff portfolio-dual-line-v1-preserved`, or check it out; screenshots above) to see what changed.
5. Keep previous versions recoverable: use Figma Make's version history, and branch from the tag (`git switch -c <name> portfolio-dual-line-v1-preserved`) rather than editing it.
6. Update the React implementation here only after the design changes are approved.

## Restore V1

```sh
git switch -c restore-v1 portfolio-dual-line-v1-preserved
```
