import { gsap } from "gsap";
import { useLayoutEffect, type RefObject } from "react";
import { useParticleController } from "./ParticleSceneController";

type HeroEntranceTimelineProps = {
  rootRef: RefObject<HTMLElement | null>;
};

const INTRO_SESSION_KEY = "webine-hero-intro-complete";

function hasCompletedIntro() {
  try {
    return window.sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberCompletedIntro() {
  try {
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    // The entrance still works when session storage is unavailable.
  }
}

export function HeroEntranceTimeline({
  rootRef,
}: HeroEntranceTimelineProps) {
  const { store } = useParticleController();

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      store.setIntroProgress(1);
      return;
    }

    const header = document.querySelector<HTMLElement>("[data-site-header]");
    const eyebrow = root.querySelector<HTMLElement>(
      '[data-hero-intro="eyebrow"]',
    );
    const headlineLines = Array.from(
      root.querySelectorAll<HTMLElement>('[data-hero-intro="headline-line"]'),
    );
    const description = root.querySelector<HTMLElement>(
      '[data-hero-intro="description"]',
    );
    const actions = root.querySelector<HTMLElement>(
      '[data-hero-intro="actions"]',
    );
    const scrollCue = root.querySelector<HTMLElement>(
      '[data-hero-intro="scroll-cue"]',
    );
    const revealElements = [
      eyebrow,
      ...headlineLines,
      description,
      actions,
      scrollCue,
    ].filter((element): element is HTMLElement => Boolean(element));
    const navigationEntry = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    const shouldRestoreImmediately =
      navigationEntry?.type === "back_forward" || window.scrollY > 8;

    if (shouldRestoreImmediately) {
      store.setIntroProgress(1);
      root.dataset.heroIntroState = "complete";
      return;
    }

    const fullEntrance = !hasCompletedIntro();
    const introState = { progress: 0 };
    let completed = false;
    root.dataset.heroIntroState = "running";
    store.setIntroProgress(0);

    gsap.set(revealElements, { autoAlpha: 0, y: fullEntrance ? 28 : 14 });
    if (header) {
      gsap.set(header, { autoAlpha: 0, y: -14 });
    }

    const complete = () => {
      if (completed) {
        return;
      }

      completed = true;
      store.setIntroProgress(1);
      rememberCompletedIntro();
      root.dataset.heroIntroState = "complete";
      gsap.set(revealElements, { clearProps: "opacity,visibility,transform" });
      if (header) {
        gsap.set(header, { clearProps: "opacity,visibility,transform" });
      }
    };

    const timeline = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: complete,
    });
    const gatherStart = fullEntrance ? 0.4 : 0.04;

    timeline.to(introState, {
      progress: 1,
      duration: fullEntrance ? 0.85 : 0.34,
      ease: "power3.inOut",
      onUpdate: () => store.setIntroProgress(introState.progress),
    }, gatherStart);

    if (header) {
      timeline.to(header, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.3 : 0.18,
      }, fullEntrance ? 0.85 : 0.12);
    }
    if (eyebrow) {
      timeline.to(eyebrow, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.28 : 0.16,
      }, fullEntrance ? 1.08 : 0.19);
    }
    if (headlineLines.length > 0) {
      timeline.to(headlineLines, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.42 : 0.24,
        stagger: fullEntrance ? 0.1 : 0.04,
      }, fullEntrance ? 1.16 : 0.22);
    }
    if (description) {
      timeline.to(description, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.32 : 0.18,
      }, fullEntrance ? 1.55 : 0.4);
    }
    if (actions) {
      timeline.to(actions, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.32 : 0.18,
      }, fullEntrance ? 1.68 : 0.47);
    }
    if (scrollCue) {
      timeline.to(scrollCue, {
        autoAlpha: 1,
        y: 0,
        duration: fullEntrance ? 0.28 : 0.16,
      }, fullEntrance ? 1.82 : 0.54);
    }

    const finishImmediately = () => {
      timeline.progress(1, false);
      complete();
    };
    const finishOnKey = (event: KeyboardEvent) => {
      if (
        ["Tab", "ArrowDown", "PageDown", "End", " "].includes(event.key)
      ) {
        finishImmediately();
      }
    };

    window.addEventListener("wheel", finishImmediately, { passive: true });
    window.addEventListener("touchstart", finishImmediately, { passive: true });
    window.addEventListener("pointerdown", finishImmediately, { passive: true });
    window.addEventListener("keydown", finishOnKey);

    return () => {
      timeline.kill();
      window.removeEventListener("wheel", finishImmediately);
      window.removeEventListener("touchstart", finishImmediately);
      window.removeEventListener("pointerdown", finishImmediately);
      window.removeEventListener("keydown", finishOnKey);
      gsap.set(revealElements, { clearProps: "opacity,visibility,transform" });
      if (header) {
        gsap.set(header, { clearProps: "opacity,visibility,transform" });
      }
    };
  }, [rootRef, store]);

  return null;
}
