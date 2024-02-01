import {Reservation} from "./reservation";
import {Duration} from "dayjs/plugin/duration";
import dayjs from "dayjs";

export class Seating {
    private readonly _quantity!: number;
    private readonly _starts: Date;
    private readonly _ends: Date;

    constructor(reservation: Reservation, seatingDuration: Duration) {
        this._starts = new Date((reservation.at as Date));
        this._ends = dayjs(reservation.at).add(seatingDuration).toDate();
        this._quantity = reservation.quantity;
    }

    overlaps(reservation: Reservation, seatingDuration: Duration): boolean {
        const start: Date = new Date(reservation.at);
        const end: Date = dayjs(new Date(reservation.at)).add(seatingDuration).toDate();
        const reservationStartConflicts = start.valueOf() >= this._starts.valueOf() && start.valueOf() <= this._ends.valueOf();
        const reservationEndConflicts = end.valueOf() >= this._starts.valueOf() && end.valueOf() <= this._ends.valueOf();
        return reservationStartConflicts || reservationEndConflicts;
    }

    get quantity() {
        return this._quantity;
    }
}