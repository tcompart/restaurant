import {ReservationImpl} from "./reservation.impl";
import {PrismaClientKnownRequestError, PrismaClientValidationError} from "prisma/prisma-client/runtime/library";
import {DatabaseReservationRepository} from "./databaseReservationRepository";
import {ReservationDTO} from "./reservation.dto";
import {ReservationController} from "./reservation.ctlr";
import {TooManyReservationError} from "./errorHandling";

// simple regexp expression to test if a string is a valid UUID
const validate = (uuid: string): boolean => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
};

describe('reservation', () => {

    describe('repository', () => {

        beforeEach(async () => {
            await new DatabaseReservationRepository().deleteAll();
        })

        test('create something unusable', async () => {
            const repository = new DatabaseReservationRepository();
            await expect(repository.create(null as unknown as ReservationDTO)).rejects.toMatchObject({} as PrismaClientValidationError);
        });

        test('create and delete entry', async () => {
           const repository = new DatabaseReservationRepository();
           const taskPromise = await repository.create(new ReservationImpl('2023-03-23 19:00', 'my@email.com', 'Franz', 2));
           expect(taskPromise).toHaveProperty("id");
           expect(taskPromise.id).not.toBeNull();
           await expect(repository.delete(taskPromise.id!)).resolves.toMatchObject({id: taskPromise.id});
           expect(validate(taskPromise.id!)).toBe(true);
           await expect(repository.delete(taskPromise.id!)).rejects.toMatchObject({} as PrismaClientKnownRequestError);
       });

       test('create multiple and find one', async () => {
           const repository = new DatabaseReservationRepository();
           const taskPromise = await repository.create(new ReservationImpl('2023-01-31 19:00', 'my@email.com', 'Dieter', 2))
               .then(() => repository.create(new ReservationImpl('2023-01-31 19:00', 'myself@email.com', 'Holger', 2)))
               .then(() => repository.create(new ReservationImpl('2023-01-31 16:00', 'me@email.com', 'Michael', 2)));
           expect(taskPromise).toHaveProperty("id");
           expect(taskPromise.id).not.toBeNull();

           const date = new Date(2023, 0, 31, 16, 0);
           const reservationsOnDate = await repository.read(date);
           expect(reservationsOnDate).toHaveLength(3);

           expect(reservationsOnDate).toEqual(expect.arrayContaining([
               expect.objectContaining({name: 'Dieter'}),
               expect.objectContaining({name: 'Holger'}),
               expect.objectContaining({name: 'Michael'})
           ]));
       });

       test('reads inclusive bounds across days', async () => {
           const repository = new DatabaseReservationRepository();
           const from = new Date(2025, 2, 30, 12, 0);
           const to = new Date(2025, 3, 1, 12, 0);
           for (const [at, name] of [
               [new Date(2025, 2, 30, 11, 0), 'before'],
               [from, 'start'],
               [new Date(2025, 2, 31, 12, 0), 'middle'],
               [to, 'end'],
               [new Date(2025, 3, 1, 13, 0), 'after']
           ] as [Date, string][]) {
               await repository.create(new ReservationImpl(at, 'guest@example.com', name, 1));
           }

           const result = await repository.read(from, to);
           expect(result.map(reservation => reservation.name).sort()).toEqual(['end', 'middle', 'start']);
       });

       test('accepts a future reservation and detects the occupied table', async () => {
           const repository = new DatabaseReservationRepository();
           const controller = new ReservationController(repository);
           const at = new Date();
           at.setDate(at.getDate() + 2);
           at.setHours(12, 0, 0, 0);
           const reservation = new ReservationDTO(at.toISOString(), 'guest@example.com', 'Guest', 10);

           await expect(controller.checkAvailability(at.toISOString(), 1)).resolves.toBe(true);
           await expect(controller.post(reservation)).resolves.toHaveProperty('id');
           await expect(controller.checkAvailability(at.toISOString(), 1)).resolves.toBe(false);
           await expect(controller.post(reservation)).rejects.toBeInstanceOf(TooManyReservationError);
       });

       test('calendar accounts for reservations before the range and on later days', async () => {
           const repository = new DatabaseReservationRepository();
           const first = new Date(2025, 2, 30, 11, 30);
           const later = new Date(2025, 2, 31, 12, 0);
           await repository.create(new ReservationImpl(first, 'guest@example.com', 'first', 10));
           await repository.create(new ReservationImpl(later, 'guest@example.com', 'later', 10));

           const from = new Date(2025, 2, 30, 12, 0);
           const to = new Date(2025, 2, 31, 14, 30);
           const slots = await new ReservationController(repository)
               .checkAvailabilityFromTo(from.toISOString(), to.toISOString(), 1);

           expect(slots).not.toContainEqual(from);
           expect(slots).not.toContainEqual(later);
           expect(slots).toContainEqual(new Date(2025, 2, 31, 14, 0));
       });
    });

});