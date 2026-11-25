import {Duration} from "dayjs/plugin/duration";
import dayjs from "dayjs";
import {Reservation} from "./reservation";
import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {Seating} from "./seating";
import {BadRequest, TooManyReservationError} from "./errorHandling";

// The Maitre de Salle is responsible for managing the reservations and ensuring that the restaurant can accommodate them.
// * ideas: emailReservation, PostSMTPOffice,
export default class MaitreDeSalle {
    private readonly opens: TimeOfDay;
    private readonly lastSeating: TimeOfDay;
    private readonly seatingDuration: Duration;
    private readonly tables: Table[];

    constructor(opens: TimeOfDay, lastSeating: TimeOfDay, seatingDuration: Duration, tables: Table[]) {
        this.opens = opens;
        this.lastSeating = lastSeating;
        this.seatingDuration = seatingDuration;
        this.tables = tables;
    }

    willAccept(now: Date, existingReservations: Reservation[], reservation : Reservation) {
        return this.canAccommodate(now, reservation.at, existingReservations, reservation.quantity);
    }

    isAvailable(at: Date, existingReservations: Reservation[], quantity: number): boolean {
        return this.canAccommodate(at, at, existingReservations, quantity);
    }

    getAvailableDates(from: Date, to: Date, existingReservations: Reservation[], quantity: number): Date[] {
        const slots: Date[] = [];

        const slot = new Date(from);
        slot.setHours(from.getHours(), from.getMinutes(), 0, 0);
        slot.setMinutes(Math.floor(slot.getMinutes() / 30) * 30, 0, 0);

        if (slot.getTime() < from.getTime()) {
            slot.setMinutes(slot.getMinutes() + 30);
        }

        while (slot.getTime() < to.getTime()) {
            if (this.isAvailable(slot, existingReservations, quantity)) {
                slots.push(new Date(slot));
            }
            slot.setMinutes(slot.getMinutes() + 30);
        }

        return slots;
    }

    private canAccommodate(checkAt: Date, seatingAt: Date | string, existingReservations: Reservation[], quantity: number): boolean {
        if (this.tables.length <= 0) {
            throw new BadRequest("Maître De Salle does not accept reservation", "400");
        }

        if (this.isInvalidReservationRequest(checkAt)) {
            return false;
        }

        const seating = new Seating({at: seatingAt, quantity}, this.seatingDuration);
        if (existingReservations.length == 0) {
            return this.tables.some(table => table.fits(seating));
        }
        const relevantReservations = existingReservations
            .filter(reservation => seating.overlaps(reservation, this.seatingDuration));
        const tables = this.allocate(relevantReservations, this.tables);
        return tables.some(table => table.fits(seating));
    }

    private isInvalidReservationRequest(now: Date): boolean {
        return this.tables.length == 0 ||
            dayjs(now).isBefore(this.opens.atDate(now).toDate()) ||
            dayjs(now).isAfter(this.lastSeating.atDate(now).toDate());
    }

    private allocate(relevantReservations: Reservation[], tables: Table[]): Table[] {
        // find for the relevant reservations the correct tables;
        const localTables = [...tables];
        for (const relevantReservation of relevantReservations) {
            const table = localTables.find(table => table.fits(new Seating(relevantReservation, this.seatingDuration)));
            if (table) {
                const seating = new Seating(relevantReservation, this.seatingDuration);
                const index = localTables.indexOf(table);
                localTables[index] = table.reserve(seating);
            } else {
                throw new TooManyReservationError()
            }
        }
        return localTables;
    }
}