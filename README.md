# Raman Metal Industries — landing page

Static site built to match the Figma design
([website design file](https://www.figma.com/design/EyZDHHFjXFfdqu7Cct3mcz/MAHARANI-INDUSTRIES-website?node-id=2-2) —
the Figma file still carries the previous company name).

## Run it

```bash
node server.js
```

Then open <http://localhost:4173>. Any static file server works — there is no build step.

## Structure

```
index.html                 all page markup
assets/css/style.css       all styles (design tokens at the top)
assets/js/main.js          nav, carousel, form validation, smooth scroll
assets/images/             logo, favicon, photography, topographic background
server.js                  tiny zero-dependency static server for local preview
```

## Brand

| Asset | File | Used at |
|---|---|---|
| Logo | `assets/images/logo.webp` (480 x 144) | header 58px tall (40px below 860), footer 240px wide |
| Logo (original) | `assets/images/raman-metal-industries logo.webp` (1568 x 470) | source file, not linked from the page |
| Favicon | `assets/images/favicon.png` (180 x 180) | cropped from the R + tap mark |

The supplied logo is a light plate with the mark printed on it, so it is placed as
an image badge rather than recoloured — `border-radius: 5px` on `.logo img` clips
the white corners left by the plate's rounded edge.

## Design tokens

Measured from the Figma render rather than guessed — sizes are in `:root` at the
top of `style.css`.

| Token | Value |
|---|---|
| Ink / dark sections | `#444845` / `#414542` |
| Form panel | `#ededed` |
| Display face | Playfair Display 700 |
| Text face | Inter 300-700 |
| H1 | 63px / 71px |
| H2 | 47px / 58px (35px in the "Transform Your Space" card, 37px in Quality) |
| Body | 16px / 25px — hero lede 18px / 27px |
| Content column | 1200px, 120px gutters at 1440px |

Verified against the design render at 1440px: **mean pixel difference 8.8/255 (3.4%)**,
with every section landmark within 8px of its position in Figma.

## Responsive

The hero fills the viewport: `min-height:100svh`, with `100vh` and a 686px pixel
fallback layered under it so it never sits behind a mobile URL bar. `min-height`
rather than `height` means the box grows instead of clipping when the copy needs
more room than the viewport has.

Display type is fluid below 1440px — each `clamp()` is a straight line through the
Figma value at 1440 and a comfortable small-screen value at 360, so sizes ramp
smoothly instead of stepping at a breakpoint. At 1440px and above the fixed
`:root` values apply and the rendering is unchanged.

Width breakpoints at 1440 / 1200 / 1100 / 860 / 520 / 360px, plus a
`(max-height:560px) and (orientation:landscape)` block **last in the file** for
landscape phones — it has to come after the width queries to win, since those set
`.hero` padding at equal specificity.

Verified with no horizontal overflow at 1920, 1600, 1440, 1366, 1280, 1100, 1024,
900, 860, 768, 700, 640, 540, 480, 414, 390, 375, 360 and 320px, and in landscape
at 812x375, 667x375 and 568x320. The hero measures exactly one viewport at every
one of those except 320x700 and 568x320, where the copy is taller than the
viewport and the box grows — the intended behaviour.

Below 860px the header collapses to a hamburger menu, the two-column sections
stack, cards narrow to `clamp(232px,78vw,348px)` so a slice of the next one shows,
and the "Transform Your Space" band swaps to `cta-transform-top.jpg`.

## Carousel

`assets/js/main.js` drives it. Endless in both directions: copies of the first
cards trail the real ones and copies of the last lead them, and when the index
lands in a cloned region the track shifts by exactly one full set — the belt
repeats with that period, so the swap cannot be seen. The clone count adapts to
how many cards fit, so it works for any number of cards.

- Touch swipe and mouse drag, tracking the pointer 1:1 and settling on the nearest
  card on release. A fast flick always advances one; a few pixels springs back.
- A mostly-vertical gesture is released immediately, so the page still scrolls
  under a finger. `touch-action:pan-y` on the viewport backs this up in CSS.
- The click a browser fires after a drag is swallowed.
- Left/Right arrow keys work when the carousel has focus. Clones are `aria-hidden`
  and removed from the tab order.
- Honours `prefers-reduced-motion`, and never depends on `transitionend` arriving
  — a timer is the backstop, because a tab that is not painting never advances its
  transitions at all.

## Product range

Ten cards, all with photography. Cards are 348 x 369, exported at 2x (696 x 738px).

| Card | Image | Source |
|---|---|---|
| Shower Mixers | `product-1.jpg` | cut from the design export |
| Basin Mixers | `product-basin-mixer.jpg` | stock, see below |
| Wall-Mounted | `product-2.jpg` | cut from the design export |
| Shower Heads | `product-shower-head.jpg` | stock, see below |
| Wash Basins | `product-wash-basin.jpg` | stock, see below |
| Bathtubs | `product-bathtub.jpg` | cut from the design export |
| Commodes | `product-commode.jpg` | stock, see below |
| Kitchen Sinks | `product-kitchen-sink.jpg` | stock, see below |
| Mirrors | `product-mirror.jpg` | cut from the design export |
| PVC Pipes | `product-pvc.jpg` | stock, see below |

Bathtubs and Mirrors were cut from the design's own photography, since the export
only contained two dedicated product shots (the rest of the carousel ran off the
right edge of the frame and could not be recovered).

> **The six non-Figma category names are an inference**, taken from the logo (a tap)
> and the existing range, not from an actual product catalogue. Confirm them against
> what the company really manufactures and rename or reorder freely — each card is
> one `<li class="pcard">` in `index.html`, and the carousel adapts to any count.

### Stock photography

Every stock image is **CC0 / public domain**, so no attribution is required and
they are cleared for commercial use. Sources kept here for the record:

| File | Source | Licence | Edits |
|---|---|---|---|
| `product-basin-mixer.jpg` | [rawpixel 6023406](https://www.rawpixel.com/image/6023406/water-tap-free-public-domain-cc0-photo) | CC0 | crop centred on the tap; desaturated, mild contrast + sharpen |
| `product-shower-head.jpg` | [rawpixel 5911916](https://www.rawpixel.com/image/5911916/shower-head-free-public-domain-cc0-image) | CC0 | crop; desaturated to kill a warm-beige cast, brightened |
| `product-wash-basin.jpg` | [rawpixel 6025140](https://www.rawpixel.com/image/6025140/water-tap-free-public-domain-cc0-photo) | CC0 | crop lowered so the bowl and chrome waste dominate; desaturated |
| `product-kitchen-sink.jpg` | [rawpixel 5920469](https://www.rawpixel.com/image/5920469/free-water-tap-public-domain-cc0-photo) | CC0 | crop framed to keep the mixer body unsliced; desaturated |
| `product-commode.jpg` | rawpixel, "Free open toilet seat bathroom" | CC0 | crop; mild brightness/contrast lift |
| `product-pvc.jpg` | [Orange plastic pipes](https://commons.wikimedia.org/wiki/File:Orange_plastic_pipes.jpg), Wikimedia Commons | CC0 | crop; desaturated to neutral grey to match the range |

The existing cards are light, chrome-and-white and shot close on the product, so
several of these needed desaturating to stop them breaking the row. That is the
step worth repeating if you add more.

### Categories with no usable photography

**Angle Valves** and **Bathroom Accessories** were prepared and then dropped. The
free-licence pool has essentially nothing for either: angle valve / stop cock /
brass fitting returns only historical engineering drawings and trade-catalogue
scans, and the only CC0 chrome bathroom hardware found was a near-black tiled
bathroom that would have broken the row. Searched across Openverse and Wikimedia
in English and German (towel rail, towel bar, robe hook, grab rail,
Handtuchhalter, Handtuchtrockner, Seifenspender, Eckventil, and others).

Add either category back as soon as you have a real product shot — a 348 x 369
crop exported at 2x, plus one `<li class="pcard">` and one submenu entry.

## Notes on the images

The design was supplied as a single flattened PNG export, so every photo had the
overlay text and scrims composited into it. The photos cut from that export had
their baked-in text removed by masking the glyphs and inpainting, so the captions
can be real HTML. Two consequences worth knowing:

- **Faint ghosting** may remain where large headline text sat (hero, the two CTA
  bands). Live text is positioned over those exact spots, so it does not show in
  normal use — but replacing these with the original photos from Figma would be
  cleaner.
- **`cta-transform.jpg`** and the old `quality.jpg` had the white overlay card
  baked in. The quality image is now cropped to the region the card never covers;
  the CTA band uses a separate top crop below 860px.

## Contact form

`assets/js/main.js` validates the fields and shows a confirmation, but there is
no backend. Point it at your endpoint where the comment says so.

**Still to do before launch:** the phone number and email in the footer are
placeholders from the design (`123 456 7890`, `info@ramanmetalindustries.com`).
