import {PrismaClient} from '.prisma/client'

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

    findReservationsOnDate(at: Date): Promise<Reservation[] | null>;
}