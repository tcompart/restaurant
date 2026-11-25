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

Table inventory

* Each installation serves one restaurant. Its table inventory is read once at
  startup from `config/tables.json`, or from the file named by the
  `TABLE_CONFIG_FILE` environment variable (relative paths are resolved from the
  working directory). Restart the server after changing the file.
* The supplied default retains the previous single 10-seat table. Replace it
  with any mix of table types, for example:

  ```json
  {
    "tableTypes": [
      {"name": "Two-seater", "shape": "square", "minCapacity": 1, "maxCapacity": 2, "quantity": 6, "communityTable": false},
      {"name": "Four-seater", "shape": "square", "minCapacity": 1, "maxCapacity": 4, "quantity": 4, "communityTable": false},
      {"name": "Round table", "shape": "round", "minCapacity": 1, "maxCapacity": 8, "quantity": 2, "communityTable": false},
      {"name": "Large round table", "shape": "round", "minCapacity": 1, "maxCapacity": 12, "quantity": 1, "communityTable": false}
    ]
  }
  ```

* Each entry requires non-empty `name` and `shape` strings, positive integer
  capacities with `minCapacity <= maxCapacity`, a positive integer `quantity`,
  and a boolean `communityTable`. A maximum of 10,000 tables can be configured.
  An invalid or missing file prevents startup. Shape and name are descriptive;
  capacity and the community flag determine seating. A normal table is
  exclusive to one party, while a community table can seat multiple parties up
  to its capacity. The configured minimum applies to each party.
* For Docker, mount a configuration file into the container and set
  `TABLE_CONFIG_FILE` to its container path. The file is not stored in the
  reservations database and changing the image's bundled file is not durable.
* Existing reservations are not assigned to a persistent table. They are
  reallocated against the current inventory, preferring the smallest suitable
  table. Check future reservations before reducing capacities or quantities;
  an incompatible inventory can cause availability checks to fail. Table
  combinations, time-dependent minimums, and concurrency-safe booking are not
  implemented yet.

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
