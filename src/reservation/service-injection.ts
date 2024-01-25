import {v4 as uuidv4} from 'uuid';
import {Repository, Reservation, ReservationRepository} from "./reservation";
import {Identifiable, ReservationImpl} from "./reservation.impl";

export class FakeDatabase extends Array<ReservationImpl> implements ReservationRepository {
    create(reservation: Reservation): Promise<Identifiable> {
        const reservationImpl = new ReservationImpl(String(reservation.at), reservation.email, reservation.name, reservation.quantity);
        reservationImpl.id = uuidv4();
        this.push(reservationImpl);
        return Promise.resolve(reservationImpl);
    }

    findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
        return Promise.resolve(this.filter(r => new Date(r.at).toDateString() === at.toDateString()));
    }

    removeElementWithId = (value: string): Identifiable | null => {
        for(let i = 0; i < this.length; i++){
            if ( this[i].id === value) {
                return this.splice(i, 1)[0];
            }
        }
        throw new Error("Nothing found");
    }

    delete(id: string): Promise<Identifiable | null> {
        return Promise.resolve(this.removeElementWithId(id));
    }

}

export function getReservationRepository(): ReservationRepository {
    return process.env["NODE_ENV"] !== 'PROD' ? new FakeDatabase() : new Repository();
}