import {Repository} from './reservation';
import {ReservationImpl} from "./reservation.impl";
import {validate} from "uuid";
import {PrismaClientKnownRequestError} from "prisma/prisma-client/runtime/library";

describe('reservation', () => {

    describe('repository', () => {
       test('create and delete entry', async () => {
           const repository = new Repository();
           const taskPromise = await repository.create(new ReservationImpl('2023-03-23 19:00', 'my@email.com', 'Franz', 2));
           expect(taskPromise).toHaveProperty("id");
           expect(taskPromise.id).not.toBeNull();
           await expect(repository.delete(taskPromise.id!)).resolves.toMatchObject({id: taskPromise.id});
           expect(validate(taskPromise.id!)).toBe(true);
           await expect(repository.delete(taskPromise.id!)).rejects.toMatchObject({} as PrismaClientKnownRequestError);
       });
       test('create multiple and find one', async () => {
           const repository = new Repository();
           const taskPromise = await repository.create(new ReservationImpl('2023-01-31 19:00', 'my@email.com', 'Dieter', 2))
               .then(id => repository.create(new ReservationImpl('2023-01-31 19:00', 'myself@email.com', 'Holger', 2)))
               .then(id => repository.create(new ReservationImpl('2023-01-31 16:00', 'me@email.com', 'Michael', 2)));
           expect(taskPromise).toHaveProperty("id");
           expect(taskPromise.id).not.toBeNull();

           const date = new Date(2023, 0, 31, 16, 0);
           const reservationsOnDate = await repository.findReservationsOnDate(date);
           expect(reservationsOnDate).toHaveLength(3);

           expect(reservationsOnDate).toEqual(expect.arrayContaining([
               expect.objectContaining({name: 'Dieter'}),
               expect.objectContaining({name: 'Holger'}),
               expect.objectContaining({name: 'Michael'})
           ]));
       });
    });

});