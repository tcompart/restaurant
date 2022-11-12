#!/usr/bin/env bash

function create_network_if_needed() {
  docker network inspect mynetwork >/dev/null 2>&1 || docker network create mynetwork
}
function remove_resources() {
  docker stop restaurant-postgres
  docker network rm mynetwork
}
function setup_environment() {
  create_network_if_needed
  mkdir -p /tmp/database
}

setup_environment
docker run --rm --network mynetwork --name restaurant-postgres -p 5455:5432 -v /tmp/database:/var/lib/postgresql/data -e POSTGRES_PASSWORD=secret -e POSTGRES_USER=root -e POSTGRES_DB=postgresDB -d postgres
sleep 5
docker run -e NODE_ENV=production --rm --network mynetwork --name restaurant -p 8080:3000 -d restaurant
