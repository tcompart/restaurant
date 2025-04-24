import {PrismaClient} from '.prisma/client'
import {ReservationRepository} from "./reservationRepository";
import {Identifiable} from "./reservation.impl";
import {Reservation} from "./reservation";
import {UnexpectedError} from "./errorHandling";

const prisma = new PrismaClient()

export class DatabaseReservationRepository implements ReservationRepository {
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

    deleteAll(): Promise<number | null> {
        return new Promise<number | null>((resolve, rejects) => {
            (async () => {
                try {
                    const result = await prisma.reservation.deleteMany();
                    if (result) {
                        resolve(result.count);
                    }
                } catch (e) {
                    const error = new UnexpectedError("Record to delete does not exist.", e as Error);
                    rejects(error);
                }
            })();
        });
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
                    const error = new UnexpectedError("Record to delete does not exist.", e as Error);
                    rejects(error);
                }
            })();
        });
    }
}