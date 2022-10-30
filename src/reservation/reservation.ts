import {hashCode} from "../hashCodeHelper";

export interface Reservation {
    at: string;
    email: string;
    name: string;
    quantity: number;
}

export class ReservationImpl implements Reservation {
    private readonly _at: Date;
    private readonly _email: string;
    private readonly _name: string;
    private readonly _quantity: number;

    constructor(at: Date, email: string, name: string, quantity: number) {
        this._at = at;
        this._email = email;
        this._name = name;
        this._quantity = quantity;
    }

    equals(other: any): boolean {
        return this._at === other._at
            && this._email === other._email
            && this._name === other._name
            && this._quantity === other._quantity;
    }

    get hashcode(): number {
        return hashCode(JSON.stringify(this))
    }

    get quantity(): number {
        return this._quantity;
    }
    get name(): string {
        return this._name;
    }
    get email(): string {
        return this._email;
    }
    get at(): string {
        return this._at.toDateString();
    }
}

export enum Task {
    CompletedTask = "Completed"
}

export interface ReservationRepository {
    create(reservation: Reservation): Task
}