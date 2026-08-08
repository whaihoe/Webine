export type StructuredRouteMetadata = {
  path: string;
  canonicalPath: string;
  title: string;
  description: string;
  pageType: string;
  breadcrumbs: readonly { name: string; path: string }[];
  noIndex?: boolean;
  project?: {
    name: string;
    description: string;
    image: string;
    dateCreated?: string;
    genre?: string;
  };
};

export type StructuredService = {
  key: string;
  title: string;
  summary: string;
};

export declare function createRouteStructuredData(
  metadata: StructuredRouteMetadata,
  origin: string,
  services?: readonly StructuredService[],
): Array<Record<string, unknown>>;
