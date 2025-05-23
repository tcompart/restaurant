import MaitreDeSalle from "./maitreDeSalle";
import dayjs from "dayjs";
import {ReservationDTO} from "./reservation.dto";
import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {TooManyReservationError} from "./errorHandling";

const duration = require('dayjs/plugin/duration')
dayjs.extend(duration)

describe('Maître de Salle', () => {

    const lunch = new Date();
    lunch.setHours(12);
    const candidate = new ReservationDTO(lunch.toISOString(), "candidate@email.com", 'I am the candidate', 4);

    test('does not accept without tables', () => {
       const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

       const date = new Date();
       date.setHours(10, 30);
       expect(maitreDeSalle.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept outside of hours', () => {
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

        const date = new Date();
        date.setHours(7, 30);
        expect(maitreDeSalle.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept outside of hours later', () => {
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), []);

        const date = new Date();
        date.setHours(21);
        expect(maitreDeSalle.willAccept(date, [], candidate)).toBe(false);
    });

    test('does not accept if no tables available', () => {
        const date = new Date();
        date.setHours(12, 30);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 7);
        const tables = [new Table(8)];
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(() => maitreDeSalle.willAccept(date, [candidate], validReservation)).toThrow(TooManyReservationError);
    });

    test('does accept valid reservation on empty table at correct time without existing reservations', () => {
        const date = new Date();
        date.setHours(12, 30);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 4);
        const tables = [new Table(8)];
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(maitreDeSalle.willAccept(date, [], validReservation)).toBe(true);
    });

    test('does accept valid reservation on empty table at correct time', () => {
        const date = new Date();
        date.setHours(15, 0);

        const validReservation = new ReservationDTO(date.toISOString(), "my@email.com", 'My Name', 4);
        const tables = [new Table(8)];
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(maitreDeSalle.willAccept(date, [validReservation], candidate)).toBe(true);
    });

    test('cannot accept valid reservation if fully booked tables at correct time', () => {
        const twelveThirty = new Date();
        twelveThirty.setHours(12, 30);
        const one = new Date();
        one.setHours(13, 0);

        const reservation1 = new ReservationDTO(twelveThirty.toISOString(), "me@email.com", 'Me', 7);
        const reservation2 = new ReservationDTO(one.toISOString(), "my@email.com", 'Myself', 2);
        const reservation3 = new ReservationDTO(one.toISOString(), "i@email.com", 'And I', 4);
        const tables = [new Table(8), new Table(6)];
        const maitreDeSalle = new MaitreDeSalle(new TimeOfDay(8), new TimeOfDay(20,30), dayjs.duration({minutes: 100}), tables);

        expect(() => maitreDeSalle.willAccept(twelveThirty, [reservation1, reservation2], reservation3)).toThrow(TooManyReservationError);
    });
});