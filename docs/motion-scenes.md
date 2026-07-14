# Webine motion and scene configuration

The current homepage uses one coordinated scene controller. Settings and layout compositions live in `src/config/experience.ts`.

| Feature | Current state | Dedicated stage |
|---|---|---|
| General motion presets | Disabled | Reserved for later global polish, with component feedback already tokenised |
| Persistent particles | Enabled across all six Home scenes | Homepage narrative |
| Smooth scrolling | Lenis enabled across public pointer and touch layouts | Stage 3 onward |
| Signal Grid response | Enabled only for the hero and closing CTA | Homepage narrative |
| Page transitions | Disabled | Stage 21 |

The static HTML and CSS composition must remain complete when every feature is disabled. Future implementations should read this configuration instead of creating separate hardcoded switches inside page components.

## Current scene contract

The Home route registers `hero`, `reach`, `work`, `interlude`, `process` and `closing`. A single GSAP timeline owns the first-load breathing period, hero gathering and interface reveal. It runs once per browsing session, uses a shorter return entry and completes immediately when the visitor scrolls or interacts early. After the hero entrance, each visual-form section owns its point, formation interval, hold and dispersion interval.

The hero has its own ScrollTrigger pin with no added scroll spacing. This keeps the hero composition fixed while the rounded Section 2 surface rises over it. The explicit layer order is hero background and Signal Grid, particle canvas, then hero typography and controls. CSS sticky is not used for this transition because the scene already relies on an explicit ScrollTrigger pin and controlled chapter handoff. As Section 3 approaches, an inner entrance layer begins up to 14 viewport-height units above its resting composition, capped at 120 px, and settles downward by the time the section top reaches 30 percent of the viewport. The pinned stage itself is never translated, preventing the entrance parallax from competing with runway pinning or chapter expansion transforms.

The selected-work runway pins on desktop, tablet and mobile. Normal vertical scrolling moves the rendered track horizontally, with no custom wheel interception or nested touch scroller. The final chapter card stops at the viewport centre after 70 percent of the scrubbed timeline. Particles fade fully during the horizontal sequence, return as a reduced-density field during expansion and begin gathering before the pin releases.

The HTML process line and node states use their centre-based progress. Particle motion uses two additional geometry-derived values, an earlier intake approach and the centred outlet release. All three are recalculated from the same live line rectangle, so reverse scrolling reverses the illusion without callback-owned state.

The refined particle timing uses two geometric measurements from the same timeline line:

- CSS `--timeline-progress` begins when the line top reaches viewport centre and controls fill and nodes.
- `timelineIntakeProgress` begins earlier and controls release from the interlude, dispersed travel, point gathering and staggered contact fade.
- `timelineReleaseProgress` begins when the line bottom reaches viewport centre and controls only point-origin emission and dispersion. Closing formation belongs to the closing section point.

Hero, reach, interlude and closing use independent motion ranges stored beside their own responsive anchor configuration. When a point enters the viewport, that section's particles begin forming around it. Formation reaches one when the point reaches viewport centre. The object then stays attached to the moving point until it crosses the top edge, where that section's dispersion begins. Reverse scrolling derives the same states from the same point geometry.

The selected-work chapter remains an intentional shape exception. It owns no settled target. Visibility starts falling once reach dispersion reaches 18 percent and reaches zero by 78 percent, before the runway pin begins. It remains invisible through horizontal work, then fades back from 70 to 84 percent while the chapter card expands.

The final runway item is the preview for chapter 04 rather than a generic end card. Once the card reaches the viewport centre, horizontal movement stops. Continued vertical scroll enlarges the card shell, fades its compact preview and aligns it exactly over the real interlude before the pin releases. The card does not render a second copy of the full chapter. Other project cards fade during expansion, so the one real interlude layout takes over without doubled content or a dark card overlap.

When runway progress reaches the completed `expanded` phase, the generated pin spacer returns to the normal stacking level. This is required because GSAP copies the runway's earlier scene layer onto the spacer. Without that release, the now-empty expanded card surface can remain above the real interlude and hide its text.

The expanding card also owns a reversible formation value from 70 to 88 percent of runway progress. It forms the interlude orbit at the real section point while that point is still below the viewport. The point therefore enters already formed, with no virtual position or second particle target.

Particle uniforms use a restrained damping value and the runway uses a 1.45 second scrub. Lenis uses a 1.35 smoothing value and 0.88 wheel speed. Touch layouts use a small 0.12 sync lerp, which adds weight without heavily delaying direct input. Mobile particle rendering is demand-driven at 30 FPS and its scene measurement loop settles after 240 ms instead of continuing for 1.2 seconds.

Zero-valued formation and dispersion uniforms release shader ownership immediately. Values still ease inside an active range, but a later scene cannot remain active through an asymptotic value after reverse scrolling.

The interlude disperses when its own point crosses the viewport top. `timelineIntakeProgress` then follows the live top point of the HTML line. Each particle has a stable contact threshold and fades only on contact, with most particles absorbed before the line top reaches viewport centre. Outlet release begins when the line bottom reaches viewport centre. Particles fade in from that point and disperse. When the closing point enters, its independent formation progress gathers that field into the telephone handset and completes at viewport centre.

The complete object slowly self-rotates while held. Fine-pointer movement adds restrained object travel and tilt, while the shader adds a local depth bulge. These idle offsets are local to the section anchor rather than a replacement for it. The closing object never fades, so the fully formed handset scrolls away with the section instead of following the viewport into the footer.

Future refinements must keep the scene anchors and shared controller boundary. They must extend the same progress store and geometry rather than creating another canvas.
