import dayjs from "dayjs";
import {hashCode} from "../hashCodeHelper";
import {Reservation} from "./reservation";

dayjs.locale()
const advancedFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(advancedFormat)

export class ReservationImpl implements Reservation {
    at: string;
    private createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: string, email: string, name: string, quantity: number) {
        if (!this.isValidDate(at)) {
            throw new Error(`${at} is not a valid date`);
        }
        if (!email || email === '') {
            throw new Error("email needs to be defined.");
        }
        const date = new Date(at)

        this.createdAt = dayjs().toDate();
        this.at = date.toISOString();
        this.email = email;
        this.name = name;
        this.quantity = quantity;
    }

    isValidDate(date: string) {
        const format = "YYYY-MM-DD";
        const localDate = date.substring(0, format.length);
        return dayjs(date, format).format(format) === localDate;
    }

    get hashcode(): number {
        return hashCode(JSON.stringify(this))
    }

    get toString(): string {
        return JSON.stringify(this);
    }

}