import {Duration} from "dayjs/plugin/duration";
import dayjs, {Dayjs} from "dayjs";
import {Reservation} from "./reservation";

const isBetween = require('dayjs/plugin/isBetween');
const duration = require('dayjs/plugin/duration')
dayjs.extend(isBetween);
dayjs.extend(duration);


const beginningOfDay = (hour: number, minutes?: number) => {

    // Convert inputTime to a Date object if provided
    let date = new Date();

    // Set the time to 00:00:00
    date.setHours(hour, minutes, 0, 0);

    return date;
};

export class Table {
    private readonly _numberOfSeats: number;
    constructor(numberOfSeats: number) {
        this._numberOfSeats = numberOfSeats;
    }

    fits(seating: Seating): boolean {
        return this._numberOfSeats >= seating.quantity;
    }

    get numberOfSeats(): number {
        return this._numberOfSeats
    }
}
export class TimeOfDay {
    private readonly _hour: number;
    private readonly _minutes: number;

    constructor(hour: number, minutes?: number) {
        this._hour = hour;
        this._minutes = minutes ?? 0;
    }

    toDate(): Date {
        const date = new Date();
        date.setHours(this._hour)
        date.setMinutes(this._minutes);
        return date;
    }
}



export class Seating {
    private readonly _quantity!: number;
    private readonly _starts: Date;
    private readonly _ends: Date;

    constructor(reservation: Reservation, seatingDuration: Duration) {
        this._starts = new Date((reservation.at as Date));
        this._ends = dayjs(reservation.at).add(seatingDuration).toDate();
    }

    get quantity() {
        return this._quantity;
    }

    overlaps(reservation: Reservation, seatingDuration: Duration): boolean {
        const start: Date = new Date(reservation.at);
        const end: Date = dayjs(new Date(reservation.at)).add(seatingDuration).toDate();
        //TODO other reservations are still ongoing (so start is before new start)

        const reservationIsWithinStart = start.valueOf() >= this._starts.valueOf() && start.valueOf() <= this._ends.valueOf();
        const reservationIsWithinEnd = end.valueOf() >= this._starts.valueOf() && end.valueOf() <= this._ends.valueOf();
        return reservationIsWithinStart || reservationIsWithinEnd;
    }
}

export function createTimeOfDay(hour: number, minutes?: number) {
    return new TimeOfDay(hour, minutes);
}

export class Maitred {
    private opens: TimeOfDay;
    private lastSeating: TimeOfDay;
    private seatingDuration: Duration;
    private tables: Table[];

    constructor(opens: TimeOfDay, lastSeating: TimeOfDay, seatingDuration: Duration, tables: Table[]) {
        this.opens = opens;
        this.lastSeating = lastSeating;
        this.seatingDuration = seatingDuration;
        this.tables = tables;
    }

    willAccept(now: Date, existingReservations: Reservation[], reservation : Reservation) {
        if (this.tables.length == 0) {
            return false;
        } else if (dayjs(now).isBefore(this.opens.toDate())) {
            return false;
        } else if (dayjs(now).isAfter(this.lastSeating.toDate())) {
            return false;
        } else if (existingReservations.length == 0) {
            return true;
        } else {
            const seating = new Seating(reservation, this.seatingDuration);
            const relevantReservations = existingReservations
                .filter(reservation => seating.overlaps(reservation, this.seatingDuration));
            const tables = this.allocate(relevantReservations, this.tables);
            return tables.length > 0;
        }
        return false;
    }

    private allocate(relevantReservations: Reservation[], tables: Table[]): Table[] {
        // find for the relevant reservations the correct tables;
        for (const relevantReservation of relevantReservations) {
            const table = tables.filter(table => table.numberOfSeats >= relevantReservation.quantity).shift();
            if (table) {
                tables.splice(tables.indexOf(table), 1);
            } else {
                throw new Error("Inconsistent tables vs. reservations existing. #Reservations: " + relevantReservations.length + "; #Tables: " + tables.length)
            }
        }
        return tables;
    }
}