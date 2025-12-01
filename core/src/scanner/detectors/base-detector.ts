import type { Page } from "playwright";
import type { VulnerabilityDetector, VulnerabilityResult } from "../types";

export abstract class BaseDetector implements VulnerabilityDetector {
  abstract detect(page: Page, url: string): Promise<VulnerabilityResult[]>;

  protected async safeExecute<T>(
    fn: () => Promise<T>,
    fallback: T,
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      console.error(`Error in detector: ${error}`);
      return fallback;
    }
  }
}
