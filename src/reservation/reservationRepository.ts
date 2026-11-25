import {Identifiable} from "./reservation.impl";
import {Reservation} from "./reservation";

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Identifiable>

    read(at: Date): Promise<Reservation[]>;

    // Both endpoints are inclusive; filters reservation start times.
    read(min: Date, max: Date): Promise<Reservation[]>;

    delete(id: string): Promise<Identifiable | null>;
}