import {Identifiable, ReservationImpl} from "./reservation.impl";
import {Reservation} from "./reservation";
import {v4 as uuid} from "uuid";
import {ReservationRepository} from "./reservationRepository";

export class FakeDatabase extends Array<ReservationImpl> implements ReservationRepository {
  create(reservation: Reservation): Promise<Identifiable> {
    const reservationImpl = new ReservationImpl(String(reservation.at), reservation.email, reservation.name, reservation.quantity);
    reservationImpl.id = uuid();
    this.push(reservationImpl);
    return Promise.resolve(reservationImpl);
  }

  findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
    return Promise.resolve(this.filter(r => new Date(r.at).toDateString() === at.toDateString()));
  }

  removeElementWithId = (value: string): Identifiable | null => {
    for (let i = 0; i < this.length; i++) {
      if (this[i].id === value) {
        return this.splice(i, 1)[0];
      }
    }
    throw new Error("Nothing found");
  }

  delete(id: string): Promise<Identifiable | null> {
    return Promise.resolve(this.removeElementWithId(id));
  }

}