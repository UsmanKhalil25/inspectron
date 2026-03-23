import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

export function loadMarkdown(filename: string): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  return readFileSync(
    join(__dirname, "..", "..", "graphs", "base", "prompts", filename),
    "utf-8",
  );
}
