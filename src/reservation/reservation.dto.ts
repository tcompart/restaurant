import {Reservation} from "./reservation";

export class ReservationDTO implements Reservation {
    private _at!: string;
    private _email!: string;
    private _name!: string;
    private _quantity!: number;

    constructor(at: string, email: string, name: string, quantity: number) {
        this._at = at;
        this._email = email;
        this._name = name;
        this._quantity = quantity;
    }

    toString(): string {
        return `ReservationDTO for ${this._name} is at ${this._at} for ${this._quantity} people.`;
    }

    get at(): string {
        return this._at;
    }

    set at(value: string) {
        this._at = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }
}