export type RuntimeReadinessItem = {
  configured: boolean;
  label: string;
  requiredVariable: string;
};

export type RuntimeReadiness = {
  mediaUploads: RuntimeReadinessItem;
  enquiries: RuntimeReadinessItem;
};

function hasValue(environment: NodeJS.ProcessEnv, key: string) {
  return Boolean(environment[key]?.trim());
}

export function getRuntimeReadiness(
  environment: NodeJS.ProcessEnv = process.env,
): RuntimeReadiness {
  return {
    mediaUploads: {
      configured: hasValue(environment, "BLOB_READ_WRITE_TOKEN"),
      label: "Vercel Blob media uploads",
      requiredVariable: "BLOB_READ_WRITE_TOKEN",
    },
    enquiries: {
      configured: hasValue(environment, "ENQUIRY_HASH_SECRET"),
      label: "Contact enquiry intake",
      requiredVariable: "ENQUIRY_HASH_SECRET",
    },
  };
}

export function getBlobReadWriteToken(
  environment: NodeJS.ProcessEnv = process.env,
) {
  return environment.BLOB_READ_WRITE_TOKEN?.trim() ?? "";
}

export function getEnquiryHashSecret(
  environment: NodeJS.ProcessEnv = process.env,
) {
  return environment.ENQUIRY_HASH_SECRET?.trim() ?? "";
}
