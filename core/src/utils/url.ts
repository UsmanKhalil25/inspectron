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

export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    parsed.hostname = parsed.hostname.toLowerCase();

    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }

    if (
      (parsed.protocol === "http:" && parsed.port === "80") ||
      (parsed.protocol === "https:" && parsed.port === "443")
    ) {
      parsed.port = "";
    }

    if (parsed.search) {
      const params = new URLSearchParams(parsed.search);
      const sortedParams = new URLSearchParams(
        Array.from(params.entries()).sort(),
      );
      parsed.search = sortedParams.toString();
    }

    parsed.hash = "";

    return parsed.toString();
  } catch {
    return url;
  }
}

export function isSameOrigin(url1: string, url2: string): boolean {
  try {
    const parsed1 = new URL(url1);
    const parsed2 = new URL(url2);

    return (
      parsed1.protocol === parsed2.protocol &&
      parsed1.hostname === parsed2.hostname &&
      parsed1.port === parsed2.port
    );
  } catch {
    return false;
  }
}

/**
 * Extract all links from a URL that match a pattern
 */
export function extractLinks(html: string, baseUrl: string): string[] {
  const links: Set<string> = new Set();
  const linkRegex = /href=["']([^"']+)["']/gi;

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    try {
      const href = match[1];
      const absoluteUrl = new URL(href, baseUrl).toString();
      links.add(absoluteUrl);
    } catch {
      // Skip invalid URLs
    }
  }

  return Array.from(links);
}
