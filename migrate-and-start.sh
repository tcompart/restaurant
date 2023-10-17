#!/bin/sh
npm run build
docker-compose up -d db
npx prisma generate
npx prisma migrate dev --name init
node ./dist/index.js