import type { CollectionDefinition, ValidationIssue } from "../cms/schema";
import type { AdminTokenProvider } from "./AdminAuthContext";

export type ApiEnvelope<T> = {
  data: T | null;
  error: { code: string; message: string; issues?: ValidationIssue[] } | null;
  meta: { requestId: string };
};

export class AdminApiError extends Error {
  status: number;
  code: string;
  issues: ValidationIssue[];

  constructor(
    status: number,
    code: string,
    message: string,
    issues: ValidationIssue[] = [],
  ) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

async function createAdminHeaders(
  baseHeaders: ConstructorParameters<typeof Headers>[0],
  getToken?: AdminTokenProvider,
) {
  const headers = new Headers(baseHeaders);
  const token = await getToken?.();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function fetchAdminResource<T>(
  path: string,
  signal?: AbortSignal,
  getToken?: AdminTokenProvider,
): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: await createAdminHeaders(
      { Accept: "application/json" },
      getToken,
    ),
    signal,
  });
  const envelope = await response.json() as ApiEnvelope<T>;

  if (!response.ok || envelope.data === null) {
    throw new AdminApiError(
      response.status,
      envelope.error?.code ?? "ADMIN_REQUEST_FAILED",
      envelope.error?.message ?? "The Admin request could not be completed.",
      envelope.error?.issues ?? [],
    );
  }

  return envelope.data;
}

export async function mutateAdminResource<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body: unknown,
  getToken?: AdminTokenProvider,
): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: await createAdminHeaders(
      {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      getToken,
    ),
    body: JSON.stringify(body),
  });
  const envelope = await response.json() as ApiEnvelope<T>;

  if (!response.ok || envelope.data === null) {
    throw new AdminApiError(
      response.status,
      envelope.error?.code ?? "ADMIN_MUTATION_FAILED",
      envelope.error?.message ?? "The Admin change could not be saved.",
      envelope.error?.issues ?? [],
    );
  }

  return envelope.data;
}

export type AdminSession = { label: string };

export type AdminDashboard = {
  draftProjects: number;
  publishedProjects: number;
  totalProjects: number;
  readiness: {
    mediaUploads: AdminReadinessItem;
    enquiries: AdminReadinessItem;
  };
};

export type AdminReadinessItem = {
  configured: boolean;
  label: string;
  requiredVariable: string;
};

export type AdminCollectionSummary = {
  key: string;
  nameSingular: string;
  namePlural: string;
  description: string;
  isSystem: boolean;
  status: "active" | "archived";
  itemCount: number;
  publishedCount: number;
};

export type AdminItemSummary = {
  id: string;
  slug: string | null;
  status: "draft" | "published" | "archived";
  version: number;
  updatedAt: string;
  label: string;
};

export type AdminCollectionDefinition = CollectionDefinition & {
  version: number;
};

export type AdminItem = {
  id: string;
  slug: string | null;
  status: "draft" | "published" | "archived";
  version: number;
  data: Record<string, unknown>;
  updatedAt: string;
};

export type AdminAsset = {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  altText: string;
  caption: string;
  focalX: number;
  focalY: number;
  decorative: boolean;
  status: "ready" | "processing" | "failed" | "archived";
  version: number;
  usageCount: number;
  publishedUsageCount: number;
  createdAt: string;
};

export type AdminEnquiry = {
  id: string;
  name: string;
  email: string;
  company: string;
  website: string;
  serviceInterest: string;
  budgetRange: string;
  timeline: string;
  details: string;
  consentVersion: string;
  status: "new" | "contacted" | "closed" | "spam";
  notificationStatus: "pending" | "sent" | "failed";
  notificationAttempts: number;
  lastNotificationError: string;
  createdAt: string;
};
