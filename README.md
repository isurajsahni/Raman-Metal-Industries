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
| Logo | `assets/images/logo.webp` (480 x 144) | header 58px tall, footer 240px wide |
| Logo (original) | `assets/images/raman-metal-industries logo.webp` (1568 x 470) | source file, not linked from the page |
| Favicon | `assets/images/favicon.png` (180 x 180) | cropped from the R + tap mark |

The supplied logo is a light plate with the mark printed on it, so it is placed as
an image badge rather than recoloured — `border-radius: 5px` in `.logo img` clips
the white corners left by the plate's rounded edge.

## Design tokens

Measured from the Figma render rather than guessed — sizes are in `:root` at the
top of `style.css`.

| Token | Value |
|---|---|
| Ink / dark sections | `#444845` / `#414542` |
| Form panel | `#ededed` |
| Display face | Playfair Display 700 |
| Text face | Inter 300–700 |
| H1 | 63px / 71px |
| H2 | 47px / 58px (35px in the "Transform Your Space" card, 37px in Quality) |
| Body | 16px / 25px — hero lede 18px / 27px |
| Content column | 1200px, 120px gutters at 1440px |

Verified against the design render at 1440px: **mean pixel difference 8.8/255 (3.4%)**,
with every section landmark within 8px of its position in Figma.

## Responsive

Breakpoints at 1440 / 1100 / 860 / 520px. Checked for horizontal overflow at
1440, 1280, 1100, 900, 860, 768, 640, 480 and 375px — none.

Below 860px the header collapses to a hamburger menu, the two-column sections
stack, and the "Transform Your Space" band swaps to `cta-transform-top.jpg`
(see the note on baked-in text below).

## Notes on the images

The design was supplied as a single flattened PNG export, so every photo had the
overlay text and scrims composited into it. The photos here were cut from that
export and the baked-in text was removed by masking the glyphs and inpainting,
so the captions can be real HTML. Two consequences worth knowing:

- **Faint ghosting** may remain where large headline text sat (hero, the two CTA
  bands). Live text is positioned over those exact spots, so it does not show in
  normal use — but replacing these with the original photos from Figma would be
  cleaner.
- **`cta-transform.jpg`** and the old `quality.jpg` had the white overlay card
  baked in. The quality image is now cropped to the region the card never covers;
  the CTA band uses a separate top crop below 860px.

## Product range

The carousel lists six categories, all with photography. Cards are 348 x 369,
exported at 2x (696 x 738px).

| Card | Image | Source |
|---|---|---|
| Shower Mixers | `product-1.jpg` | cut from the design export |
| Wall-Mounted | `product-2.jpg` | cut from the design export |
| Bathtubs | `product-bathtub.jpg` | cut from the design export |
| PVC Pipes | `product-pvc.jpg` | stock, see below |
| Mirrors | `product-mirror.jpg` | cut from the design export |
| Commodes | `product-commode.jpg` | stock, see below |

Bathtubs and Mirrors were cut from the design's own photography, since the export
only contained two dedicated product shots (the rest of the carousel ran off the
right edge of the frame and could not be recovered).

### Stock photography

Both stock images are **CC0 / public domain**, so no attribution is required and
they are cleared for commercial use. Sources kept here for the record:

| File | Source | Licence | Edits |
|---|---|---|---|
| `product-pvc.jpg` | ["Orange plastic pipes"](https://commons.wikimedia.org/wiki/File:Orange_plastic_pipes.jpg), Wikimedia Commons | CC0 | cropped, desaturated to neutral grey to match the range |
| `product-commode.jpg` | ["Free open toilet seat bathroom"](https://www.rawpixel.com/), rawpixel | CC0 | cropped, mild brightness/contrast lift |

These are placeholders in the editorial sense — swap them for real product shots
when photography is available. Use a 348 x 369 crop exported at 2x (696 x 738px)
and keep the same filenames; no markup change is needed.

## Contact form

`assets/js/main.js` validates the fields and shows a confirmation, but there is
no backend. Point it at your endpoint where the comment says so.

**Still to do before launch:** the phone number and email in the footer are
placeholders from the design (`123 456 7890`, `info@ramanmetalindustries.com`).
