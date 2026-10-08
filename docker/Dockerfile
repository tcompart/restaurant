# Build Stage 1
# This build created a staging docker image
#
FROM node:24 AS build
LABEL org.opencontainers.image.authors="Torsten Compart schreibtanmich@gmail.com"
WORKDIR /app
COPY . .

RUN npm ci --ignore-scripts
RUN ./node_modules/.bin/prisma generate
RUN npm run build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:24-slim AS production
ARG USERNAME=nonroot
ARG USER_UID=1111
ARG USER_GID=$USER_UID
WORKDIR /app
RUN groupadd --gid "${USER_GID}" "${USERNAME}" \
    && useradd --uid "${USER_UID}" --gid "${USER_GID}" -m "${USERNAME}"
USER $USERNAME
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
ENV NODE_ENV=prod
EXPOSE 3000
CMD ["node ./dist/index.js"]