FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

FROM base AS build
WORKDIR /app/server
COPY server/package.json server/package-lock.json server/tsconfig.json server/postbuild.js ./
COPY server/src ./src
RUN npm ci && npm run build

FROM base AS runner
WORKDIR /app/server
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=deps /app/server/node_modules ./node_modules
COPY --from=build /app/server/dist ./dist
COPY server/package.json ./
COPY player /app/player
RUN mkdir -p /app/server/uploads && chown -R app:app /app/server
USER app
EXPOSE 3000
CMD ["node", "dist/index.js"]
