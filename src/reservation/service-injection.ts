import {Repository, Reservation, ReservationRepository, Task} from "./reservation";

const giveFake = process.env["NODE_ENV"] === "test";

export class FakeDatabase extends Array<Reservation> implements ReservationRepository {
    create(reservation: Reservation): Promise<Task> {
        this.push(reservation)
        return Promise.resolve(Task.CompletedTask);
    }

    findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
        return Promise.resolve(this.filter(r => new Date(r.at).toDateString() === at.toDateString()));
    }

}

export function getReservationRepository(): ReservationRepository {
    console.log("Should return Fake? ", process.env["NODE_ENV"]);
    return giveFake ? new FakeDatabase() : new Repository();
}