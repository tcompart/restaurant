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

    test("creates a table with its configured seat count", () => {
       expect(new Table(9).numberOfSeats).toBe(9);
    });

    test("reserve a table with a non fitting number of seats throws an error", () => {
        const table = new Table(4);
        expect(() => table.reserve(defaultSeating)).toThrow("Table cannot fit the seating.");
    })

    test("enforces minimum capacity and preserves table properties when reserved", () => {
        const table = new Table(8, true, {minCapacity: 3, name: "Rund", shape: "round"});
        const small = new Seating({at: new Date(), quantity: 2}, dayjs.duration({minutes: 90}));
        const valid = new Seating({at: new Date(), quantity: 3}, dayjs.duration({minutes: 90}));

        expect(table.fits(small)).toBe(false);
        const remaining = table.reserve(valid);
        expect(remaining.numberOfSeats).toBe(5);
        expect(remaining.minCapacity).toBe(3);
        expect(remaining.name).toBe("Rund");
        expect(remaining.shape).toBe("round");
        expect(remaining.fits(small)).toBe(false);
    });

    describe('with community seating', () => {
        test('5 people can sit at it', () => {
            expect(new Table(5, true).fits(defaultSeating)).toBe(true);
        });

        test('5 people cannot sit at table with 4 seats.', () => {
            expect(new Table(4, true).fits(defaultSeating)).toBe(false);
        });

        test('2 people can sit at table with 4 seats.', () => {
            const reservation: Reservation = new ReservationDTO(new Date().toISOString().split('T')[0], "me@myself.org", "Dieter", 2);
            const seating: Seating = new Seating(reservation, dayjs.duration({minutes: 90}));
            expect(new Table(4, true).fits(seating)).toBe(true);
        });

        test('5 people cannot sit at table with 3 seats.', () => {
            expect(new Table(3, true).fits(defaultSeating)).toBe(false);
        });

        test('with community 2 people can sit at table with 4 seats and 1 existing reservation for 2 people.', () => {
            const reservation: Reservation = new ReservationDTO(new Date().toISOString().split('T')[0], "me@myself.org", "Dieter", 2);
            const seating: Seating = new Seating(reservation, dayjs.duration({minutes: 90}));
            const table = new Table(4, true);
            expect(table.fits(seating)).toBe(true);
            expect(table.isCommunityTable).toBe(true);
            const reservedTable = table.reserve(seating);
            expect(reservedTable.fits(seating)).toBe(true);
            expect(reservedTable.isCommunityTable).toBe(true);
            const secondTable = reservedTable.reserve(seating);
            expect(secondTable.fits(seating)).toBe(false);
            expect(secondTable.isCommunityTable).toBe(true);
            expect(secondTable.numberOfSeats).toBe(0);
        });

    });

    describe('with standard seating', () => {
        test('5 people can sit at it', () => {
            expect(new Table(5).fits(defaultSeating)).toBe(true);
        });

        test('still rejects 5 people at a 4-seat table.', () => {
            expect(new Table(4).fits(defaultSeating)).toBe(false);
        });

        test('2 people can sit at table with 4 seats.', () => {
            const reservation: Reservation = new ReservationDTO(new Date().toISOString().split('T')[0], "me@myself.org", "Dieter", 2);
            const seating: Seating = new Seating(reservation, dayjs.duration({minutes: 90}));
            expect(new Table(4).fits(seating)).toBe(true);
        });

        test('5 people cannot sit at table with 4 seats.', () => {
            expect(new Table(4).fits(defaultSeating)).toBe(false);
        });

        test('2 people can only sit at table with 4 seats without anyone else.', () => {
            const reservation: Reservation = new ReservationDTO(new Date().toISOString().split('T')[0], "me@myself.org", "Dieter", 2);
            const seating: Seating = new Seating(reservation, dayjs.duration({minutes: 90}));
            const table = new Table(4, false);
            expect(table.fits(seating)).toBe(true);
            expect(table.isCommunityTable).toBe(false);
            const reservedTable = table.reserve(seating);
            expect(reservedTable.fits(seating)).toBe(false);
            expect(reservedTable.isCommunityTable).toBe(false);
            expect(reservedTable.numberOfSeats).toBe(0);
        })
    });
});