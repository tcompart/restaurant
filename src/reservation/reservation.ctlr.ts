import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import {BadRequest, ReservationRepository} from "./reservation";

export class ReservationController {
    private _repository: ReservationRepository;

    constructor(db: ReservationRepository) {
        this._repository = db;
    }

    async post(reservationDTO: ReservationDTO): Promise<Identifiable> {
        return new Promise<Identifiable>((resolve, reject) => {
            const reservation = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
            return this._repository.findReservationsOnDate(reservation.at)
                .then(reservationsOnDate => {
                    if (Array.isArray(reservationsOnDate)) {
                        const amount = reservationsOnDate
                            .map(r => r.quantity)
                            .reduce((a, b) => a + b, 0);
                        if ((amount + reservationDTO.quantity) >= 10) {
                            reject(new BadRequest("Too many reservations.", "409"));
                        }
                        return amount;
                    }
                    return 0;
                })
                .then(() => resolve(this._repository.create(reservation)));
        })
            .catch((reason) => Promise.reject(new BadRequest(reason.message, "400")));
    }
}