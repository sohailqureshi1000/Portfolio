# Sohail Razzaq — Developer Portfolio

My personal developer portfolio, built to showcase my projects, technical skills, and certifications as a Computer Science student.

**Live site:** https://sohail-razzaq.vercel.app/

## About

This portfolio highlights my work across frontend development, C++/OOP, and full-stack projects as I build toward becoming a full-stack developer. It includes:

- A project showcase (eCommerce UI, ARS Shopping Mart, this portfolio, and a Weather App)
- Skills overview
- Certifications and achievements
- A contact section with links to GitHub, LinkedIn, and a booking link

## Built With

- HTML5
- CSS3
- Vanilla JavaScript
- Font Awesome (icons)
- Google Fonts (Bricolage Grotesque, Inter)

## Running Locally

This is a static site — no build step required.

1. Clone the repo:
   ```
   git clone https://github.com/sohailqureshi1000/portfolio.git
   ```
2. Open `index.html` in your browser, or serve it with any static server (e.g. the VS Code "Live Server" extension).

## Deployment

Deployed on Vercel https://sohail-razzaq.vercel.app/ .

## License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

## Contact

- GitHub: [github.com/sohailqureshi1000](https://github.com/sohailqureshi1000)
- LinkedIn: [linkedin.com/in/sohail-razzaq](https://www.linkedin.com/in/sohail-razzaq)
- Email: sohailqureshii1000@gmail.com

# FE-AA3 — Signature Hero: A Fullscreen Shader

A custom aurora-style fragment shader, integrated as the background of the
existing hero section (`<section class="hero" id="home">`) on my portfolio —
not a copy of any playground default: palette, mouse behavior, and sizing
were all rewritten to fit this specific site.

**Live:** https://sohail-razzaq.vercel.app/
**Repo:** https://github.com/sohailqureshi1000/Portfolio

## What changed in the repo

- **New file:** `shader-hero.js` — all the WebGL setup + GLSL shader source
- **`index.html`** — one `<canvas id="shader-hero-canvas">` added inside the
  hero section (after the two `.hero-blob` divs), and one `<script>` tag
  before `</body>`
- **`style.css`** — one new rule (`#shader-hero-canvas`) positioning the
  canvas absolutely behind the existing hero content, which already sits at
  `z-index: 1`

No existing markup, layout, or styling was removed — the shader sits behind
the current hero-blob glows and content, using the site's own `.hero`
(`position: relative; overflow: hidden;`) as its bounding box.

## Uniforms used

All three:
- `u_resolution` — the hero **section's** pixel size (not the full window —
  this hero scrolls with the page, it isn't fixed), used to aspect-correct
  the coordinate space
- `u_time` — drives the flow field animation
- `u_mouse` — cursor position relative to the hero section, smoothed; warps
  the sample coordinate toward the cursor and adds a soft glow near it

## What each block of the shader does (in my own words)

1. **`hash` / `noise`** — cheap pseudo-random value noise from a sine-hash
   trick; no texture needed. Raw material everything else builds on.
2. **`fbm`** — stacks 5 octaves of that noise at shrinking amplitude/growing
   frequency. One octave looks like static; five stacked look like clouds.
3. **coordinate setup** — normalize `gl_FragCoord` to 0..1, recenter to
   -0.5..0.5, multiply x by aspect ratio so the noise isn't stretched.
4. **domain warp (mouse influence)** — measures each pixel's distance to the
   mouse and nudges the sample point toward it before feeding it into `fbm`
   — the flow field leans toward the cursor without moving the whole canvas.
5. **flow field** — two `fbm` layers scrolling at different speeds/directions
   (driven by `u_time`), combined into a third `fbm` pass (`bands`) — this
   layering gives the wavy, layered aurora-band look.
6. **palette** — `mix()` between three flat colors pulled straight from this
   repo's `style.css` custom properties: `deep` = `--bg` (#060607), `bright`
   = `--accent` (#2DD4BF), `teal` = a muted mid-tone between them — so the
   shader always matches the site's theme, not a hardcoded guess.
7. **cursor glow** — adds bright color near the mouse on top of the palette,
   so the mouse influence reads visually, not just structurally.
8. **vignette** — darkens the edges so the text-heavy left side sits on the
   calmest part of the image.
9. **grain** — one more cheap `hash` call per pixel per frame, added as tiny
   noise to the final color, to break up banding.
10. **alpha fade** — the canvas is semi-transparent at the edges
    (`gl_FragColor.a`) so it blends into the page background instead of
    showing a hard rectangle where the hero section ends.

## Reduced-motion / perf fallback (one-liner)

`prefers-reduced-motion: reduce` hides the canvas entirely and falls back to
the existing `.hero-blob` elements, which this repo's own accessibility media
query already freezes (`animation: none`) — so reduced-motion users see a
static soft-teal glow, no separate fallback markup needed; everyone else gets
devicePixelRatio capped at 2, and the render loop fully stops (not just
throttled) via `visibilitychange` when the tab is hidden.

## Status

- [x] Shipped on the live hero — deployed and verified visually
- [x] Mouse influence confirmed (flow leans toward cursor + glow)
- [x] `prefers-reduced-motion` verified with OS toggle
- [x] Verified smooth on a phone
- [x] Verified render loop pauses on tab switch (no console errors)

## Mentor walkthrough notes

If asked to modify on request, the levers are:
- **Speed** → the `0.06` multiplier on `t = u_time * 0.06`
- **Palette** → the three `vec3` colors (`deep`, `teal`, `bright`) — these
  are the site's own `--bg` / `--accent` values converted to 0–1 GLSL floats
- **Mouse pull strength** → the `0.3` multiplier in the `pull` line
- **Band complexity** → the `for` loop count in `fbm` (currently 5 octaves)
- **Grain amount** → the `0.03` multiplier on the grain line