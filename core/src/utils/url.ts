export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function parseAndNormalize(url: string): string {
  if (!url.includes("://")) {
    url = "http://" + url;
  }

  const parsed = new URL(url);

  parsed.hostname = parsed.hostname.toLowerCase();
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.toString();
}
