import { config } from "../config";
import * as Minio from "minio";

let minioClient: Minio.Client | null = null;

export function getMinio(): Minio.Client {
  if (!minioClient) {
    minioClient = new Minio.Client({
      endPoint: config.minio.endpoint,
      port: config.minio.port,
      useSSL: config.minio.useSSL,
      accessKey: config.minio.accessKey,
      secretKey: config.minio.secretKey,
    });
  }
  return minioClient;
}

export async function ensureBucket(): Promise<void> {
  const client = getMinio();
  const exists = await client.bucketExists(config.minio.bucket);
  if (!exists) {
    await client.makeBucket(config.minio.bucket, "us-east-1");
    console.log(`MinIO bucket "${config.minio.bucket}" created`);
  }
}

export function getBucketUrl(objectName: string): string {
  const endpoint = config.minio.endpoint;
  const port = config.minio.port;
  const bucket = config.minio.bucket;
  if (endpoint === "localhost" || endpoint === "minio") {
    return `http://${endpoint}:${port}/${bucket}/${objectName}`;
  }
  return `https://${endpoint}/${bucket}/${objectName}`;
}
