# Build Stage 1
# This build created a staging docker image
#
FROM node:18 AS build
WORKDIR /usr/src/app

COPY ../package*.json ./
COPY ../src src
COPY ../config/env.PROD ./.env
COPY ../tsconfig.json ./
COPY ../prisma/ ./prisma/
RUN npm ci --quiet
RUN npm run build
RUN npx prisma generate

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:18-slim
WORKDIR /usr/src/app
RUN apt-get clean && apt-get update -yy && apt install -yy docker.io
COPY --from=build /usr/src/app/dist ./
COPY --from=build /usr/src/app/.env ./
COPY --from=build /usr/src/app/prisma ./prisma/
COPY --from=build /usr/src/app/node_modules/ ./node_modules/
ENV NODE_ENV PROD
EXPOSE 3000
ENTRYPOINT ["/bin/sh", "-c" , "npx prisma deploy && node ./index.js"]