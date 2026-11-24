import {FakeDatabase} from "./fake-database";
import {ReservationRepository} from "./reservationRepository";
import {DatabaseReservationRepository} from "./databaseReservationRepository";

const fakeDatabase = new FakeDatabase();

export function getReservationRepository(): ReservationRepository {
    return process.env["NODE_ENV"] !== 'PROD' ? fakeDatabase : new DatabaseReservationRepository();
}