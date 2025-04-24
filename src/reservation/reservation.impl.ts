import dayjs from "dayjs";
import {Reservation} from "./reservation";
import {isValidDate} from "../validation/validator.date";

export class Identifiable {
    id: string | null | undefined;
}

export class ReservationImpl extends Identifiable implements Reservation {
    at: Date;
    private readonly createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: Date|string, email: string, name: string | null, quantity: number) {
        super();
        if (!at || !isValidDate(at)) {
            throw new Error(`${at} is not a valid date`);
        }
        if (!email || email === '') {
            throw new Error("email needs to be defined.");
        }
        if (Number.isNaN(quantity) || quantity < 1) {
            throw new Error("please give at least one person for the reservation");
        }
        const date = new Date(at)
        this.createdAt = dayjs().toDate();
        this.at = date;
        this.email = email;
        this.name = name ?? "";
        this.quantity = quantity;
    }
}