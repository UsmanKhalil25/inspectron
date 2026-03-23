import fs from "fs/promises";

export async function loadImage(filePath: string): Promise<Buffer>;
export async function loadImage(
  filePath: string,
  encoding: BufferEncoding,
): Promise<string>;
export async function loadImage(
  filePath: string,
  encoding?: BufferEncoding,
): Promise<Buffer | string> {
  const buffer = await fs.readFile(filePath);
  if (encoding) {
    return buffer.toString(encoding);
  }
  return buffer;
}
