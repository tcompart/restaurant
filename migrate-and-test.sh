#!/bin/sh

if ! docker info > /dev/null 2>&1; then
  echo "This script uses docker, and it isn't running - please start docker and try again!" >&2
  exit 1
fi

docker run -v /var/run/docker.sock:/var/run/docker.sock -d --name restaurant-postgres -p 5455:5432 -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=root -e POSTGRES_DB=postgres postgres:latest
[ $? != 0 ] && exit 3;

npm run test:ci
