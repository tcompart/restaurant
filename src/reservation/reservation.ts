import {ReservationDTO} from "./reservation.dto";
import {PrismaClient} from '.prisma/client'
import {ReservationImpl} from "./reservation.impl";

export interface Reservation {
    at: Date | string;
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
        return new Promise<Task>((resolve, reject) => {
            const reservation = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity);
            return this._repository.findReservationsOnDate(reservation.at)
                .then(reservationsOnDate => {
                    if (reservationsOnDate) {
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

    async getAll(): Promise<Reservation[] | null> {
        return prisma.reservation.findMany();
    }

    findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
        const start = new Date(at.setHours(0, 0, 0, 0));
        const end = new Date(at.setHours(23, 59, 59, 59));
        return prisma.reservation.findMany({
            where: {
                at: {
                    lte: end,
                    gte: start
                }
            }
        })
    }

}

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Task>

    getAll(): Promise<Reservation[] | null>

    findReservationsOnDate(at: Date): Promise<Reservation[] | null>;
}