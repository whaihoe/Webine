# Webine motion and scene configuration

The current homepage uses one coordinated scene controller. Settings and layout compositions live in `src/config/experience.ts`.

| Feature | Current state | Dedicated stage |
|---|---|---|
| General motion presets | Disabled | Reserved for later global polish, with component feedback already tokenised |
| Persistent particles | Enabled across all six Home scenes | Homepage narrative |
| Smooth scrolling | Enabled on fine-pointer desktop layouts, native on mobile | Stage 3 onward |
| Signal Grid response | Enabled only for the hero and closing CTA | Homepage narrative |
| Page transitions | Disabled | Stage 21 |

The static HTML and CSS composition must remain complete when every feature is disabled. Future implementations should read this configuration instead of creating separate hardcoded switches inside page components.

## Current scene contract

The Home route registers `hero`, `reach`, `work`, `interlude`, `process` and `closing`. A single GSAP timeline owns the first-load breathing period, particle gathering and interface reveal. It runs once per browsing session, uses a shorter return entry and completes immediately when the visitor scrolls or interacts early. Later section-bottom geometry owns each formed mark's reversible release, not its initial formation.

The selected-work runway pins on desktop, tablet and mobile. Normal vertical scrolling moves the rendered track horizontally, with no custom wheel interception or nested touch scroller. The final chapter card stops at the viewport centre after 70 percent of the scrubbed timeline. The track then remains fixed while that same card expands to the full viewport. The runway no longer sends progress to the particle shader because particles remain hidden for the whole work chapter.

The HTML process line and node states use their centre-based progress. Particle motion uses two additional geometry-derived values, an earlier intake approach and the centred outlet release. All three are recalculated from the same live line rectangle, so reverse scrolling reverses the illusion without callback-owned state.

The refined particle timing uses two geometric measurements from the same timeline line:

- CSS `--timeline-progress` begins when the line top reaches viewport centre and controls fill and nodes.
- `timelineIntakeProgress` begins earlier and controls release from the interlude, dispersed travel, point gathering and staggered contact fade.
- `timelineReleaseProgress` begins when the line bottom reaches viewport centre and controls the small-to-large outlet field, dispersion and closing formation.

Hero, reach and interlude now share one exact release threshold: the object remains snapped to its live section-local anchor until the bottom of that section reaches the middle of the viewport. Exit progress starts at that crossing and completes over the remaining half viewport. The closing arrow remains the intentional exception because it stays attached to the final section rather than transitioning into another particle form.

The selected-work chapter is now an intentional exception. Particles disperse and fade out before the runway becomes active, remain completely hidden throughout work and fade back in as a dispersed field at the quiet-interlude anchor. Only after that return do they gather and form the orbit.

The final runway item is the preview for chapter 04 rather than a generic end card. It uses the same label, title, statement and visual material as the quiet interlude. Once the card reaches the viewport centre, horizontal movement stops. Continued vertical scroll enlarges the card itself, crossfades from its compact preview to the full chapter layout and aligns it exactly over the real interlude before the pin releases. The orbit returns only after the full interlude takes over, so the preview and expansion remain unobstructed.

The interlude first releases from its orbit when the interlude bottom reaches viewport centre. This section exit is separate from timeline intake, leaving a dispersed field ready for the measured approach. `timelineIntakeProgress` then follows the live top point of the HTML line. Each particle has a stable contact threshold and fades only on contact, with most particles absorbed before the line top reaches viewport centre. Outlet release begins when the line bottom reaches viewport centre. Particles fade in from that point, disperse, travel to the closing anchor, gather and form.

The complete object slowly self-rotates while held. Fine-pointer movement adds restrained object travel and tilt, while the shader adds a local depth bulge. These idle offsets are local to the section anchor rather than a replacement for it. The closing object never fades, so the fully formed arrow scrolls away with the section instead of following the viewport into the footer.

Future refinements must keep the scene anchors and shared controller boundary. They must extend the same progress store and geometry rather than creating another canvas.
