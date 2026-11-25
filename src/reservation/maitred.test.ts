import MaitreDeSalle from "./maitreDeSalle";
import dayjs from "dayjs";
import {ReservationDTO} from "./reservation.dto";
import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {BadRequest, TooManyReservationError} from "./errorHandling";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

describe('Maître de Salle', () => {

    const lunch = new Date();
    lunch.setHours(12);
    const candidate = new ReservationDTO(lunch.toISOString(), "candidate@email.com", 'I am the candidate', 4);

    const twelveThirty = new Date();
    twelveThirty.setHours(12, 30);

    const one = new Date();
    one.setHours(13, 0);

    describe('willAccept', () => {
        test('does not accept without tables', () => {
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), []);

            const date = new Date();
            date.setHours(10, 30);
            expect(() => maitreDeSalle.willAccept(date, [], candidate)).toThrow(BadRequest)
        });

        test('does not accept outside of hours', () => {
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), [new Table(10)]);

            const date = new Date();
            date.setHours(7, 30);
            expect(maitreDeSalle.willAccept(date, [], candidate)).toBe(false);
        });

        test('does not accept outside of hours later', () => {
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), [new Table(10)]);

            const date = new Date();
            date.setHours(21);
            expect(maitreDeSalle.willAccept(date, [], candidate)).toBe(false);
        });

        test('does not accept if no tables available', () => {
            const validReservation = new ReservationDTO(twelveThirty.toISOString(), "my@email.com", 'My Name', 7);
            const tables = [new Table(6)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(twelveThirty, [candidate], validReservation)).toBeFalsy();
        });

        test('does accept valid reservation on empty table at correct time without existing reservations', () => {
            const validReservation = new ReservationDTO(twelveThirty.toISOString(), "my@email.com", 'My Name', 4);
            const tables = [new Table(8)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(twelveThirty, [], validReservation)).toBe(true);
        });

        test('does accept valid reservation on empty table at correct time', () => {
            const validReservation = new ReservationDTO(one.toISOString(), "my@email.com", 'My Name', 4);
            const tables = [new Table(8)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(one, [], validReservation)).toBeTruthy();
        });

        test('can accept multiple valid reservations if table is free at specific time', () => {
            const fourPM = new Date();
            fourPM.setHours(16, 0);

            const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 7);
            const reservation2 = new ReservationDTO(fourPM.toISOString(), "my@email.com", 'Myself', 2);
            const tables = [new Table(8)];

            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(twelveThirty, [reservation1], reservation2)).toBeTruthy();
        })

        test('cannot accept valid reservation if fully booked tables at correct time', () => {
            const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 7);
            const reservation2 = new ReservationDTO(one.toISOString(), "my@email.com", 'Myself', 2);
            const reservation3 = new ReservationDTO(one.toISOString(), "i@email.com", 'And I', 4);
            const tables = [new Table(8), new Table(4)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(twelveThirty, [reservation1, reservation2], reservation3)).toBeFalsy()
        });

        test('one reservation can be accepted multiple times if it fits on the same table', () => {
            const singleReservation = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 7);

            const tables = [new Table(8), new Table(6)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

            expect(maitreDeSalle.willAccept(twelveThirty, [singleReservation], candidate)).toBe(true);
            expect(maitreDeSalle.willAccept(twelveThirty, [singleReservation], candidate)).toBe(true);
            expect(maitreDeSalle.willAccept(twelveThirty, [singleReservation], candidate)).toBe(true);
            expect(maitreDeSalle.willAccept(twelveThirty, [singleReservation], candidate)).toBe(true);
        });

        test('throws TooManyReservationError if tables are overbooked', () => {
            const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 7);
            const reservation2 = new ReservationDTO(one.toISOString(), "my@email.com", 'Myself', 2);

            const tables = [new Table(8)];

            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);
            expect(() => maitreDeSalle.willAccept(twelveThirty, [reservation1, reservation2], candidate)).toThrow(TooManyReservationError);
        });

        // currently not implemented, but should be possible in the future
        test('can accept reservations on community tables if space exists', () => {
            const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 4);
            const reservation2 = new ReservationDTO(one.toISOString(), "my@email.com", 'Myself', 2);

            const tables = [new Table(8, true)];

            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);
            expect(maitreDeSalle.willAccept(twelveThirty, [reservation1], reservation2)).toBeTruthy();
        });
    });

    describe('isAvailable', () => {
        test('returns true if a table is available for a given date and quantity', async () => {
          const tables = [new Table(8)];
          const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);
          const date = new Date();
          date.setDate(date.getDate() + 1);
          date.setHours(12, 0, 0, 0);

          expect(maitreDeSalle.isAvailable(date, [], 4)).toBe(true);
        });

        test('returns false if no table is available for a given date and quantity', async () => {
           const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 8);

            const tables = [new Table(8)];
           const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);

           expect(maitreDeSalle.isAvailable(one, [reservation1], 4)).toBe(false);
        });
    });

    describe('isAvailableWithFromTO', () => {
        test('starts on the requested date at the end of a long month', () => {
            jest.useFakeTimers().setSystemTime(new Date(2025, 1, 1, 12, 0));
            try {
                const maitreDeSalle = new MaitreDeSalle(
                    new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), [new Table(8)]
                );
                const from = new Date(2025, 0, 31, 12, 0);
                const to = new Date(2025, 0, 31, 13, 0);

                expect(maitreDeSalle.getAvailableDates(from, to, [], 4))
                    .toEqual([from, new Date(2025, 0, 31, 12, 30)]);
            } finally {
                jest.useRealTimers();
            }
        });

        test('return multiple available dates for a given date range and quantity', async () => {
            const tables = [new Table(8)];
            const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20, 30), dayjs.duration({minutes: 100}), tables);
            const from = new Date();
            from.setMonth(0);
            from.setDate(1);
            from.setFullYear(2025);

            const to = new Date();
            to.setMonth(1);
            to.setDate(1);
            to.setFullYear(2025);

            const availableDates = await maitreDeSalle.getAvailableDates(from, to, [], 4);
            expect(availableDates).toContainEqual(new Date(2025,0,2, 9, 30, 0, 0));
            expect(availableDates).toContainEqual(new Date(2025,0,2, 10, 0, 0, 0));
            expect(availableDates).toContainEqual(new Date(2025,0,2, 10, 30, 0, 0));
        });
    });
});