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
ARG HOST
ARG APP_KEY
ARG DB_HOST
ARG DB_PORT
ARG DB_USER
ARG DB_PASSWORD
ARG DB_DATABASE
ARG SESSION_DRIVER
ARG URL_API

ENV APP_RELEASE=${APP_RELEASE}
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV TZ=Indian/Reunion
ENV LOG_LEVEL=info
ENV PORT=3335
ENV HOST=$HOST
ENV APP_KEY=$APP_KEY
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE
ENV SESSION_DRIVER=$SESSION_DRIVER
ENV URL_API=$URL_API

WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 3333
CMD ["node", "./bin/server.js"]
