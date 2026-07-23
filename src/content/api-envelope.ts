import type { ValidationIssue } from "../cms/schema";

export type ApiEnvelope<T> = {
  data: T | null;
  error: {
    code: string;
    message: string;
    issues?: ValidationIssue[];
  } | null;
  meta: {
    requestId: string;
  };
};
