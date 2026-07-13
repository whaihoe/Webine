# Webine component inventory

## Implemented in Stage 2

| Component | Purpose | Current states |
|---|---|---|
| `WebineBrand` | Logo and working text wordmark | Default and focus |
| `SiteHeader` | Public navigation shell | Dark and light |
| `MobileMenu` | Labelled full-screen mobile navigation | Closed, open, current page and focus |
| `SiteFooter` | Public navigation, location and pending contact area | Dark |
| `ButtonLink` | Primary and secondary navigation actions | Primary, outline, quiet, hover and focus |
| `SectionHeading` | Editorial section index, title and explanation | Light and dark through tokens |
| `FormField` | Form structure and field styling | Disabled preview |
| `SiteShell` | Public header, main content and footer composition | Dark or light header |
| `WorkspaceShell` | Reserved Admin application frame | Mobile strip and desktop sidebar |
| `RouteEffects` | Page title, route announcement, scroll and heading focus | Push, replace and browser history |
| `AppErrorBoundary` | Application failure fallback | Error |

## Route compositions

- Home: dark hero, static identity object and light foundation section
- Works: light editorial introduction, 8 and 4-column project system preview and honest empty state
- Contact: 5 and 7-column split on desktop with a disabled light form preview
- Admin: 264 px desktop sidebar and flexible content canvas
- Preview: restrained light reserved-route composition
- Not found: dark action-oriented fallback

## Later components

The following components remain outside Stage 2: live particles, smooth scrolling, project filters, project case-study panels, the enquiry pipeline, CMS-generated forms, media upload controls, process timeline and route transitions.
