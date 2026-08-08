import type { PageMetadata } from "./page-metadata";
import { servicesContent } from "../content/services-content";
import { createRouteStructuredData } from "../../shared/route-structured-data.mjs";

export function createStructuredData(metadata: PageMetadata, origin: string) {
  const services = metadata.path === "/services" ? servicesContent.services : [];
  return createRouteStructuredData(metadata, origin, services);
}
