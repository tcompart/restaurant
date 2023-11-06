# Build Stage 1
# This build created a staging docker image
#
FROM node:20 AS build
MAINTAINER Torsten Compart schreibtanmich@gmail.com
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:20-slim as production
WORKDIR /app
RUN apt-get clean && apt-get update -yy && apt install -yy docker.io
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config/env.PROD ./.env
ENV NODE_ENV PROD
EXPOSE 3000
CMD node ./dist/index.js