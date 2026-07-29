export const WEBSITE_FORMAT_MESSAGE = "Enter a complete website address, for example https://example.com, or leave it blank.";

export function isValidOptionalWebsite(value: string) {
  const website = value.trim();
  if (!website) return true;

  try {
    const url = new URL(website);
    const hostnameParts = url.hostname.split(".");
    return ["http:", "https:"].includes(url.protocol)
      && hostnameParts.length > 1
      && hostnameParts.every((part) => part.length > 0);
  } catch {
    return false;
  }
}
