import { Readable } from "stream";

export interface StorageProvider {
  saveFile(orgId: string, filename: string, buffer: Buffer): Promise<void>;
  getFileStream(orgId: string, filename: string, range?: { start: number; end: number }): Readable;
  deleteFile(orgId: string, filename: string): Promise<void>;
  getFileSize(orgId: string, filename: string): Promise<number>;
  getContentType(filename: string): string;
  getFileUrl(orgId: string, filename: string): string;
}
