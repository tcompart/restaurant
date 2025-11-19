import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import MaitreDeSalle from "./maitreDeSalle";
import dayjs from "dayjs";
import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {ReservationRepository} from "./reservationRepository";
import {BadRequest, TooManyReservationError} from "./errorHandling";
import {Reservation} from "./reservation";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

export class ReservationController {
  private readonly _repository: ReservationRepository;
  private readonly _maitreDeSalle: MaitreDeSalle;

  constructor(db: ReservationRepository, tables: Table[]) {
    this._repository = db;
    this._maitreDeSalle = new MaitreDeSalle(
      new TimeOfDay(8),
      new TimeOfDay(20, 30),
      dayjs.duration({minutes: 100}),
      tables,
      false
    );
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

  private async applyReservation(reservation: ReservationImpl, resolve: (value: (PromiseLike<Identifiable> | Identifiable)) => void, reject: (reason?: any) => void) {
    try {
      const reservations = await this._repository.read(reservation?.at);
      if (this._maitreDeSalle.willAccept(reservation?.at, reservations ?? [], reservation)) {
        resolve(this._repository.create(reservation));
      }
      reject(new BadRequest("Maître De Salle does not accept reservation", "400"));
    } catch (error_: any) {
      if (error_ instanceof TooManyReservationError) {
        reject(new TooManyReservationError());
      }
      reject(new BadRequest(error_.message, error_.name));
    }
  }

  async get(params? : Map<string, object>) : Promise<Reservation[]> {
    const realMin: Date = dayjs(0).toDate();
    const realMax: Date = dayjs().add(1, 'month').toDate();
    const min = params?.get('min') as unknown as string;
    const max = params?.get('max') as unknown as string;
    return await this._repository.read(min == null ? realMin : new Date(min), max == null ? realMax : new Date(max));
  }
}