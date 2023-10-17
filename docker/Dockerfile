# Build Stage 1
# This build created a staging docker image
#
FROM node:18 AS build
WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]
COPY .env ./.env
COPY prisma ./prisma/
COPY src ./
COPY tsconfig.json ./

RUN npm ci --quiet
RUN npm run build
RUN npx prisma generate

COPY . .

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:18-slim as production
WORKDIR /app
RUN apt-get clean && apt-get update -yy && apt install -yy docker.io
COPY --from=build /app/dist ./
COPY --from=build /app/.env ./
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules/ ./node_modules/
ENV NODE_ENV PROD
EXPOSE 3000
CMD source migrate-and-start.sh