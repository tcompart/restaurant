#!/bin/sh
docker-compose up -d db
npm run build
npx prisma generate
npx prisma migrate dev --name init
npm run ci
docker-compose down