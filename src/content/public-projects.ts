import type { MediaRendition } from "../../shared/media-renditions.js";

export type PublicProjectAsset = {
  id: string;
  url: string;
  altText: string;
  focalX: number;
  focalY: number;
  width: number;
  height: number;
  mimeType?: string;
  renditions?: MediaRendition[];
};

export type PublicProject = {
  id: string;
  slug: string;
  title: string;
  client: string;
  kind: "client" | "concept" | "internal";
  label: string;
  category: string;
  year: number;
  services: string[];
  summary: string;
  heroImage: PublicProjectAsset;
  hoverImage?: PublicProjectAsset;
  cardTheme: "light" | "dark";
  accentColour: string;
  featured: boolean;
  featuredOrder: number | null;
  challenge?: string;
  approach?: string;
  outcome?: string;
  industry?: string;
  location?: string;
  duration?: string;
  completedOn?: string;
  platform?: string;
  aboutClient?: string;
  contentBlocks: Array<Record<string, unknown>>;
  projectUrl?: string;
  credits: Array<Record<string, unknown>>;
  seoTitle?: string;
  seoDescription?: string;
};
