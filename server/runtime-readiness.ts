export type RuntimeReadinessItem = {
  configured: boolean;
  label: string;
  requiredVariable: string;
};

export type RuntimeReadiness = {
  mediaUploads: RuntimeReadinessItem;
  enquiries: RuntimeReadinessItem;
  enquiryNotifications: RuntimeReadinessItem;
};

function hasValue(environment: NodeJS.ProcessEnv, key: string) {
  return Boolean(environment[key]?.trim());
}

export function hasEnquiryNotificationProvider(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const hasEmailProvider = [
    "RESEND_API_KEY",
    "ENQUIRY_NOTIFICATION_EMAIL",
    "ENQUIRY_NOTIFICATION_FROM_EMAIL",
  ].every((key) => hasValue(environment, key));
  return hasEmailProvider ||
    hasValue(environment, "ENQUIRY_NOTIFICATION_WEBHOOK_URL");
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
    enquiryNotifications: {
      configured: hasEnquiryNotificationProvider(environment),
      label: "New enquiry notifications",
      requiredVariable: "Resend email variables or ENQUIRY_NOTIFICATION_WEBHOOK_URL",
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
