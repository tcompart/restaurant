import {ReservationDTO} from "./reservation.dto";
import {PrismaClient} from '.prisma/client'
import {ReservationImpl} from "./reservation.impl";

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


export class ReservationController {
    private _repository: ReservationRepository;

    constructor(db: ReservationRepository) {
        this._repository = db;
    }

    post(reservationDTO: ReservationDTO): Promise<Task> {
        try {
            const reservation = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
            return this._repository.create(reservation);
        } catch (e) {
            throw new BadRequest(`invalid date defined. Outcome is '${e}'. Input was '${reservationDTO.at}'.`, "400");
        }
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