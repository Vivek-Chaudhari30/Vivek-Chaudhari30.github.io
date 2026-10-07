# vivek-chaudhari30.github.io

Personal portfolio of Vivek Chaudhari, AI software engineer. Live at **https://vivek-chaudhari30.github.io**.

Plain HTML, CSS, and vanilla JS. No framework, no build step. GitHub Pages serves `main` from the repo root.

## Structure

```
index.html              Home: hero, profile, experience, impact, skills, demos, results, education, contact
html/work.html          Experience and projects in detail (anchors: #context-labs, #avenues-ai, #toya, #blastr-ai, #pagedserve, #grpo-zero)
html/skills.html        Skills grouped by area
html/about.html         About
html/contact.html       Contact
assets/css/site.css     All styles (light and dark via prefers-color-scheme)
assets/js/site.js       Mobile nav, reveal on scroll, headshot fallback, step-through demo engine
assets/icons/           Skill icons from Simple Icons (CC0), rendered as monochrome masks
images/                 VC monogram, favicon, Open Graph image, touch icon
```

## Interactive demos

The three demos on the home page (PagedServe, GRPO-Zero, Blastr AI) are defined in `assets/js/site.js`. Each demo is a list of step snapshots, and `render()` makes the stage match a snapshot, so Next, Replay, and jumping to any step all stay consistent. Demos autoplay once when scrolled into view, stop as soon as the visitor interacts, and never autoplay when `prefers-reduced-motion` is set.

## Run locally

```bash
python3 -m http.server 8765
```

Then open http://localhost:8765. Skill icons use root-relative paths, so serve from the repo root rather than opening the files directly.

## TODO

Placeholders to fill in. Search the repo for `TODO` to find each spot.

- [ ] **Résumé PDF**: add `assets/Vivek-Chaudhari-Resume.pdf`. Every "View résumé" button already links to it (marked `<!-- TODO: add resume PDF -->`).
- [ ] **LinkedIn URL**: replace every `href="#LINKEDIN_URL"` with the real profile URL (`index.html`, `html/contact.html`). Each is marked with a TODO comment.
- [ ] **Headshot**: add `images/vivek.jpg` (portrait, about 4:5, at least 600px wide). Until it exists, a "VC" initials tile is shown instead.
