-- install uuid support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "Reservation"
(
    id          uuid DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP,
    at          TIMESTAMP,
    name        TEXT,
    email       TEXT,
    quantity    INTEGER,
    PRIMARY KEY (id)
);