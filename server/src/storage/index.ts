import { config } from "../config";
import { StorageProvider } from "./provider";
import { LocalStorageProvider } from "./local";
import { R2StorageProvider } from "./r2";

export type { StorageProvider } from "./provider";
export { LocalStorageProvider } from "./local";
export { R2StorageProvider } from "./r2";

let storageInstance: StorageProvider | null = null;

export function getStorage(): StorageProvider {
  if (!storageInstance) {
    if (config.storage.provider === "r2") {
      const r2Config = config.storage.r2;
      if (!r2Config.accountId || !r2Config.accessKeyId || !r2Config.secretAccessKey || !r2Config.bucketName) {
        throw new Error("R2 storage provider requires: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
      }
      storageInstance = new R2StorageProvider(r2Config);
    } else {
      storageInstance = new LocalStorageProvider();
    }
  }
  return storageInstance;
}

export async function saveFile(orgId: string, filename: string, buffer: Buffer): Promise<void> {
  return getStorage().saveFile(orgId, filename, buffer);
}

export function getFileStream(orgId: string, filename: string, range?: { start: number; end: number }) {
  return getStorage().getFileStream(orgId, filename, range);
}

export async function deleteFile(orgId: string, filename: string): Promise<void> {
  return getStorage().deleteFile(orgId, filename);
}

export async function getFileSize(orgId: string, filename: string): Promise<number> {
  return getStorage().getFileSize(orgId, filename);
}

export function getContentType(filename: string): string {
  return getStorage().getContentType(filename);
}

export function getFileUrl(orgId: string, filename: string): string {
  return getStorage().getFileUrl(orgId, filename);
}

export async function getDiskUsage(): Promise<{ used: number; available: number; total: number }> {
  const storage = getStorage();
  if (storage instanceof LocalStorageProvider) {
    return storage.getDiskUsage();
  }
  return { used: 0, available: 0, total: 0 };
}

export async function getUploadDirSize(): Promise<number> {
  const storage = getStorage();
  if (storage instanceof LocalStorageProvider) {
    return storage.getUploadDirSize();
  }
  return 0;
}

export async function listAllFiles(): Promise<Array<{ orgId: string; filename: string; size: number }>> {
  const storage = getStorage();
  if (storage instanceof LocalStorageProvider) {
    return storage.listAllFiles();
  }
  return [];
}

export function ensureUploadDir(): string {
  const storage = getStorage();
  if (storage instanceof LocalStorageProvider) {
    return config.upload.dir;
  }
  return "";
}
