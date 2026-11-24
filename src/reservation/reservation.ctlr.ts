import {ReservationDTO} from "./reservation.dto";
import {Identifiable, ReservationImpl} from "./reservation.impl";
import MaitreDeSalle from "./maitreDeSalle";
import dayjs from "dayjs";
import {ReservationRepository} from "./reservationRepository";
import {BadRequest, TooManyReservationError} from "./errorHandling";
import {Reservation} from "./reservation";
import {isValidDate} from "../validation/validator.date";
import {Configuration, Default} from "./configuration";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

export class ReservationController {
  private readonly _repository: ReservationRepository;
  private readonly _maitreDeSalle: MaitreDeSalle;
  private readonly _configuration: Configuration;

  constructor(db: ReservationRepository, configuration: Configuration = new Default()) {
    this._repository = db;
    this._configuration = configuration;
    this._maitreDeSalle = new MaitreDeSalle(
        this._configuration.opens,
        this._configuration.lastSeating,
        this._configuration.seatingDuration,
        this._configuration.tables,
    );
  }

  async post(reservationDTO: ReservationDTO): Promise<Identifiable> {
    const reservation = this.validateReservation(reservationDTO);
    return this.applyReservation(reservation);
  }

  async checkAvailability(at: string, quantity: number): Promise<boolean> {
    if (typeof at !== "string" || !isValidDate(at)) {
      throw new BadRequest("at must be a valid date", "400");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequest("quantity must be a positive integer", "400");
    }

    const date = new Date(at);
    const reservations = await this._repository.read(date);
    return this._maitreDeSalle.isAvailable(date, reservations, quantity);
  }

  async checkAvailabilityFromTo(from: string, to: string, quantity: number): Promise<Date[]> {
    if (!isValidDate(from) || !isValidDate(to)) {
      throw new BadRequest("from and to must be valid dates", "400");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequest("quantity must be a positive integer", "400");
    }
    const fromDate = new Date(from);
    const toDate = new Date(to);
    if (fromDate.getTime() > toDate.getTime()) {
      throw new BadRequest("from must be before to", "400");
    }
    const reservations = await this._repository.read(fromDate, toDate);
    return this._maitreDeSalle.getAvailableDates(fromDate, toDate, reservations, quantity);
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