import * as fs from "fs";
import * as path from "path";
import type { PageElement } from "../schemas/page-elements.js";

export class DebugLogger {
  private debugDir: string;
  private sessionDir: string;
  private iterationCount: number = 0;

  constructor(sessionId?: string) {
    this.debugDir = path.join(process.cwd(), "debug");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const session = sessionId || `session-${timestamp}`;
    this.sessionDir = path.join(this.debugDir, session);

    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true });
    }
    if (!fs.existsSync(this.sessionDir)) {
      fs.mkdirSync(this.sessionDir, { recursive: true });
    }

    console.log(`Debug session created: ${this.sessionDir}`);
  }

  saveIteration(data: {
    screenshot: string;
    elements: PageElement[];
    url: string;
    metadata?: Record<string, any>;
  }) {
    this.iterationCount++;
    const iterationDir = path.join(
      this.sessionDir,
      `iteration-${this.iterationCount.toString().padStart(3, "0")}`,
    );

    if (!fs.existsSync(iterationDir)) {
      fs.mkdirSync(iterationDir, { recursive: true });
    }

    const screenshotPath = path.join(iterationDir, "screenshot.png");
    const buffer = Buffer.from(data.screenshot, "base64");
    fs.writeFileSync(screenshotPath, buffer);

    const elementsPath = path.join(iterationDir, "elements.json");
    fs.writeFileSync(
      elementsPath,
      JSON.stringify(data.elements, null, 2),
      "utf-8",
    );

    const metadataPath = path.join(iterationDir, "metadata.json");
    const metadata = {
      iteration: this.iterationCount,
      timestamp: new Date().toISOString(),
      url: data.url,
      elementCount: data.elements.length,
      ...data.metadata,
    };
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf-8");

    const htmlPath = path.join(iterationDir, "debug.html");
    const htmlContent = this.generateDebugHTML(data);
    fs.writeFileSync(htmlPath, htmlContent, "utf-8");

    console.log(`Saved iteration ${this.iterationCount} to ${iterationDir}`);

    return iterationDir;
  }

  private generateDebugHTML(data: {
    screenshot: string;
    elements: PageElement[];
    url: string;
    metadata?: Record<string, any>;
  }): string {
    const elementRows = data.elements
      .map(
        (el) => `
      <tr>
        <td>${el.id}</td>
        <td>${el.tag}</td>
        <td>${el.text || "<empty>"}</td>
        <td>${el.boundingBox.x.toFixed(1)}, ${el.boundingBox.y.toFixed(1)}</td>
        <td>${el.boundingBox.width.toFixed(1)} × ${el.boundingBox.height.toFixed(1)}</td>
      </tr>
    `,
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Debug - Iteration ${this.iterationCount}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .metadata {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }
    .metadata p {
      margin: 5px 0;
    }
    .screenshot-container {
      margin: 20px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }
    .screenshot-container img {
      max-width: 100%;
      height: auto;
      display: block;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #f8f9fa;
      font-weight: 600;
      color: #495057;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .tag {
      display: inline-block;
      padding: 2px 8px;
      background: #e7f3ff;
      color: #0066cc;
      border-radius: 3px;
      font-size: 12px;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Debug View - Iteration ${this.iterationCount}</h1>

    <div class="metadata">
      <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      <p><strong>URL:</strong> <a href="${data.url}" target="_blank">${data.url}</a></p>
      <p><strong>Total Elements:</strong> ${data.elements.length}</p>
      ${
        data.metadata
          ? Object.entries(data.metadata)
              .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
              .join("")
          : ""
      }
    </div>

    <h2>Screenshot</h2>
    <div class="screenshot-container">
      <img src="data:image/png;base64,${data.screenshot}" alt="Screenshot">
    </div>

    <h2>Interactive Elements (${data.elements.length})</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tag</th>
          <th>Text</th>
          <th>Position (x, y)</th>
          <th>Size (w × h)</th>
        </tr>
      </thead>
      <tbody>
        ${elementRows}
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }

  getSessionPath(): string {
    return this.sessionDir;
  }

  getIterationCount(): number {
    return this.iterationCount;
  }
}
