import {Repository, Reservation, ReservationRepository, Task} from "./reservation";

const giveFake = process.env["NODE_ENV"] === "TEST";

export class FakeDatabase extends Array<Reservation> implements ReservationRepository {
    create(reservation: Reservation): Promise<Task> {
        this.push(reservation)
        return Promise.resolve(Task.CompletedTask);
    }

    getAll(): Promise<Reservation[] | null> {
        return Promise.resolve(this);
    }

    findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
        return Promise.resolve(this.filter(r => new Date(r.at).toDateString() === at.toDateString()));
    }

}

export function getReservationRepository(): ReservationRepository {
    return giveFake ? new FakeDatabase() : new Repository();
}