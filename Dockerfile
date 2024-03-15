FROM node:20-alpine3.18 as base

RUN apk --no-cache add curl
RUN curl -sL https://unpkg.com/@pnpm/self-installer | node

# All deps stage
FROM base as deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --force

# Production only deps stage
FROM base as production-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod
#RUN wget https://gobinaries.com/tj/node-prune --output-document - | /bin/sh && node-prune

# Build stage
FROM base as build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
# Construire l'application
RUN node ace build --ignore-ts-errors

# Production stage
FROM base
ARG APP_RELEASE
ENV APP_RELEASE=${APP_RELEASE}
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 3333
CMD ["node", "./bin/server.js"]
