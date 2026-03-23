import * as fs from "fs";
import * as path from "path";
import { Logger } from "./logger";

const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || "./screenshots";

// Generate a random session ID on startup
const SESSION_ID = Math.random().toString(36).substring(2, 10);
let screenshotCounter = 0;

export class ScreenshotStorage {
  static saveScreenshot(
    screenshotBuffer: Buffer,
    suffix: string = "",
  ): string | null {
    try {
      // Create session-specific directory
      const sessionDir = path.join(SCREENSHOTS_DIR, SESSION_ID);
      if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
      }

      // Increment counter
      screenshotCounter++;

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const suffixPart = suffix ? `-${suffix}` : "";
      const filename = `${screenshotCounter.toString().padStart(4, "0")}-${timestamp}${suffixPart}.png`;
      const filepath = path.join(sessionDir, filename);

      // Save screenshot
      fs.writeFileSync(filepath, screenshotBuffer);

      Logger.info("screenshot-storage", `Saved screenshot: ${filepath}`);
      return filepath;
    } catch (error) {
      Logger.error("screenshot-storage", "Failed to save screenshot", error);
      return null;
    }
  }

  static getSessionDir(): string {
    return path.join(SCREENSHOTS_DIR, SESSION_ID);
  }

  static getSessionId(): string {
    return SESSION_ID;
  }
}
