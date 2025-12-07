import { isValidUrl, normalizeUrl, isSameOrigin } from "../utils/url";

export interface CrawlStateServiceConfig {
  baseUrl: string;
}

export class CrawlStateService {
  private pendingUrls: Set<string>;
  private crawledUrls: Set<string>;
  private failedUrls: Map<string, string>;
  private baseUrl: string;

  constructor(config: CrawlStateServiceConfig) {
    this.pendingUrls = new Set();
    this.crawledUrls = new Set();
    this.failedUrls = new Map();
    this.baseUrl = config.baseUrl;

    this.addUrlToQueue(config.baseUrl);
  }

  getNextUrl(): string | null {
    const iterator = this.pendingUrls.values();
    const next = iterator.next();
    if (!next.done) {
      const url = next.value;
      this.pendingUrls.delete(url);
      return url;
    }
    return null;
  }

  markUrlCrawled(url: string, discoveredLinks: string[]) {
    this.crawledUrls.add(url);
    for (const link of discoveredLinks) {
      const normalized = normalizeUrl(link);
      this.addUrlToQueue(normalized);
    }
  }

  markUrlFailed(url: string, error: string) {
    this.failedUrls.set(url, error);
  }

  getCrawledUrls(): string[] {
    return Array.from(this.crawledUrls);
  }

  getPendingUrls(): string[] {
    return Array.from(this.pendingUrls);
  }

  getFailedUrls(): Array<{ url: string; error: string }> {
    return Array.from(this.failedUrls.entries()).map(([url, error]) => ({
      url,
      error,
    }));
  }

  private addUrlToQueue(url: string) {
    if (!isValidUrl(url)) return;
    if (!isSameOrigin(url, this.baseUrl)) return;
    if (this.shouldExcludeUrl(url)) return;
    if (this.pendingUrls.has(url) || this.crawledUrls.has(url)) return;

    this.pendingUrls.add(url);
  }

  private shouldExcludeUrl(url: string): boolean {
    const excludePatterns = [
      /\.(css|js|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip)$/i,
      /\.(mp4|webm|ogg|mp3|wav)$/i,
      /\/assets?\//i,
      /\/static\//i,
      /\/media\//i,
      /\/images?\//i,
    ];
    return excludePatterns.some((pattern) => pattern.test(url));
  }
}
