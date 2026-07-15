import assert from "node:assert/strict";
import test from "node:test";
import { defaultSiteSettings, normalizeSiteSettings } from "../.test-build/src/content/site-settings.js";

test("normalises published Site Settings without allowing unsafe CTA destinations", () => {
  const settings = normalizeSiteSettings({
    home_hero_eyebrow: "Independent digital studio",
    home_primary_cta: { label: "Talk to Webine", href: "/contact" },
    home_secondary_cta: { label: "Unsafe", href: "https://unexpected.example" },
    home_principles: defaultSiteSettings.principles.map((principle) => ({ ...principle })),
    home_process_steps: defaultSiteSettings.processSteps.map((step) => ({ ...step })),
    contact_service_options: [{ text: "Website strategy" }, { text: "Website build" }],
    privacy_content: { text: "A reviewed privacy notice." },
    privacy_policy_version: "2026-08-01",
  });
  assert.equal(settings.hero.eyebrow, "Independent digital studio");
  assert.deepEqual(settings.hero.primaryCta, { label: "Talk to Webine", href: "/contact" });
  assert.equal(settings.hero.secondaryCta.href, "/works");
  assert.deepEqual(settings.contact.serviceOptions, ["Website strategy", "Website build"]);
  assert.equal(settings.contact.privacy, "A reviewed privacy notice.");
  assert.equal(settings.contact.privacyVersion, "2026-08-01");
});
