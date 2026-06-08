import "dotenv/config";

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  host: process.env.HOST ?? "0.0.0.0",
  nodeEnv: process.env.NODE_ENV ?? "development",

  database: {
    url: process.env.DATABASE_URL ?? "postgres://signage:signage@localhost:5432/signage",
  },

  redis: {
    url: process.env.REDIS_URL ?? "redis://localhost:6379",
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: parseInt(process.env.MINIO_PORT ?? "9000", 10),
    accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
    bucket: process.env.MINIO_BUCKET ?? "signage",
    useSSL: process.env.MINIO_USE_SSL === "true",
  },

  jwt: {
    secret: process.env.JWT_SECRET ?? "dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
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
