import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import MaitreDeSalle from "./maitreDeSalle";
import dayjs from "dayjs";
import {Table} from "./table";
import {TimeOfDay} from "./timeOfDay";
import {ReservationRepository} from "./reservationRepository";
import {BadRequest, TooManyReservationError} from "./errorHandling";
import {Reservation} from "./reservation";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

export class ReservationController {
  private readonly _repository: ReservationRepository;
  private readonly _tables: Table[];

  constructor(db: ReservationRepository, tables: Table[]) {
    this._repository = db;
    this._tables = tables;
  }

  post(reservationDTO: ReservationDTO): Promise<Identifiable> {
    return new Promise<Identifiable>((resolve, reject) => {
      (async () => {
        let reservation = this.validateReservation(reservationDTO, reject);
        if (reservation?.at) {
          await this.applyReservation(reservation, resolve, reject);
        }
      })();
    });
  }

  private validateReservation(reservationDTO: ReservationDTO, reject: (reason?: any) => void) {
    let reservation = null;
    try {
      reservation = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
    } catch (error: any) {
      reject(new BadRequest(error.message, "400"));
    }
    return reservation;
  }

  private async applyReservation(reservation: any, resolve: (value: (PromiseLike<Identifiable> | Identifiable)) => void, reject: (reason?: any) => void) {
    try {
      const reservations = await this._repository.findReservationsOnDate(reservation?.at);
      const maitre = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(22), dayjs.duration(90), this._tables, true);
      if (maitre.willAccept(reservation?.at, reservations ?? [], reservation)) {
        resolve(this._repository.create(reservation));
      }
      reject(new BadRequest("Maître De Salle does not accept reservation", "400"));
    } catch (reason: any) {
      if (reason instanceof TooManyReservationError) {
        reject(new TooManyReservationError());
      }
      reject(new BadRequest(reason.message, reason.name));
    }
  }

  get() : Reservation[] {
    return [];
  }
}