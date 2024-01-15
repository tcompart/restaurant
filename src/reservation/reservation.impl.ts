import dayjs from "dayjs";
import {Reservation} from "./reservation";

dayjs.locale()
const advancedFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(advancedFormat)

export class Identifiable {
    id: string | null | undefined;
}

export class ReservationImpl extends Identifiable implements Reservation {
    at: Date;
    private createdAt: Date;
    email: string;
    name: string;
    quantity: number;

    constructor(at: Date|string, email: string, name: string | null, quantity: number) {
        super();
        if (!at || !ReservationImpl.isValidDate(at)) {
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


    static isValidDate(date: Date|string) {
        function findDateByPattern(myString: string) {
            const yyyyMMdd = /\d{4}-\d{2}-\d{2}/;
            return yyyyMMdd.test(myString);
        }
        let extractedDate;
        if (date instanceof Date) {
            extractedDate = new Date(date).toISOString();
        } else if (findDateByPattern(date)) {
            extractedDate = date;
        } else if (/[12][0129]\d\d/.test(date)) {
            extractedDate = new Date(date).toISOString();
        } else {
            return false;
        }
        const localDate = extractedDate.substring(0, "YYYY-MM-DD".length);
        const dayjs1 = dayjs(localDate, "YYYY-MM-DD");
        const s = dayjs1.format("YYYY-MM-DD");
        return s === localDate;
    }

    public get toString(): string {
        return JSON.stringify(this);
    }

}