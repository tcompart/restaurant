import {hashCode} from "../hashCodeHelper";
import {ReservationDTO} from "./reservation.dto";
import dayjs from "dayjs";
import {PrismaClient} from '.prisma/client'

export interface Reservation {
    at: string;
    email: string;
    name: string;
    quantity: number;
}

export class BadRequest implements Error {
    constructor(message: string, name: string) {
        this.message = message;
        this.name = name;
    }

    message: string;
    name: string;
}

const advancedFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(advancedFormat)

export class ReservationController {
    private _repository: ReservationRepository;

    constructor(db: ReservationRepository) {
        this._repository = db;
    }

    validate(date: string): boolean {
        const format = "YYYY-MM-DD";
        return dayjs(date, format).format(format) === date;
    }

    post(reservationDTO: ReservationDTO): Promise<Task> {
        dayjs.locale()
        try {
            const localDate = reservationDTO.at.substring(0, 10);
            if (!this.validate(localDate)) {
                throw new Error(`${localDate} is a not valid date`);
            }
            const date = new Date(reservationDTO.at)
            return this._repository.create(new ReservationImpl(date.toISOString(), reservationDTO.email, reservationDTO.name, reservationDTO.quantity));
        } catch (e) {
            throw new BadRequest(`invalid date defined. Outcome is '${e}'. Input was '${reservationDTO.at}'.`, "400");
        }
    }
}


export class ReservationImpl implements Reservation {
    at: string;
    private createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: string, email: string, name: string, quantity: number) {
        this.createdAt = dayjs().toDate();
        this.at = at;
        this.email = email;
        this.name = name;
        this.quantity = quantity;
    }

    get hashcode(): number {
        return hashCode(JSON.stringify(this))
    }
}

export enum Task {
    CompletedTask = "Completed",
    Aborted = "Aborted",
}

const prisma = new PrismaClient()

export class Repository implements ReservationRepository {
    async create(reservation: Reservation): Promise<Task> {
        console.log("Reservation was given ", reservation.at, " ", reservation.email);
        const returns = await prisma.reservation.create({data: reservation});
        return returns ? Task.CompletedTask : Task.Aborted;
    }

}

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Task>
}