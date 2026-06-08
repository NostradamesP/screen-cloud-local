import "dotenv/config";
import path from "path";

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

  upload: {
    dir: process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"),
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
