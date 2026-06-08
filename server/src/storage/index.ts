import fs from "fs/promises";
import { createReadStream, existsSync, mkdirSync } from "fs";
import path from "path";
import { config } from "../config";

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function mimeFromExt(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
  };
  return map[ext] || "application/octet-stream";
}

export async function saveFile(orgId: string, filename: string, buffer: Buffer): Promise<void> {
  const dir = path.join(config.upload.dir, orgId);
  ensureDir(dir);
  await fs.writeFile(path.join(dir, filename), buffer);
}

export function getFilePath(orgId: string, filename: string): string {
  return path.join(config.upload.dir, orgId, filename);
}

export async function deleteFile(orgId: string, filename: string): Promise<void> {
  try {
    await fs.unlink(getFilePath(orgId, filename));
  } catch {}
}

export function getFileStream(orgId: string, filename: string, range?: { start: number; end: number }) {
  return createReadStream(getFilePath(orgId, filename), range);
}

export async function getFileSize(orgId: string, filename: string): Promise<number> {
  const stat = await fs.stat(getFilePath(orgId, filename));
  return stat.size;
}

export function getContentType(filename: string): string {
  return mimeFromExt(filename);
}

export function ensureUploadDir(): string {
  ensureDir(config.upload.dir);
  return config.upload.dir;
}
