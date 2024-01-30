import {PrismaClient} from '.prisma/client'
import {Identifiable} from "./reservation.impl";

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

export class TooManyReservationError implements Error {
    constructor() {
        this.message = "Too many reservations";
        this.name = "409";
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
    async create(reservation: Reservation): Promise<Identifiable> {
        const created = await prisma.reservation.create({data: reservation});
        return new Promise<Identifiable>((resolve, reject) => {
            if (created) {
                resolve(created);
            } else {
                reject(new Error("Creation was not successful."))
            }
        });
    }

    async findReservationsOnDate(at: Date): Promise<Reservation[] | null> {
        const copy = new Date();
        copy.setUTCFullYear(at.getUTCFullYear(), at.getUTCMonth(), at.getDate());
        const start = new Date(copy.setHours(0, 0, 0, 0));
        const end = new Date(copy.setHours(23, 59, 59, 59));
        return prisma.reservation.findMany({
            where: {
                at: {
                    lte: end,
                    gte: start
                }
            }
        })
    }

    delete(id: string): Promise<Identifiable | null> {
        return new Promise<Identifiable | null>((resolve, rejects) => {
            (async () => {
                try {
                    const result = await prisma.reservation.delete({
                        where: {
                            id: id
                        }
                    });
                    if (result) {
                        resolve(result);
                    }
                } catch (e) {
                    rejects(new Error("Record to delete does not exist."));
                }
            })();
        });
    }
}

export interface ReservationRepository {
    create(reservation: Reservation): Promise<Identifiable>

    findReservationsOnDate(at: Date): Promise<Reservation[] | null>;

    delete(id: string): Promise<Identifiable | null>
}