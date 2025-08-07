# --- BUILDER stage ---
FROM node:24-alpine AS builder
ARG PACKAGE_NAME

RUN corepack enable

WORKDIR /repo

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter "@service/${PACKAGE_NAME}" run generate
RUN pnpm --filter "@service/${PACKAGE_NAME}" run build

RUN pnpm --filter "@service/${PACKAGE_NAME}" deploy "deploy/${PACKAGE_NAME}" --prod

RUN mkdir -p /repo/deploy/${PACKAGE_NAME}/database
RUN cp -r /repo/services/${PACKAGE_NAME}/database/* /repo/deploy/${PACKAGE_NAME}/database/

# --- MIGRATE stage ---
FROM node:24-alpine AS migrate
ARG PACKAGE_NAME

RUN corepack enable

WORKDIR /app

COPY --from=builder /repo/deploy/${PACKAGE_NAME}/node_modules ./node_modules
COPY --from=builder /repo/deploy/${PACKAGE_NAME}/package.json ./package.json
COPY --from=builder /repo/services/${PACKAGE_NAME}/database ./database
COPY --from=builder /repo/database/prisma ./prisma

RUN mkdir -p /tmp/prisma-engines \
    && cp /app/database/*.so.node /tmp/prisma-engines || echo "No .so.node files found"

CMD ["npm", "run", "deploy"]

# --- RUNNER stage ---
FROM node:24-alpine AS runner
ARG PACKAGE_NAME

RUN corepack enable

RUN apk --no-cache add dumb-init
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

COPY --from=builder --chown=nodejs:nodejs /repo/deploy/${PACKAGE_NAME}/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /repo/deploy/${PACKAGE_NAME}/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /repo/deploy/${PACKAGE_NAME}/package.json ./package.json
COPY --from=builder --chown=nodejs:nodejs /repo/services/${PACKAGE_NAME}/database ./database

RUN mkdir -p /tmp/prisma-engines \
    && cp /app/database/*.so.node /tmp/prisma-engines || echo "No .so.node files found"

USER nodejs

EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/app.js"]
