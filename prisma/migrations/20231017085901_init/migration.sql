/*
  Warnings:

  - The primary key for the `Reservation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `name` on the `Reservation` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Made the column `createdAt` on table `Reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `at` on table `Reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `Reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Reservation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `Reservation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "at" SET NOT NULL,
ALTER COLUMN "at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT 0,
ADD CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id");
