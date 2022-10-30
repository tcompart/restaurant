# Build Stage 1
# This build created a staging docker image
#
FROM node:10.15.2-alpine AS build
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY ./ ./
RUN npm run build

# Build Stage 2
# This build takes the production build from staging build
#
FROM node:10.15.2-alpine
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY --from=build /usr/src/app/dist ./
EXPOSE 3000
CMD [ "node", "./index.js" ]