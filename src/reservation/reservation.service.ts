import {Reservation} from "./reservation";
import {ReservationDTO} from "./reservation.dto";
import {ReservationImpl} from "./reservation.impl";

export default class ReservationService {
    mapToValidReservation(input: ReservationDTO): Reservation {
            return new ReservationImpl(input.at, input.email, input.name, input.quantity);
    }
}