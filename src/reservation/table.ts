import {Seating} from "./seating";

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