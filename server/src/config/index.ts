import "dotenv/config";
import path from "path";

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  if (isProduction && (!value || value.includes("change-me") || value.includes("dev-secret"))) {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv,

  database: {
    url: requiredEnv("DATABASE_URL", "postgres://signage:signage@localhost:5432/signage"),
  },

  redis: {
    url: requiredEnv("REDIS_URL", "redis://localhost:6379"),
  },

  upload: {
    dir: process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
  },

  storage: {
    provider: (process.env.STORAGE_PROVIDER ?? "local") as "local" | "r2",
    r2: {
      accountId: process.env.R2_ACCOUNT_ID ?? "",
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      bucketName: process.env.R2_BUCKET_NAME ?? "",
      publicUrl: process.env.R2_PUBLIC_URL,
    },
  },

  jwt: {
    secret: requiredEnv("JWT_SECRET", "dev-secret-change-me"),
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  },

  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean)
      : isProduction ? [] : true,
  },

  oauth: {
    issuer: process.env.OAUTH_ISSUER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: process.env.OAUTH_REDIRECT_URI,
  },

  defaultOrg: {
    name: process.env.DEFAULT_ORG_NAME ?? "Mi Empresa",
  },
};
