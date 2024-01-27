import {Repository, ReservationRepository} from "./reservation";
import {FakeDatabase} from "./fake-database";

export function getReservationRepository(): ReservationRepository {
    return process.env["NODE_ENV"] !== 'PROD' ? new FakeDatabase() : new Repository();
}