import {Identifiable} from "./reservation.impl";
import {Reservation} from "./reservation";

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Identifiable>

    findReservationsOnDate(at: Date): Promise<Reservation[] | null>;

    delete(id: string): Promise<Identifiable | null>
}