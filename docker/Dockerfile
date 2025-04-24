# Build Stage 1
# This build created a staging docker image
#
FROM node:20 AS build
LABEL org.opencontainers.image.authors="Torsten Compart schreibtanmich@gmail.com"
WORKDIR /app
COPY . .

RUN npm ci --ignore-scripts
RUN npm run build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:20-slim AS production
ARG USERNAME=nonroot
ARG USER_UID=1111
ARG USER_GID=$USER_UID
WORKDIR /app
RUN groupadd --gid "${USER_GID}" "${USERNAME}" \
    && useradd --uid "${USER_UID}" --gid "${USER_GID}" -m "${USERNAME}" \
    && apt-get update -yy && apt --no-install-recommends install --no-cache -yy sudo docker.io && apt-get clean \
    && echo "${USERNAME}" ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/"${USERNAME}" \
    && chmod 0440 /etc/sudoers.d/"${USERNAME}"
USER $USERNAME
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/config/env.PROD ./.env
ENV NODE_ENV PROD
EXPOSE 3000
CMD ["node ./dist/index.js"]