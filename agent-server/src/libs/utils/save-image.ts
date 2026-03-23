import { mkdir, writeFile } from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

export async function saveImage(
  base64Image: string,
  dir: string = "./tmp/inspectron/screenshots",
): Promise<string> {
  await mkdir(dir, { recursive: true });

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.png`;
  const filePath = path.join(dir, filename);

  await writeFile(filePath, Buffer.from(base64Image, "base64"));

  return filePath;
}
