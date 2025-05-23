import {ReservationImpl} from "./reservation.impl";
import {validate} from "uuid";
import {PrismaClientKnownRequestError, PrismaClientValidationError} from "prisma/prisma-client/runtime/library";
import {DatabaseReservationRepository} from "./databaseReservationRepository";
import {ReservationDTO} from "./reservation.dto";

describe('reservation', () => {

    describe('repository', () => {

        beforeEach(() => {
            new DatabaseReservationRepository().deleteAll();
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
    });

});