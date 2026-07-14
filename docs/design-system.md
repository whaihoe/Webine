# Webine design system

This document is the repository source of truth for Stage 2. It follows a three-layer token structure so visual changes remain centralised and later effects do not scatter hardcoded values through page components.

## Direction

The current direction is the Slate Workshop. It combines an editorial grid, dark immersive scenes, quieter light sections and restrained blue accents inspired by the folded Webine mark.

The provisional blue and cyan values still need to be sampled against final logo files and accessibility-tested before launch. They are working tokens, not final brand claims.

## Token layers

1. `src/styles/tokens/primitives.css` stores raw colour, spacing, typography, radius and motion values.
2. `src/styles/tokens/semantic.css` assigns meaning such as canvas, surface, text, rule, brand and layout spacing. Light and dark themes override this layer.
3. `src/styles/tokens/components.css` controls component-specific values for the header, buttons, inputs, project media, dialogs and status labels.

Components should use semantic or component variables. Raw HSL values belong only in the primitive layer.

## Typography

- Primary intention: Railway
- Development fallback: Arial
- Accent: Georgia italic
- Synthetic bold and italic: disabled through `font-synthesis: none`

The fallback warning remains visible on the Home page until licensed Railway webfont files are supplied. Raleway must not be substituted.

## Responsive grid

| Width | Columns | Outer margin | Gutter |
|---|---:|---:|---:|
| 320 to 767 px | 4 | 16 px | 12 px |
| 768 to 1279 px | 8 | 32 px | 20 px |
| 1280 to 1599 px | 12 | 48 px | 24 px |
| 1600 px and above | 12 | centred remainder, at least 64 px | 28 px |

The content canvas is capped at 1504 px. Mobile layouts are recomposed by reading priority rather than scaled-down desktop arrangements.

## Colour behaviour

- Home starts dark and moves into a light foundation section.
- Works stays mostly light so future project imagery can control the colour.
- Contact stays dark with a light form surface.
- Admin uses a quiet light application surface.
- Blue is reserved for action, focus and selected states.
- Cyan remains a limited highlight for later dimensional lighting.

## Component states

Interactive components include default, hover, active, focus and disabled treatments where relevant. Focus is always visible. Touch controls have a minimum 44 px target. Disabled fields use both the native `disabled` attribute and a visible inactive treatment.

## Current experience boundary

The Home experience now uses the complete Slate Workshop rhythm: dark immersive scenes, rounded light editorial sheets, measured blue accents, Georgia phrases and fine grid lines. Signal Grid is active only in the hero and closing CTA, where a dim fine-pointer light passes through an otherwise near-background grid.

Tablet and desktop use the persistent GPU particle layer. Phones use lower-density section-owned 2D canvases, but both paths read from the same blue and cyan token palette and follow the same narrative forms. Lenis adds weight to wheel scrolling only. Touch scrolling stays native. Route transitions and a general site-wide reveal system remain disabled.
