#!/bin/sh
if [ ! -f .env ]; then
  cp config/env.LOCAL .env
fi
npm run build
npx prisma generate
npx prisma migrate dev --name init
node ./dist/index.js