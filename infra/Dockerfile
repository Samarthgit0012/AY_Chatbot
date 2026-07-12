# --- build stage ---
FROM node:22-slim AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY packages/flows/package.json packages/flows/package.json
COPY apps/api/package.json apps/api/package.json
COPY apps/widget/package.json apps/widget/package.json

RUN npm ci

COPY tsconfig.base.json ./
COPY packages/flows packages/flows
COPY apps/api apps/api
COPY apps/widget apps/widget

RUN npm run build --workspace=@revas/flows \
  && npm run build --workspace=@revas/api \
  && npm run build --workspace=@revas/widget

# --- runtime stage ---
# Keeps the same /repo layout as the build stage (not flattened into /app)
# because npm workspaces links @revas/flows into node_modules as a symlink
# back to packages/flows — flattening would leave that symlink dangling.
FROM node:22-slim AS runtime
WORKDIR /repo
ENV NODE_ENV=production

RUN groupadd --system riva && useradd --system --gid riva riva \
  && mkdir -p /var/log/riva && chown riva:riva /var/log/riva

COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/package.json ./package.json
COPY --from=build /repo/packages/flows/dist ./packages/flows/dist
COPY --from=build /repo/packages/flows/package.json ./packages/flows/package.json
COPY --from=build /repo/apps/api/dist ./apps/api/dist
COPY --from=build /repo/apps/api/package.json ./apps/api/package.json
COPY --from=build /repo/apps/widget/dist ./apps/widget/dist

ENV WIDGET_DIST_PATH=/repo/apps/widget/dist/widget.js
ENV WAL_FILE_PATH=/var/log/riva/leads.jsonl

USER riva
EXPOSE 8080
CMD ["node", "apps/api/dist/server.js"]
