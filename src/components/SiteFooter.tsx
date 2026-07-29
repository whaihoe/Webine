import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { gsap } from "../animation/scroll-runtime";
import { publicNavigation } from "../config/navigation";
import { WebineBrand } from "./WebineBrand";
import { useSiteSettings } from "../content/SiteSettingsProvider";

let footerParticleBrushPromise: ReturnType<typeof importFooterParticleBrush> | null = null;

function importFooterParticleBrush() {
  return import("./FooterParticleBrush").then(({ FooterParticleBrush }) => ({
    default: FooterParticleBrush,
  }));
}

function loadFooterParticleBrush() {
  footerParticleBrushPromise ??= importFooterParticleBrush();
  return footerParticleBrushPromise;
}

const LazyFooterParticleBrush = lazy(loadFooterParticleBrush);

const footerRevealThresholds = Array.from({ length: 101 }, (_, index) => index / 100);

const transparentBackgrounds = new Set([
  "transparent",
  "rgba(0, 0, 0, 0)",
  "rgba(0,0,0,0)",
]);

function findPreviousSurface(main: HTMLElement) {
  const sections = Array.from(main.querySelectorAll<HTMLElement>("section"));
  return sections[sections.length - 1] ?? (main.lastElementChild as HTMLElement | null) ?? main;
}

function readSurfaceBackground(surface: HTMLElement, main: HTMLElement) {
  let current: HTMLElement | null = surface;

  while (current) {
    const styles = getComputedStyle(current);
    const background = styles.backgroundColor.trim();

    if (background && !transparentBackgrounds.has(background)) {
      return background;
    }

    if (current === main) break;
    current = current.parentElement;
  }

  const canvas = getComputedStyle(surface).getPropertyValue("--color-canvas").trim();
  return canvas ? `hsl(${canvas})` : "hsl(var(--primitive-slate-950))";
}

export function SiteFooter() {
  const settings = useSiteSettings();
  const routeLocation = useLocation();
  const revealZoneRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const footerTimelineRef = useRef<ReturnType<typeof gsap.timeline> | null>(null);
  const [particleBrushIsNear, setParticleBrushIsNear] = useState(false);
  const [footerIsRevealed, setFooterIsRevealed] = useState(false);
  const [footerAnimationIsActive, setFooterAnimationIsActive] = useState(false);
  const publicEmail = settings.contact.email || import.meta.env.VITE_PUBLIC_CONTACT_EMAIL?.trim();
  const year = new Date().getFullYear();

  useLayoutEffect(() => {
    const revealZone = revealZoneRef.current;
    const footer = footerRef.current;
    const main = revealZone
      ?.closest<HTMLElement>(".site-shell")
      ?.querySelector<HTMLElement>(".site-main");

    if (!revealZone || !footer || !main) return;

    let geometryFrame = 0;

    const syncFooterGeometryAndBackground = () => {
      const previousSurface = findPreviousSurface(main);
      const background = readSurfaceBackground(previousSurface, main);
      const footerHeight = Math.ceil(footer.getBoundingClientRect().height);
      const height = `${footerHeight}px`;

      if (revealZone.style.getPropertyValue("--site-footer-reveal-background") !== background) {
        revealZone.style.setProperty("--site-footer-reveal-background", background);
      }
      if (revealZone.style.getPropertyValue("--site-footer-height") !== height) {
        revealZone.style.setProperty("--site-footer-height", height);
      }
    };

    const scheduleFooterGeometrySync = () => {
      if (geometryFrame) return;

      geometryFrame = window.requestAnimationFrame(() => {
        geometryFrame = 0;
        syncFooterGeometryAndBackground();
      });
    };

    syncFooterGeometryAndBackground();

    const resizeObserver = new ResizeObserver(scheduleFooterGeometrySync);
    resizeObserver.observe(footer);

    const mutationObserver = new MutationObserver(scheduleFooterGeometrySync);
    mutationObserver.observe(main, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    window.addEventListener("resize", scheduleFooterGeometrySync, { passive: true });

    return () => {
      window.cancelAnimationFrame(geometryFrame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", scheduleFooterGeometrySync);
    };
  }, [routeLocation.pathname]);

  useEffect(() => {
    const revealZone = revealZoneRef.current;
    const footer = footerRef.current;
    const main = revealZone
      ?.closest<HTMLElement>(".site-shell")
      ?.querySelector<HTMLElement>(".site-main");

    if (!revealZone || !footer || !main || !("IntersectionObserver" in window)) {
      if (revealZone && footer) {
        revealZone.style.setProperty(
          "--site-footer-visible-height",
          `${Math.ceil(footer.getBoundingClientRect().height)}px`,
        );
      }
      setParticleBrushIsNear(true);
      setFooterIsRevealed(true);
      setFooterAnimationIsActive(true);
      return;
    }

    let observedSurface: HTMLElement | null = null;
    let previousSurfaceIsVisible = false;
    let revealZoneIsVisible = false;

    const syncParticleState = () => {
      if (previousSurfaceIsVisible) {
        void loadFooterParticleBrush();
      }

      setParticleBrushIsNear(revealZoneIsVisible);
    };

    const surfaceObserver = new IntersectionObserver(
      ([entry]) => {
        previousSurfaceIsVisible = entry.isIntersecting;
        syncParticleState();
      },
      { threshold: 0 },
    );

    const observeCurrentSurface = () => {
      const nextSurface = findPreviousSurface(main);

      if (nextSurface === observedSurface) return;
      if (observedSurface) surfaceObserver.unobserve(observedSurface);

      observedSurface = nextSurface;
      previousSurfaceIsVisible = false;
      surfaceObserver.observe(nextSurface);
      syncParticleState();
    };

    const revealObserver = new IntersectionObserver(
      ([entry]) => {
        const footerHeight = Math.max(1, footer.getBoundingClientRect().height);
        const visibleHeight = entry.isIntersecting
          ? Math.min(footerHeight, Math.max(0, entry.intersectionRect.height))
          : 0;
        const revealRatio = visibleHeight / footerHeight;

        revealZoneIsVisible = visibleHeight > 0;
        revealZone.style.setProperty(
          "--site-footer-visible-height",
          `${Math.ceil(visibleHeight)}px`,
        );
        setFooterIsRevealed(revealZoneIsVisible);
        setFooterAnimationIsActive(revealRatio >= 0.12);
        syncParticleState();
      },
      { threshold: footerRevealThresholds },
    );

    const mutationObserver = new MutationObserver(observeCurrentSurface);
    mutationObserver.observe(main, { childList: true, subtree: true });
    observeCurrentSurface();
    revealObserver.observe(revealZone);

    return () => {
      mutationObserver.disconnect();
      surfaceObserver.disconnect();
      revealObserver.disconnect();
      revealZone.style.removeProperty("--site-footer-visible-height");
    };
  }, [routeLocation.pathname]);

  useLayoutEffect(() => {
    const footer = footerRef.current;

    if (!footer) return;

    const brandItems = Array.from(
      footer.querySelectorAll<HTMLElement>('[data-footer-animate="brand"]'),
    );
    const headings = Array.from(
      footer.querySelectorAll<HTMLElement>('[data-footer-animate="heading"]'),
    );
    const links = Array.from(
      footer.querySelectorAll<HTMLElement>('[data-footer-animate="link"]'),
    );
    const bottomItems = Array.from(
      footer.querySelectorAll<HTMLElement>('[data-footer-animate="bottom"]'),
    );
    const animatedItems = [...brandItems, ...headings, ...links, ...bottomItems];

    footerTimelineRef.current?.kill();
    footerTimelineRef.current = null;
    gsap.killTweensOf(animatedItems);

    if (!footerAnimationIsActive) {
      gsap.set(brandItems, { autoAlpha: 0, y: 24 });
      gsap.set(headings, { autoAlpha: 0, y: 16 });
      gsap.set(links, { autoAlpha: 0, y: 18 });
      gsap.set(bottomItems, { autoAlpha: 0, y: 14 });
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out",
      },
    });

    timeline
      .to(brandItems, {
        autoAlpha: 1,
        y: 0,
        duration: 0.78,
        stagger: 0.09,
      })
      .to(
        headings,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          stagger: 0.08,
        },
        "-=0.54",
      )
      .to(
        links,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.68,
          stagger: 0.055,
        },
        "-=0.46",
      )
      .to(
        bottomItems,
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.64,
          stagger: 0.08,
        },
        "-=0.34",
      );

    footerTimelineRef.current = timeline;

    return () => {
      timeline.kill();
      if (footerTimelineRef.current === timeline) {
        footerTimelineRef.current = null;
      }
    };
  }, [footerAnimationIsActive, routeLocation.pathname]);

  return (
    <div
      ref={revealZoneRef}
      className="site-footer-reveal-zone"
      data-footer-revealed={footerIsRevealed ? "true" : "false"}
    >
      <footer ref={footerRef} className="site-footer theme-dark">
        <div className="site-container site-footer__stage">
          <div className="site-footer__frame">
            {particleBrushIsNear ? (
              <Suspense fallback={null}>
                <LazyFooterParticleBrush />
              </Suspense>
            ) : null}

            <div className="site-footer__content">
              <div className="site-footer__top">
                <div className="site-footer__identity">
                  <div data-footer-animate="brand">
                    <WebineBrand />
                  </div>
                  <p data-footer-animate="brand">{settings.footer.text}</p>
                </div>

                <div className="site-footer__column">
                  <span className="site-footer__heading" data-footer-animate="heading">Navigate</span>
                  <nav className="site-footer__nav" aria-label="Footer navigation">
                    {publicNavigation.map((item) => (
                      <Link key={item.href} className="site-footer__link" data-footer-animate="link" to={item.href}>
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>

                <div className="site-footer__column">
                  <span className="site-footer__heading" data-footer-animate="heading">Contact</span>
                  <div className="site-footer__actions">
                    <Link className="site-footer__link" data-footer-animate="link" to="/contact">
                      Start a conversation
                    </Link>
                    {publicEmail ? (
                      <a className="site-footer__link site-footer__link--muted" data-footer-animate="link" href={`mailto:${publicEmail}`}>
                        {publicEmail}
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>


              <div className="site-footer__bottom">
                <span className="site-footer__legal" data-footer-animate="bottom">
                  <span>© {year} {settings.footer.copyrightLabel}</span>
                  <span aria-hidden="true"> / </span>
                  <Link className="site-footer__bottom-link" to="/contact#privacy">Privacy</Link>
                </span>

                <span
                  className="site-footer__credit"
                  data-footer-animate="bottom"
                  aria-label="Made and developed by Webine"
                  data-cursor-static="true"
                  tabIndex={0}
                >
                  <span aria-hidden="true">Made</span>
                  <span className="site-footer__credit-reveal" aria-hidden="true">&nbsp;and developed</span>
                  <span aria-hidden="true">&nbsp;by Webine</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
