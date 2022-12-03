import dayjs from "dayjs";
import {Reservation} from "./reservation";

dayjs.locale()
const advancedFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(advancedFormat)

export class ReservationImpl implements Reservation {
    at: Date;
    private createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: string, email: string, name: string, quantity: number) {
        if (!at || !this.isValidDate(at)) {
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
        this.name = name ? name : "";
        this.quantity = quantity;
    }

    isValidDate(date: string) {
        const format = "YYYY-MM-DD";
        const localDate = date.substring(0, format.length);
        return dayjs(date, format).format(format) === localDate;
    }

    get toString(): string {
        return JSON.stringify(this);
    }

}