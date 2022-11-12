import {Repository, Reservation, ReservationRepository, Task} from "./reservation";

const giveFake = process.env["NODE_ENV"] === "TEST";

class FakeDatabase extends Array<Reservation> implements ReservationRepository {
    create(reservation: Reservation): Promise<Task> {
        this.push(reservation)
        return Promise.resolve(Task.CompletedTask);
    }

}

export function getReservationRepository(): ReservationRepository {
    return giveFake ? new FakeDatabase() : new Repository();
}