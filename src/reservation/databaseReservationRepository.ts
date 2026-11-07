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

    async read(at: Date, max: Date = new Date()): Promise<Reservation[]> {
        if (at.getTime() > max.getTime()) {
            throw new UnexpectedError("Unable to read reservations.", new Error("Date is in the future."));
        }
        const start = new Date(at);
        start.setHours(0, 0, 0, 0);
        const end = new Date(at);
        end.setHours(23, 59, 59, 999);
        return prisma.reservation.findMany({
            where: {
                at: {
                    lte: end,
                    gte: start
                }
            }
        })
    }

    async deleteAll(): Promise<number | null> {
        try {
            const result = await prisma.reservation.deleteMany();
            return result.count;
        } catch (e) {
            throw new UnexpectedError("Record to delete does not exist.", e as Error);
        }
    }

    async delete(id: string): Promise<Identifiable | null> {
        try {
            return await prisma.reservation.delete({
                where: {
                    id: id
                }
            });
        } catch (e) {
            throw new UnexpectedError("Record to delete does not exist.", e as Error);
        }
    }
}