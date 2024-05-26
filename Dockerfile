FROM node:20 AS base
WORKDIR /app
COPY . .
RUN apt-get update && \
apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev


FROM base as build
RUN npm ci && npm run build:prod --workspaces


FROM base AS prod-deps
RUN cd api && npm install --production


FROM node:20
WORKDIR /app
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/api/dist /app/api/dist
COPY --from=build /app/api/assets /app/api/assets
COPY --from=build /app/client/build /app/client/build
ENV NODE_ENV="production"
EXPOSE 3001
CMD [ "node", "api/dist/main"]
