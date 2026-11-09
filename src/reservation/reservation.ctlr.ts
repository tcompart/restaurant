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
    );
  }

  async post(reservationDTO: ReservationDTO): Promise<Identifiable> {
    const reservation = this.validateReservation(reservationDTO);
    return this.applyReservation(reservation);
  }

  private validateReservation(reservationDTO: ReservationDTO): ReservationImpl {
    try {
      return new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
    } catch (error: any) {
      throw new BadRequest(error.message, "400");
    }
  }

  private async applyReservation(reservation: ReservationImpl): Promise<Identifiable> {
    const reservations = await this._repository.read(reservation.at);
    if (this._maitreDeSalle.willAccept(reservation.at, reservations, reservation)) {
      return this._repository.create(reservation);
    }
    throw new TooManyReservationError();
  }

  async get(params? : Map<string, object>) : Promise<Reservation[]> {
    const realMin: Date = dayjs(0).toDate();
    const realMax: Date = dayjs().add(1, 'month').toDate();
    const min = params?.get('min') as unknown as string;
    const max = params?.get('max') as unknown as string;
    return await this._repository.read(min == null ? realMin : new Date(min), max == null ? realMax : new Date(max));
  }
}