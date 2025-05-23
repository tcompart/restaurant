import Table from "./table";
import {Seating} from "./seating";
import {ReservationDTO} from "./reservation.dto";
import {Reservation} from "./reservation";
import dayjs from "dayjs";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
describe("table", () => {

    const defaultReservation: Reservation = new ReservationDTO(new Date().toISOString().split('T')[0], "me@myself.org", "Dieter", 5);
    const defaultSeating: Seating = new Seating(defaultReservation, dayjs.duration({minutes: 90}));

    test("can be created", () => {
       new Table(9);
    });

    test('5 people can sit at it', () => {
       expect(new Table(5).fits(defaultSeating)).toBe(true);
    });

    test('5 people cannot sit at table with 4 seats.', () => {
       expect(new Table(4).fits(defaultSeating)).toBe(false);
    });

});