import {FakeDatabase} from "./fake-database";
import {ReservationRepository} from "./reservationRepository";
import {DatabaseReservationRepository} from "./databaseReservationRepository";

export function getReservationRepository(): ReservationRepository {
    return process.env["NODE_ENV"] !== 'PROD' ? new FakeDatabase() : new DatabaseReservationRepository();
}