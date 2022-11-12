#!/usr/bin/env bash
npm run build
npm run postinstall
docker run --rm --network mynetwork --name restaurant-postgres -p 5455:5432 -v /tmp/database:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=root -e POSTGRES_DB=postgresDB -d postgres
dotenv -e config/env.LOCAL node dist/index.js