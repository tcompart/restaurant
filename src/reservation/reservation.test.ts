import {ReservationDTO} from "./reservation.dto";
import {ReservationImpl} from "./reservation.impl";
import {ReservationController} from "./reservation.ctlr";
import {FakeDatabase} from "./fake-database";
import {Configuration} from "./configuration";

import Table from "./table";
import {BadRequest} from "./errorHandling";
import {TimeOfDay} from "./timeOfDay";
import dayjs from "dayjs";

const someDate = new Date().toISOString();
const someEmail = "my@email.com";
const someName = 'My Name';

describe('reservation', () => {

    const defaultConfiguration: Configuration = {
        tables: [new Table(8)],
        opens: new TimeOfDay(8),
        lastSeating: new TimeOfDay(20, 30),
        seatingDuration: dayjs.duration({minutes: 100})
    };

    describe('availability', () => {
        const tomorrowAt = (hour: number, minute = 0): Date => {
            const at = new Date();
            at.setDate(at.getDate() + 1);
            at.setHours(hour, minute, 0, 0);
            return at;
        };

        it('returns available for a fitting party without creating a reservation', async () => {
            const database = new FakeDatabase();
            const controller = new ReservationController(database, defaultConfiguration);

            await expect(controller.checkAvailability(tomorrowAt(12).toISOString(), 4)).resolves.toBe(true);
            expect(database).toHaveLength(0);
        });

        it('returns unavailable when an existing reservation occupies the table', async () => {
            const database = new FakeDatabase();
            const controller = new ReservationController(database, defaultConfiguration);
            const at = tomorrowAt(12);
            await controller.post(new ReservationDTO(at.toISOString(), someEmail, someName, 4));

            await expect(controller.checkAvailability(tomorrowAt(12, 30).toISOString(), 4)).resolves.toBe(false);
        });

        it('returns available when the existing reservation does not overlap', async () => {
            const database = new FakeDatabase();
            const controller = new ReservationController(database, defaultConfiguration);
            const at = tomorrowAt(12);
            await controller.post(new ReservationDTO(at.toISOString(), someEmail, someName, 4));

            await expect(controller.checkAvailability(tomorrowAt(14).toISOString(), 4)).resolves.toBe(true);
        });

        it.each([
            ['an invalid date', '2026-02-31T12:00:00.000Z', 2],
            ['a non-integer party size', tomorrowAt(12).toISOString(), 1.5],
            ['a zero party size', tomorrowAt(12).toISOString(), 0]
        ])('rejects %s', async (_description, at, quantity) => {
            const controller = new ReservationController(new FakeDatabase(), defaultConfiguration);

            await expect(controller.checkAvailability(at, quantity)).rejects.toBeInstanceOf(BadRequest);
        });

        it('preserves repository errors', async () => {
            const database = new FakeDatabase();
            const failure = new Error('Database unavailable');
            jest.spyOn(database, 'read').mockRejectedValue(failure);
            const controller = new ReservationController(database, defaultConfiguration);

            await expect(controller.checkAvailability(tomorrowAt(12).toISOString(), 4)).rejects.toBe(failure);
        });
    });

    test(' can be written to database', async () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase, defaultConfiguration);

        const reservationDTO = new ReservationDTO("2023-11-24 19:00", "juliad@example.net", "Julia Domna", 5);
        await reservationController.post(reservationDTO);
        expect(fakeDatabase[0]).toMatchObject({
            at: new Date("2023-11-24 19:00"),
            email: "juliad@example.net",
            name: "Julia Domna",
            quantity: 5
        });
        expect(reservationDTO.toString()).toEqual("ReservationDTO for Julia Domna is at 2023-11-24 19:00 for 5 people.");
    });

    it(' is not allowing two many reservations at same day', async () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase, defaultConfiguration);

        await reservationController.post(new ReservationDTO("2023-11-12 10:00", "juliad@example.net", "Julia Domna", 5));
        const result = reservationController.post(new ReservationDTO("2023-11-12 10:00", "juliad@example.net", "Julia Domna", 5));
        await expect(result).rejects.toMatchObject({
            message: /Too many reservations.'/,
            name: "409"
        });

    });

    it(' is should allow two reservations with less than 10 guest', async () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase, defaultConfiguration);

        await reservationController.post(new ReservationDTO("2023-11-12 10:00", "juliad@example.net", "Julia Domna", 4));
        await reservationController.post(new ReservationDTO("2023-11-12 19:00", "juliad@example.net", "Julia Domna", 5));

        const reservations = await reservationController.get();
        expect(reservations).toHaveLength(2);
        expect(reservations[0]).toMatchObject({
            at: new Date("2023-11-12 10:00"), quantity: 4
        });
        expect(reservations[1]).toMatchObject({
            at: new Date("2023-11-12 19:00"), quantity: 5
        });
    });

    it(' is should allow two reservations with around  10 guest on two different days', async () => {
        const fakeDatabase = new FakeDatabase();
        const configWith10Tables = {...defaultConfiguration, tables: [new Table(10)]};
        const reservationController = new ReservationController(fakeDatabase, configWith10Tables);

        await reservationController.post(new ReservationDTO("2023-11-11 10:00", "juliad@example.net", "Julia Domna", 8));
        await reservationController.post(new ReservationDTO("2023-11-12 19:00", "juliad@example.net", "Julia Domna", 9));

        const reservations = await reservationController.get();
        expect(reservations).toHaveLength(2);
    });

    it.each([
        '99-2343-2343:32894;:343',
        'hallo',
        '',
        '2023-02-31 10:00',
    ])(' requires to fail on invalid date %p', async (invalidDate) => {
        const reservationDTO = new ReservationDTO(invalidDate, someEmail, someName, 5);
        const controller = new ReservationController(new FakeDatabase(), defaultConfiguration);
        await expect(controller.post(reservationDTO)).rejects.toMatchObject({
            message: /Invalid time value/,
            name: "400"
        });
    });

    it('not allowed without emails', async () => {
        const controller = new ReservationController(new FakeDatabase(), defaultConfiguration);
        await expect(controller.post(new ReservationDTO('2023-03-11 19:00', '', someName, 5)))
            .rejects.toMatchObject({
                message: /email needs to be defined./,
                name: "400"
            });
    });

    it('rejects a reservation when no tables are available', async () => {
        const configurationWithNoTables = {...defaultConfiguration, tables: []}
        const controller = new ReservationController(new FakeDatabase(), configurationWithNoTables);
        await expect(controller.post(new ReservationDTO('2023-03-11 19:00', someEmail, someName, 5)))
            .rejects.toMatchObject({
                message: "Maître De Salle does not accept reservation",
                name: "400"
            });
    });

    it('preserves repository errors instead of reporting them as bad requests', async () => {
        const database = new FakeDatabase();
        const failure = new Error("Database unavailable");
        jest.spyOn(database, "read").mockRejectedValue(failure);
        const controller = new ReservationController(database, defaultConfiguration);

        await expect(controller.post(new ReservationDTO('2023-03-11 19:00', someEmail, someName, 5)))
            .rejects.toBe(failure);
    });

    describe('impl', () => {
        it.each([
            '99-2343-2343:32894;:343',
            'hallo',
            '',
            '2023-02-31 10:00',
        ])(' validates date as well %p', (invalidDate) => {
            expect(() => new ReservationImpl(invalidDate, someEmail, someName, 2))
                .toThrow(new Error(`${invalidDate} is not a valid date`));
        });
        it.each([0, -1, -100, 'x'])
        (' validates number %p of guests to be not valid', (input) => {
            expect(() => new ReservationImpl(someDate, someEmail, someName, Number(input)))
                .toThrow("please give at least one person for the reservation");
        });

        it(' validates names to be at least empty', () => {
            const reservation = new ReservationImpl(someDate, someEmail, null, 2);
            expect(reservation.name).toBe("");
        });
    });
});