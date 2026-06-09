import fs from "fs/promises";
import { createReadStream, existsSync, mkdirSync } from "fs";
import path from "path";
import { config } from "../config";

const SAFE_ID = /^[a-zA-Z0-9-]+$/;
const SAFE_FILENAME = /^[a-f0-9-]+\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i;

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function assertSafePathPart(value: string, pattern: RegExp, label: string) {
  if (!pattern.test(value) || value.includes("..") || value.includes("/") || value.includes("\\")) {
    throw new Error(`Invalid ${label}`);
  }
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
  assertSafePathPart(orgId, SAFE_ID, "organization id");
  assertSafePathPart(filename, SAFE_FILENAME, "filename");
  const dir = path.join(config.upload.dir, orgId);
  ensureDir(dir);
  await fs.writeFile(path.join(dir, filename), buffer);
}

export function getFilePath(orgId: string, filename: string): string {
  assertSafePathPart(orgId, SAFE_ID, "organization id");
  assertSafePathPart(filename, SAFE_FILENAME, "filename");
  const resolved = path.resolve(config.upload.dir, orgId, filename);
  const root = path.resolve(config.upload.dir);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid file path");
  }
  return resolved;
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
