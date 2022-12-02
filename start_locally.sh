#!/usr/bin/env bash
npm run build
docker run --rm --name restaurant-postgres -p 5455:5432 -v /tmp/database:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=root -e POSTGRES_DB=postgresDB -d postgres
npm run postinstall
node_modules/.bin/dotenv -e config/env.LOCAL npx prisma migrate deploy
node_modules/.bin/dotenv -e config/env.LOCAL node dist/index.js