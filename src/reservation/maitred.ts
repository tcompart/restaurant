import {Duration} from "dayjs/plugin/duration";
import dayjs, {Dayjs} from "dayjs";
import {Reservation, TooManyReservationError} from "./reservation";

const isBetween = require('dayjs/plugin/isBetween');
const duration = require('dayjs/plugin/duration')
dayjs.extend(isBetween);
dayjs.extend(duration);


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
    private today = new Date();

    constructor(hour: number, minutes?: number) {
        this._hour = hour;
        this._minutes = minutes ?? 0;
    }

    atDate(day: Date): TimeOfDay {
        this.today = new Date();
        this.today.setUTCFullYear(day.getUTCFullYear(), day.getUTCMonth(), day.getDate());
        return this;
    }

    toDate(): Date {
        const date = this.today;
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
        const reservationStartConflicts = start.valueOf() >= this._starts.valueOf() && start.valueOf() <= this._ends.valueOf();
        const reservationEndConflicts = end.valueOf() >= this._starts.valueOf() && end.valueOf() <= this._ends.valueOf();
        return reservationStartConflicts || reservationEndConflicts;
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
    private readonly debug!: boolean;

    constructor(opens: TimeOfDay, lastSeating: TimeOfDay, seatingDuration: Duration, tables: Table[], debug = false) {
        this.opens = opens;
        this.lastSeating = lastSeating;
        this.seatingDuration = seatingDuration;
        this.tables = tables;
        this.debug = debug;
    }

    willAccept(now: Date, existingReservations: Reservation[], reservation : Reservation) {
        if (this.tables.length == 0) {
            return false;
        } else if (dayjs(now).isBefore(this.opens.atDate(now).toDate())) {
            return false;
        } else if (dayjs(now).isAfter(this.lastSeating.atDate(now).toDate())) {
            return false;
        } else if (existingReservations.length == 0) {
            return true;
        } else {
            const seating = new Seating(reservation, this.seatingDuration);
            const relevantReservations = existingReservations
                .filter(reservation => seating.overlaps(reservation, this.seatingDuration));
            const tables = this.allocate(relevantReservations, this.tables);
            if (this.debug) {
                console.log("[DEBUG] reservation: '",reservation,"'; found relevant reservation: '", relevantReservations, "'");
                console.log("[DEBUG] existing tables: '",this.tables,"'; found free tables: '", tables, "'");
            }
            if (tables.length == 0) {
                throw new TooManyReservationError();
            }
            return tables.length > 0;
        }
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