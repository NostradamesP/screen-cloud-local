import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";
import { StorageProvider } from "./provider";
import path from "path";

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

export interface R2Config {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}

export class R2StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucketName: string;
  private publicUrl?: string;

  constructor(config: R2Config) {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
    this.bucketName = config.bucketName;
    this.publicUrl = config.publicUrl;
  }

  private getKey(orgId: string, filename: string): string {
    return `${orgId}/${filename}`;
  }

  async saveFile(orgId: string, filename: string, buffer: Buffer): Promise<void> {
    const key = this.getKey(orgId, filename);
    const contentType = this.getContentType(filename);
    await this.client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }));
  }

  getFileStream(orgId: string, filename: string, range?: { start: number; end: number }): Readable {
    const key = this.getKey(orgId, filename);
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Range: range ? `bytes=${range.start}-${range.end}` : undefined,
    });
    
    return new Promise((resolve, reject) => {
      this.client.send(command).then((response) => {
        if (response.Body instanceof Readable) {
          resolve(response.Body);
        } else {
          reject(new Error("Invalid response body"));
        }
      }).catch(reject);
    }) as unknown as Readable;
  }

  async deleteFile(orgId: string, filename: string): Promise<void> {
    const key = this.getKey(orgId, filename);
    try {
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }));
    } catch {}
  }

  async getFileSize(orgId: string, filename: string): Promise<number> {
    const key = this.getKey(orgId, filename);
    const response = await this.client.send(new HeadObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    }));
    return response.ContentLength || 0;
  }

  getContentType(filename: string): string {
    return mimeFromExt(filename);
  }

  getFileUrl(orgId: string, filename: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${this.getKey(orgId, filename)}`;
    }
    return `/api/public/file/${orgId}/${filename}`;
  }
}
