import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const root = resolve(import.meta.dirname, "..");
const sourceDir = resolve(root, "public/work/deszio-studio/source");
const outputDir = resolve(root, "public/work/deszio-studio/case-study");
const width = 1600;
const height = 1000;

const colours = {
  ink: "#020617",
  panel: "#0f172a",
  panelSoft: "#172033",
  rule: "#26344c",
  text: "#f8fafc",
  muted: "#94a3b8",
  cyan: "#22d3ee",
  blue: "#2563eb",
  gold: "#c4a574",
  warm: "#f5f3f0",
};

const source = {
  heroDesktop: resolve(sourceDir, "01-hero-desktop.png"),
  portfolioDesktop: resolve(sourceDir, "02-portfolio-desktop.png"),
  servicesDesktop: resolve(sourceDir, "03-services-desktop.png"),
  testimonialsDesktop: resolve(sourceDir, "04-testimonials-desktop.png"),
  contactDesktop: resolve(sourceDir, "05-contact-desktop.png"),
  heroMobile: resolve(sourceDir, "06-hero-mobile.png"),
  menuMobile: resolve(sourceDir, "07-menu-mobile.png"),
  portfolioMobile: resolve(sourceDir, "08-portfolio-mobile.png"),
  servicesMobile: resolve(sourceDir, "09-services-mobile.png"),
  testimonialsMobile: resolve(sourceDir, "10-testimonials-mobile.png"),
  contactMobile: resolve(sourceDir, "11-contact-mobile.png"),
  fullMobile: resolve(sourceDir, "12-mobile-full.png"),
  logo: resolve(sourceDir, "deszio-logo.png"),
  interiorHero: resolve(sourceDir, "interior-hero.png"),
  bedroom: resolve(sourceDir, "interior-bedroom.png"),
  kitchen: resolve(sourceDir, "interior-kitchen.png"),
  office: resolve(sourceDir, "interior-office.png"),
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function lines(text, x, y, options = {}) {
  const {
    size = 48,
    fill = colours.text,
    family = "Arial, sans-serif",
    weight = 400,
    lineHeight = 1.08,
    anchor = "start",
    italic = false,
    letterSpacing = 0,
  } = options;
  const items = Array.isArray(text) ? text : [text];
  return `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" font-style="${italic ? "italic" : "normal"}" letter-spacing="${letterSpacing}" text-anchor="${anchor}">${items.map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : size * lineHeight}">${escapeXml(item)}</tspan>`).join("")}</text>`;
}

function grid() {
  return `<defs><pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse"><path d="M64 0H0V64" fill="none" stroke="#1e293b" stroke-width="1"/></pattern><linearGradient id="beam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${colours.cyan}"/><stop offset="1" stop-color="${colours.blue}"/></linearGradient></defs><rect width="100%" height="100%" fill="${colours.ink}"/><rect width="100%" height="100%" fill="url(#grid)" opacity="0.72"/>`;
}

function chrome(x, y, w, h, label = "DESZIOSTUDIO.COM") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${colours.panel}" stroke="${colours.rule}"/><circle cx="${x + 28}" cy="${y + 28}" r="5" fill="${colours.cyan}"/><circle cx="${x + 46}" cy="${y + 28}" r="5" fill="${colours.blue}"/><rect x="${x + 74}" y="${y + 18}" width="${Math.max(w - 102, 80)}" height="20" rx="10" fill="#1e293b"/>${lines(label, x + 88, y + 33, { size: 11, fill: colours.muted, weight: 700, letterSpacing: 1.8 })}`;
}

function frameSvg(x, y, w, h, radius = 22) {
  return Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${radius}" fill="#fff"/></svg>`);
}

async function framedImage(input, x, y, w, h, options = {}) {
  const { fit = "cover", position = "centre", radius = 20, grayscale = false } = options;
  let pipeline = sharp(input).resize(w, h, { fit, position });
  if (grayscale) pipeline = pipeline.grayscale();
  const buffer = await pipeline
    .composite([{ input: frameSvg(x, y, w, h, radius), blend: "dest-in" }])
    .png()
    .toBuffer();
  return { input: buffer, left: x, top: y };
}

function header(number, eyebrow, title, subtitle = "") {
  return `${lines(number, 72, 74, { size: 16, fill: colours.cyan, weight: 700, letterSpacing: 2.4 })}${lines(eyebrow.toUpperCase(), 136, 74, { size: 16, fill: colours.muted, weight: 700, letterSpacing: 2.4 })}${lines(title, 72, 168, { size: 66, weight: 500 })}${subtitle ? lines(subtitle, 74, 228, { size: 24, fill: colours.muted }) : ""}`;
}

async function writeBoard(filename, svgContent, composites = []) {
  const svg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${grid()}${svgContent}</svg>`);
  await sharp(svg)
    .composite(composites)
    .webp({ quality: 86, smartSubsample: true })
    .toFile(resolve(outputDir, filename));
}

async function cover() {
  const desktop = await framedImage(source.heroDesktop, 636, 268, 864, 580, { radius: 18 });
  const mobile = await framedImage(source.heroMobile, 1160, 390, 250, 510, { position: "top", radius: 30 });
  await writeBoard("01-project-overview.webp", `${lines("01", 72, 74, { size: 16, fill: colours.cyan, weight: 700, letterSpacing: 2.4 })}${lines("PROJECT OVERVIEW", 136, 74, { size: 16, fill: colours.muted, weight: 700, letterSpacing: 2.4 })}${lines(["A composed", "digital home for", "considered interiors"], 72, 158, { size: 54, weight: 500, lineHeight: 1.02 })}${lines("Web design and development / One-month delivery", 74, 354, { size: 19, fill: colours.muted })}${lines(["DESZIO", "STUDIO"], 76, 510, { size: 94, family: "Georgia, serif", italic: true, fill: colours.gold, lineHeight: 0.92 })}${lines(["Singapore", "2026"], 78, 742, { size: 18, fill: colours.muted, weight: 700, letterSpacing: 2.4, lineHeight: 1.7 })}${chrome(612, 234, 912, 642)}`, [desktop, mobile]);
}

async function clientContext() {
  const interior = await framedImage(source.interiorHero, 72, 208, 850, 710, { radius: 28 });
  const logo = await sharp(source.logo).resize(190, 190, { fit: "contain" }).png().toBuffer();
  await writeBoard("02-client-context.webp", `${header("02", "Client and context", "A studio built around calm", "Modern minimalist luxury interiors in Singapore")}${lines("THE BUSINESS", 1010, 300, { size: 15, fill: colours.cyan, weight: 700, letterSpacing: 2.4 })}${lines(["Deszio Studio creates", "serene interiors through", "thoughtful design and", "careful craftsmanship."], 1010, 378, { size: 41, lineHeight: 1.18 })}${lines(["The website needed to reflect that", "same level of calm and precision."], 1010, 665, { size: 22, fill: colours.muted, lineHeight: 1.45 })}`, [interior, { input: logo, left: 1270, top: 720 }]);
}

async function challenge() {
  const cards = [
    ["01", "Positioning", "Translate a premium interior offer into a digital presence that feels calm, credible and distinct."],
    ["02", "Structure", "Give visitors a clear route through the work, the process and the value behind the service."],
    ["03", "Conversion", "Keep consultation access visible without interrupting the restrained visual rhythm."],
  ];
  const cardMarkup = cards.map(([index, title, copy], cardIndex) => {
    const x = 72 + cardIndex * 500;
    return `<rect x="${x}" y="310" width="456" height="500" rx="28" fill="${colours.panel}" stroke="${colours.rule}"/>${lines(index, x + 34, 360, { size: 15, fill: colours.cyan, weight: 700 })}${lines(title, x + 34, 450, { size: 42, family: "Georgia, serif", italic: true, fill: colours.gold })}${lines(copy.match(/.{1,36}(?:\s|$)/g)?.map((line) => line.trim()) ?? [copy], x + 34, 560, { size: 23, fill: colours.muted, lineHeight: 1.42 })}`;
  }).join("");
  await writeBoard("03-design-challenge.webp", `${header("03", "Design challenge", "Make restraint feel purposeful", "The experience had to balance aspiration, clarity and a direct enquiry route.")}${cardMarkup}`);
}

async function objectives() {
  const items = [
    ["01", "Establish a premium first impression"],
    ["02", "Let completed spaces lead the story"],
    ["03", "Explain the three-phase service clearly"],
    ["04", "Make consultation access effortless"],
  ];
  const markup = items.map(([index, copy], itemIndex) => {
    const x = 72 + (itemIndex % 2) * 748;
    const y = 314 + Math.floor(itemIndex / 2) * 260;
    return `<rect x="${x}" y="${y}" width="700" height="210" rx="24" fill="${itemIndex === 0 ? colours.gold : colours.panel}" stroke="${itemIndex === 0 ? colours.gold : colours.rule}"/>${lines(index, x + 30, y + 48, { size: 14, fill: itemIndex === 0 ? colours.ink : colours.cyan, weight: 700 })}${lines(copy.match(/.{1,34}(?:\s|$)/g)?.map((line) => line.trim()) ?? [copy], x + 30, y + 112, { size: 31, fill: itemIndex === 0 ? colours.ink : colours.text, lineHeight: 1.18 })}`;
  }).join("");
  await writeBoard("04-project-objectives.webp", `${header("04", "Project goals", "Clarity without losing atmosphere", "Each decision was measured against a simple, useful visitor journey.")}${markup}`);
}

async function journey() {
  const stages = [
    ["01", "Discover", "A clear premium promise"],
    ["02", "Explore", "Projects with room to breathe"],
    ["03", "Understand", "A visible three-phase process"],
    ["04", "Enquire", "A focused consultation form"],
  ];
  const markup = stages.map(([index, title, copy], stageIndex) => {
    const x = 96 + stageIndex * 374;
    return `<circle cx="${x + 92}" cy="510" r="92" fill="${stageIndex === 3 ? colours.gold : colours.panel}" stroke="${stageIndex === 3 ? colours.gold : colours.rule}" stroke-width="2"/>${lines(index, x + 92, 494, { size: 14, fill: stageIndex === 3 ? colours.ink : colours.cyan, weight: 700, anchor: "middle" })}${lines(title, x + 92, 530, { size: 24, fill: stageIndex === 3 ? colours.ink : colours.text, weight: 600, anchor: "middle" })}${lines(copy.match(/.{1,24}(?:\s|$)/g)?.map((line) => line.trim()) ?? [copy], x + 92, 670, { size: 18, fill: colours.muted, anchor: "middle", lineHeight: 1.35 })}${stageIndex < 3 ? `<path d="M${x + 190} 510H${x + 276}" stroke="url(#beam)" stroke-width="3"/><path d="M${x + 266} 501L${x + 276} 510L${x + 266} 519" fill="none" stroke="${colours.cyan}" stroke-width="3"/>` : ""}`;
  }).join("");
  await writeBoard("05-user-journey.webp", `${header("05", "Experience journey", "From first impression to conversation", "The page sequence keeps the next decision visible without rushing the visitor.")}${markup}`);
}

async function sitemap() {
  const nodes = [
    ["Home", 690, 308, 220, 92, true],
    ["About", 84, 610, 250, 104],
    ["Portfolio", 414, 610, 250, 104],
    ["Services", 744, 610, 250, 104],
    ["Testimonials", 1074, 610, 250, 104],
    ["Contact", 1360, 610, 170, 104],
  ];
  const links = nodes.slice(1).map(([, x, y, w]) => `<path d="M800 400V510H${Number(x) + Number(w) / 2}V610" fill="none" stroke="${colours.rule}" stroke-width="2"/>`).join("");
  const nodeMarkup = nodes.map(([label, x, y, w, h, active]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${active ? colours.gold : colours.panel}" stroke="${active ? colours.gold : colours.rule}"/>${lines(label, Number(x) + Number(w) / 2, Number(y) + Number(h) / 2 + 9, { size: active ? 30 : 24, fill: active ? colours.ink : colours.text, weight: 600, anchor: "middle" })}`).join("");
  await writeBoard("06-sitemap.webp", `${header("06", "Information architecture", "One page, one connected narrative", "Each anchor supports a distinct visitor question and returns to consultation.")}${links}${nodeMarkup}`);
}

async function contentMap() {
  const mobile = await framedImage(source.fullMobile, 1020, 248, 300, 650, { position: "top", radius: 34 });
  const sections = ["Promise", "Studio context", "Selected spaces", "Three-phase process", "Client confidence", "Consultation"];
  const markup = sections.map((label, index) => {
    const y = 310 + index * 94;
    return `<rect x="84" y="${y}" width="720" height="66" rx="18" fill="${index === 0 ? colours.gold : colours.panel}" stroke="${index === 0 ? colours.gold : colours.rule}"/>${lines(String(index + 1).padStart(2, "0"), 112, y + 41, { size: 13, fill: index === 0 ? colours.ink : colours.cyan, weight: 700 })}${lines(label, 178, y + 42, { size: 23, fill: index === 0 ? colours.ink : colours.text, weight: 600 })}`;
  }).join("");
  await writeBoard("07-homepage-content-map.webp", `${header("07", "Homepage content map", "A calm sequence with a clear purpose", "The final experience moves from aspiration to evidence, then to action.")}${markup}${lines(["THE FULL STORY", "IN ONE CONTINUOUS FLOW"], 1370, 520, { size: 16, fill: colours.muted, weight: 700, letterSpacing: 2.1, anchor: "middle", lineHeight: 1.5 })}`, [mobile]);
}

async function structure() {
  const screenshot = await framedImage(source.heroDesktop, 480, 260, 1000, 620, { radius: 22, grayscale: true });
  await writeBoard("08-interface-structure.webp", `${header("08", "Interface structure", "A reconstructed implementation blueprint", "Derived from the final build to document hierarchy, spacing and conversion placement.")}${chrome(456, 226, 1048, 690)}<rect x="516" y="330" width="320" height="170" rx="10" fill="none" stroke="${colours.cyan}" stroke-width="3"/><rect x="516" y="540" width="270" height="100" rx="10" fill="none" stroke="${colours.gold}" stroke-width="3"/><rect x="1060" y="320" width="330" height="430" rx="10" fill="none" stroke="${colours.blue}" stroke-width="3"/>${lines(["01 / PROMISE", "02 / ACTION", "03 / ATMOSPHERE"], 82, 410, { size: 19, fill: colours.muted, weight: 700, letterSpacing: 1.4, lineHeight: 2.5 })}`, [screenshot]);
}

async function visualSystem() {
  const swatches = [["Ink", "#1a1a1a"], ["Canvas", "#f5f3f0"], ["Warm gold", "#c4a574"], ["White", "#ffffff"]];
  const swatchMarkup = swatches.map(([label, colour], index) => {
    const x = 80 + index * 242;
    return `<rect x="${x}" y="330" width="210" height="210" rx="105" fill="${colour}" stroke="${colours.rule}"/>${lines(label, x + 105, 590, { size: 17, fill: colours.muted, anchor: "middle" })}${lines(colour.toUpperCase(), x + 105, 620, { size: 13, fill: colours.muted, anchor: "middle", letterSpacing: 1.5 })}`;
  }).join("");
  await writeBoard("09-visual-system.webp", `${header("09", "Visual system", "Warm restraint, editorial confidence", "Deszio’s project palette sits inside Webine’s structured case-study frame.")}${swatchMarkup}${lines("Playfair Display", 1110, 405, { size: 58, family: "Georgia, serif", fill: colours.gold })}${lines("Editorial headings", 1112, 450, { size: 17, fill: colours.muted, letterSpacing: 1.8 })}${lines("Inter", 1110, 590, { size: 56, weight: 500 })}${lines("Clear interface copy", 1112, 635, { size: 17, fill: colours.muted, letterSpacing: 1.8 })}`);
}

async function components() {
  const nav = await framedImage(source.heroDesktop, 70, 288, 710, 270, { position: "top", radius: 22 });
  const card = await framedImage(source.portfolioDesktop, 824, 288, 706, 270, { position: "centre", radius: 22 });
  const form = await framedImage(source.contactDesktop, 70, 620, 710, 270, { position: "right", radius: 22 });
  const service = await framedImage(source.servicesDesktop, 824, 620, 706, 270, { position: "centre", radius: 22 });
  await writeBoard("10-component-language.webp", `${header("10", "Component language", "A small system, repeated with care", "Navigation, cards, service explanations and enquiry controls share one visual grammar.")}`, [nav, card, form, service]);
}

async function homepage() {
  const hero = await framedImage(source.heroDesktop, 72, 250, 950, 660, { radius: 24 });
  const portfolio = await framedImage(source.portfolioDesktop, 1052, 250, 476, 308, { radius: 24 });
  const services = await framedImage(source.servicesDesktop, 1052, 588, 476, 322, { radius: 24 });
  await writeBoard("11-homepage-showcase.webp", `${header("11", "Homepage", "Atmosphere first, proof close behind", "The final page gives imagery space while keeping service detail and action easy to find.")}`, [hero, portfolio, services]);
}

async function keySections() {
  const services = await framedImage(source.servicesDesktop, 72, 280, 456, 610, { position: "centre", radius: 24 });
  const testimonials = await framedImage(source.testimonialsDesktop, 572, 280, 456, 610, { position: "centre", radius: 24 });
  const contact = await framedImage(source.contactDesktop, 1072, 280, 456, 610, { position: "centre", radius: 24 });
  await writeBoard("12-key-sections.webp", `${header("12", "Key sections", "Explain, reassure, invite", "Three chapters carry the visitor from service understanding to a confident first contact.")}${lines("PROCESS", 300, 930, { size: 14, fill: colours.cyan, weight: 700, anchor: "middle", letterSpacing: 2 })}${lines("TRUST", 800, 930, { size: 14, fill: colours.cyan, weight: 700, anchor: "middle", letterSpacing: 2 })}${lines("ENQUIRY", 1300, 930, { size: 14, fill: colours.cyan, weight: 700, anchor: "middle", letterSpacing: 2 })}`, [services, testimonials, contact]);
}

async function responsive() {
  const desktop = await framedImage(source.heroDesktop, 72, 278, 1050, 640, { radius: 24 });
  const mobile = await framedImage(source.heroMobile, 1212, 252, 280, 606, { position: "top", radius: 36 });
  await writeBoard("13-responsive-experience.webp", `${header("13", "Responsive experience", "The same hierarchy, re-composed", "Desktop breadth becomes a focused mobile reading rhythm without losing atmosphere.")}${chrome(48, 244, 1098, 700)}<rect x="1180" y="220" width="344" height="680" rx="48" fill="${colours.panel}" stroke="${colours.rule}"/>`, [desktop, mobile]);
}

async function mobileJourney() {
  const inputs = [source.heroMobile, source.portfolioMobile, source.servicesMobile, source.contactMobile];
  const composites = [];
  for (let index = 0; index < inputs.length; index += 1) {
    composites.push(await framedImage(inputs[index], 80 + index * 380, 286, 292, 632, { position: "top", radius: 34 }));
  }
  await writeBoard("14-mobile-journey.webp", `${header("14", "Mobile journey", "A complete story in four moments", "Promise, work, process and enquiry remain legible within a compact viewport.")}`, composites);
}

async function interactions() {
  const menu = await framedImage(source.menuMobile, 120, 292, 280, 606, { position: "top", radius: 34 });
  const portfolio = await framedImage(source.portfolioMobile, 660, 292, 280, 606, { position: "top", radius: 34 });
  const contact = await framedImage(source.contactMobile, 1200, 292, 280, 606, { position: "top", radius: 34 });
  await writeBoard("15-interaction-sequence.webp", `${header("15", "Interaction sequence", "Small transitions, useful feedback", "The mobile navigation, work browsing and enquiry flow stay direct and controlled.")}<path d="M420 585H630" stroke="url(#beam)" stroke-width="3"/><path d="M950 585H1170" stroke="url(#beam)" stroke-width="3"/>${lines("OPEN", 525, 560, { size: 13, fill: colours.muted, anchor: "middle", weight: 700, letterSpacing: 1.8 })}${lines("MOVE", 1060, 560, { size: 13, fill: colours.muted, anchor: "middle", weight: 700, letterSpacing: 1.8 })}`, [menu, portfolio, contact]);
}

async function finalCollection() {
  const hero = await framedImage(source.interiorHero, 72, 250, 720, 650, { radius: 26 });
  const bedroom = await framedImage(source.bedroom, 824, 250, 338, 310, { radius: 26 });
  const kitchen = await framedImage(source.kitchen, 1190, 250, 338, 310, { radius: 26 });
  const office = await framedImage(source.office, 824, 590, 704, 310, { radius: 26 });
  await writeBoard("16-final-collection.webp", `${header("16", "Final collection", "Spaces lead the final impression", "A restrained framework lets Deszio’s interior work remain the visual centre of gravity.")}`, [hero, bedroom, kitchen, office]);
}

async function results() {
  const facts = [
    ["01 MONTH", "End-to-end design and development"],
    ["RESPONSIVE", "Desktop and mobile compositions"],
    ["LIVE", "A published production experience"],
    ["DIRECT", "A focused consultation journey"],
  ];
  const markup = facts.map(([title, copy], index) => {
    const x = 72 + (index % 2) * 748;
    const y = 305 + Math.floor(index / 2) * 264;
    return `<rect x="${x}" y="${y}" width="700" height="216" rx="26" fill="${index === 0 ? colours.gold : colours.panel}" stroke="${index === 0 ? colours.gold : colours.rule}"/>${lines(title, x + 32, y + 82, { size: 44, fill: index === 0 ? colours.ink : colours.text, weight: 600 })}${lines(copy, x + 34, y + 146, { size: 20, fill: index === 0 ? colours.ink : colours.muted })}`;
  }).join("");
  await writeBoard("17-project-outcome.webp", `${header("17", "Outcome", "A complete digital home, built in one month", "The result is a live, responsive showcase with a clear route from discovery to consultation.")}${markup}`);
}

async function closing() {
  const background = await sharp(source.interiorHero).resize(width, height, { fit: "cover" }).modulate({ brightness: 0.42, saturation: 0.68 }).png().toBuffer();
  const overlay = `<rect width="100%" height="100%" fill="#020617" opacity="0.58"/><rect x="72" y="72" width="1456" height="856" rx="34" fill="none" stroke="#ffffff" opacity="0.18"/>${lines("18 / CLOSING FRAME", 112, 130, { size: 15, fill: colours.cyan, weight: 700, letterSpacing: 2.3 })}${lines(["Thoughtful spaces.", "A considered digital home."], 112, 460, { size: 82, lineHeight: 1.04 })}${lines("DESZIO STUDIO / WEB DESIGN AND DEVELOPMENT", 114, 820, { size: 16, fill: colours.muted, weight: 700, letterSpacing: 2.4 })}<rect x="1280" y="788" width="180" height="62" rx="31" fill="${colours.gold}"/>${lines("VIEW LIVE", 1370, 827, { size: 15, fill: colours.ink, weight: 700, anchor: "middle", letterSpacing: 1.5 })}`;
  await sharp(background).composite([{ input: Buffer.from(`<svg width="${width}" height="${height}">${overlay}</svg>`) }]).webp({ quality: 88 }).toFile(resolve(outputDir, "18-closing-frame.webp"));
}

const media = [
  ["01-project-overview.webp", "Deszio Studio website shown in desktop and mobile compositions", "Project overview", "full", "A responsive digital home shaped around Deszio Studio’s calm, considered interior work."],
  ["02-client-context.webp", "Deszio Studio client context beside a calm interior scene", "Client and business context", "wide", "The visual direction began with the same qualities found in Deszio’s spaces: restraint, warmth and precision."],
  ["03-design-challenge.webp", "Three design challenges covering positioning, structure and conversion", "The challenge", "wide", "The experience needed to feel premium while still making the service and enquiry path easy to understand."],
  ["04-project-objectives.webp", "Four project goals for the Deszio Studio website", "Project goals", "wide", "Four practical goals kept the one-month design and development process focused."],
  ["05-user-journey.webp", "Visitor journey from discovery to consultation", "User journey", "full", "A simple journey moves visitors from an atmospheric first impression into proof, process and contact."],
  ["06-sitemap.webp", "Single-page sitemap connecting the Deszio Studio content sections", "Information architecture", "wide", "The single-page structure keeps each question close and makes consultation available throughout the experience."],
  ["07-homepage-content-map.webp", "Homepage content sequence from promise to consultation", "Homepage content map", "wide", "The content sequence moves from aspiration to evidence, reassurance and action."],
  ["08-interface-structure.webp", "Reconstructed final interface structure with annotated hierarchy", "Interface structure", "full", "This reconstructed blueprint documents the hierarchy and spacing of the final implementation."],
  ["09-visual-system.webp", "Deszio Studio colour and typography system", "Visual system", "wide", "Warm gold, soft neutrals and editorial type give the interface a quiet sense of confidence."],
  ["10-component-language.webp", "Navigation, portfolio, service and form component examples", "Component language", "full", "A compact component system keeps navigation, imagery, service detail and forms visually connected."],
  ["11-homepage-showcase.webp", "Final homepage hero, portfolio and service sections", "Homepage showcase", "full", "The final homepage balances full-bleed atmosphere with clear supporting information."],
  ["12-key-sections.webp", "Process, testimonial and enquiry sections", "Key sections", "wide", "Process, trust and enquiry sections give visitors the practical detail needed to take the next step."],
  ["13-responsive-experience.webp", "Desktop and mobile versions of the Deszio Studio hero", "Responsive experience", "full", "The hierarchy is re-composed for mobile rather than reduced into a smaller desktop layout."],
  ["14-mobile-journey.webp", "Four moments from the complete mobile journey", "Mobile journey", "full", "The complete mobile experience preserves the project imagery, service explanation and consultation route."],
  ["15-interaction-sequence.webp", "Mobile menu, portfolio browsing and enquiry sequence", "Interaction sequence", "wide", "Small transitions support orientation and feedback without competing with the interior imagery."],
  ["16-final-collection.webp", "Collection of final Deszio Studio interior imagery", "Final collection", "full", "A restrained frame lets Deszio Studio’s completed spaces remain the centre of the visual story."],
  ["17-project-outcome.webp", "Verified project outcome covering delivery, responsiveness and enquiry flow", "Outcome", "wide", "The result is a live responsive website, designed and developed in one month with a direct consultation journey."],
  ["18-closing-frame.webp", "Closing Deszio Studio case-study frame", "Closing frame", "full", "A final frame returns the story to the work itself and provides a direct route to the live website."],
].map(([filename, altText, heading, layout, caption]) => ({ filename, altText, heading, layout, caption }));

await mkdir(outputDir, { recursive: true });
await cover();
await clientContext();
await challenge();
await objectives();
await journey();
await sitemap();
await contentMap();
await structure();
await visualSystem();
await components();
await homepage();
await keySections();
await responsive();
await mobileJourney();
await interactions();
await finalCollection();
await results();
await closing();
await writeFile(resolve(outputDir, "manifest.json"), `${JSON.stringify(media, null, 2)}\n`);

console.log(`Generated ${media.length} Deszio Studio case-study images in ${outputDir}`);
