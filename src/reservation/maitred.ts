import {Duration} from "dayjs/plugin/duration";
import dayjs from "dayjs";
import {Reservation} from "./reservation";
import {Table} from "./table";
import {TimeOfDay} from "./timeOfDay";
import {Seating} from "./seating";
import {TooManyReservationError} from "./errorHandling";

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