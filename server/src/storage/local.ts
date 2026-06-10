import fs from "fs/promises";
import { createReadStream, existsSync, mkdirSync } from "fs";
import path from "path";
import { Readable } from "stream";
import { config } from "../config";
import { StorageProvider } from "./provider";

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

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = config.upload.dir;
    ensureDir(this.uploadDir);
  }

  private getFilePath(orgId: string, filename: string): string {
    assertSafePathPart(orgId, SAFE_ID, "organization id");
    assertSafePathPart(filename, SAFE_FILENAME, "filename");
    const resolved = path.resolve(this.uploadDir, orgId, filename);
    const root = path.resolve(this.uploadDir);
    if (!resolved.startsWith(root + path.sep)) {
      throw new Error("Invalid file path");
    }
    return resolved;
  }

  async saveFile(orgId: string, filename: string, buffer: Buffer): Promise<void> {
    assertSafePathPart(orgId, SAFE_ID, "organization id");
    assertSafePathPart(filename, SAFE_FILENAME, "filename");
    const dir = path.join(this.uploadDir, orgId);
    ensureDir(dir);
    await fs.writeFile(path.join(dir, filename), buffer);
  }

  getFileStream(orgId: string, filename: string, range?: { start: number; end: number }): Readable {
    return createReadStream(this.getFilePath(orgId, filename), range);
  }

  async deleteFile(orgId: string, filename: string): Promise<void> {
    try {
      await fs.unlink(this.getFilePath(orgId, filename));
    } catch {}
  }

  async getFileSize(orgId: string, filename: string): Promise<number> {
    const stat = await fs.stat(this.getFilePath(orgId, filename));
    return stat.size;
  }

  getContentType(filename: string): string {
    return mimeFromExt(filename);
  }

  getFileUrl(orgId: string, filename: string): string {
    return `/api/public/file/${orgId}/${filename}`;
  }

  async getDiskUsage(): Promise<{ used: number; available: number; total: number }> {
    const stats = await fs.statfs(this.uploadDir);
    return {
      used: (stats.blocks - stats.bfree) * stats.bsize,
      available: stats.bavail * stats.bsize,
      total: stats.blocks * stats.bsize,
    };
  }

  async getUploadDirSize(): Promise<number> {
    let total = 0;
    try {
      const orgs = await fs.readdir(this.uploadDir);
      for (const org of orgs) {
        const orgPath = path.join(this.uploadDir, org);
        const stat = await fs.stat(orgPath);
        if (stat.isDirectory()) {
          const files = await fs.readdir(orgPath);
          for (const file of files) {
            const filePath = path.join(orgPath, file);
            const fileStat = await fs.stat(filePath);
            total += fileStat.size;
          }
        }
      }
    } catch {}
    return total;
  }

  async listAllFiles(): Promise<Array<{ orgId: string; filename: string; size: number }>> {
    const files: Array<{ orgId: string; filename: string; size: number }> = [];
    try {
      const orgs = await fs.readdir(this.uploadDir);
      for (const org of orgs) {
        const orgPath = path.join(this.uploadDir, org);
        const stat = await fs.stat(orgPath);
        if (stat.isDirectory()) {
          const orgFiles = await fs.readdir(orgPath);
          for (const file of orgFiles) {
            const filePath = path.join(orgPath, file);
            const fileStat = await fs.stat(filePath);
            files.push({ orgId: org, filename: file, size: fileStat.size });
          }
        }
      }
    } catch {}
    return files;
  }
}
