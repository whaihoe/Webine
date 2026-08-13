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
      configured: ["R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_S3_ENDPOINT", "R2_PUBLIC_BASE_URL"].every((key) => hasValue(environment, key)),
      label: "Cloudflare R2 media uploads",
      requiredVariable: "R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_S3_ENDPOINT and R2_PUBLIC_BASE_URL",
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

export function getEnquiryHashSecret(
  environment: NodeJS.ProcessEnv = process.env,
) {
  return environment.ENQUIRY_HASH_SECRET?.trim() ?? "";
}
