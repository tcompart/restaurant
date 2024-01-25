import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import {BadRequest, ReservationRepository} from "./reservation";

export class ReservationController {
  private _repository: ReservationRepository;

  constructor(db: ReservationRepository) {
    this._repository = db;
  }

  post(reservationDTO: ReservationDTO): Promise<Identifiable> {
    return new Promise<Identifiable>((resolve, reject) => {
      (async () => {
        let reservation = null;
        try {
          reservation = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
        } catch (error: any) {
          reject(new BadRequest(error.message, "400"));
        }
        if (reservation && reservation.at) {
          try {
            const reservations = await this._repository.findReservationsOnDate(reservation.at);
            if (Array.isArray(reservations)) {
              const amount = reservations
              .map(r => r.quantity)
              .reduce((a, b) => a + b, 0);
              if ((amount + reservationDTO.quantity) >= 10) {
                reject(new BadRequest("Too many reservations.", "400"));
              }
            }
            resolve(this._repository.create(reservation));
          } catch (reason: any) {
            reject(new BadRequest(reason.message, reason.name));
          }
        }
      })();
    });
  }
}