Restaurant [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=tcompart_restaurant&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=tcompart_restaurant)
==========

Development process

* `npm run build`
* `npm test`
* https://medium.com/rahasak/container-vulnerability-scan-with-syft-and-grype-f4ec9cd4d7f1

The Docker image does not contain production credentials. Supply `DATABASE_URL`
and `PORT` through the deployment environment or a protected runtime env file.

When `NODE_ENV` is not `PROD`, reservations use a shared in-memory repository:
they are visible to subsequent requests in the same server process but are lost
when the server restarts. Each server process has its own separate data.

Reservation availability

* `POST /reservations/availability` checks whether a party can be seated without
  creating a reservation. Send `at` as a date/time string and `quantity` as a
  positive integer, for example `{"at":"2026-11-20T12:00:00.000Z","quantity":4}`.
* A successful check returns `{"available":true}` or `{"available":false}`.
  Invalid request data returns `400 Bad request.`
* `GET /reservations/calendar?from=2026-11-25T12%3A00%3A00.000Z&to=2026-11-25T14%3A00%3A00.000Z&quantity=4`
  returns `{"available":[...]}` with available ISO date/time slots in the
  interval from `from` (inclusive) to `to` (exclusive). `quantity` must be a
  positive integer.
