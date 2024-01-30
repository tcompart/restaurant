import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import {BadRequest, ReservationRepository, TooManyReservationError} from "./reservation";
import {createTimeOfDay, Maitred, Table} from "./maitred";
import dayjs from "dayjs";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

export class ReservationController {
  private _repository: ReservationRepository;
  private _tables: Table[];

  constructor(db: ReservationRepository, tables: Table[]) {
    this._repository = db;
    this._tables = tables;
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
        if (reservation?.at) {
          try {
            const reservations = await this._repository.findReservationsOnDate(reservation?.at);
            const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(22), dayjs.duration(90), this._tables, true);
            if (maitred.willAccept(reservation?.at, reservations ?? [], reservation)) {
              resolve(this._repository.create(reservation));
            }
            reject(new BadRequest("Maître D is not accept reservation", "400"));
          } catch (reason: any) {
            if (reason instanceof TooManyReservationError) {
              reject(new TooManyReservationError());
            }
            reject(new BadRequest(reason.message, reason.name));
          }
        }
      })();
    });
  }
}