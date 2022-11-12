#!/usr/bin/env bash
docker stop restaurant-postgres
docker stop "$(docker ps -q --filter ancestor=restaurant)"
docker network rm mynetwork
