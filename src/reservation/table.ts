import {Seating} from "./seating";

/**
 * A table represents a physical table in the restaurant.
 * It has a number of seats and can be either a community table or a standard table.
 *
 * The table follows the immutable pattern, meaning that once a table is created, it cannot be changed.
 * Instead, when a reservation is made, a new table instance is created with the updated number of seats.
 *
 * The table can determine if it can fit a given seating (reservation) based on the number of seats and whether it is a community table.
 */
export default class Table {
    private readonly _numberOfSeats: number;
    private readonly _communityTable: boolean;

    constructor(numberOfSeats: number, communityTable: boolean = false) {
        this._numberOfSeats = numberOfSeats;
        this._communityTable = communityTable;
    }

    fits(seating: Seating): boolean {
        return this._numberOfSeats >= seating.quantity;
    }

    get isCommunityTable(): boolean {
        return this._communityTable;
    }

    get numberOfSeats(): number {
        return this._numberOfSeats;
    }

    reserve(seating: Seating): Table {
        if (!this.fits(seating)) {
            throw new Error("Table cannot fit the seating.");
        }
        if (!this._communityTable) {
            return new Table(0, false);
        }
        return new Table(this._numberOfSeats - seating.quantity, this._communityTable);
    }
}