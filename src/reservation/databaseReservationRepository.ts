import {PrismaClient} from '.prisma/client'
import {ReservationRepository} from "./reservationRepository";
import {Identifiable} from "./reservation.impl";
import {Reservation} from "./reservation";
import {BadRequest, UnexpectedError} from "./errorHandling";

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

    async read(at: Date, max?: Date): Promise<Reservation[]> {
        if (max && at.getTime() > max.getTime()) {
            throw new BadRequest("Start date is after end date.", "400");
        }
        const start = new Date(at);
        const end = new Date(max ?? at);
        if (max === undefined) {
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
        }
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