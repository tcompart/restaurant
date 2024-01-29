import {createTimeOfDay, Maitred, Table} from "./maitred";
import dayjs from "dayjs";
import {ReservationDTO} from "./reservation.dto";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)
const isBetween = require('dayjs/plugin/isBetween');
dayjs.extend(isBetween);


describe('maitred', () => {

    const lunch = new Date();
    lunch.setHours(12);
    const candidate = new ReservationDTO(lunch.toISOString(), "candidate@email.com", 'I am the candidate', 4);

    test('does not accept without tables', () => {
       const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

       const date = new Date();
       date.setHours(10, 30);
       expect(maitred.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept outside of hours', () => {
        const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

        const date = new Date();
        date.setHours(7, 30);
        expect(maitred.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept outside of hours later', () => {
        const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

        const date = new Date();
        date.setHours(21);
        expect(maitred.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept if no tables available', () => {
        const date = new Date();
        date.setHours(12, 30);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 7);
        const tables = [new Table(8)];
        const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(maitred.willAccept(date, [validReservation], candidate)).toBe(false);
    });

    test('does accept valid reservation on empty table at correct time without existing reservations', () => {
        const date = new Date();
        date.setHours(12, 30);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 4);
        const tables = [new Table(8)];
        const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(maitred.willAccept(date, [], validReservation)).toBe(true);
    });

    test('does accept valid reservation on empty table at correct time', () => {
        const date = new Date();
        date.setHours(12, 30);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 4);
        const tables = [new Table(8)];
        const maitred = new Maitred(createTimeOfDay(8), createTimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(maitred.willAccept(date, [candidate], validReservation)).toBe(true);
    });
});