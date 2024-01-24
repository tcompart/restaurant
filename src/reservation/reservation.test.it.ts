import {BadRequest, Repository} from './reservation';
import {ReservationDTO} from "./reservation.dto";
import {FakeDatabase} from "./service-injection";
import {ReservationImpl} from "./reservation.impl";
import {ReservationController} from "./reservation.ctlr";
import {validate} from "uuid";
import {PrismaClientKnownRequestError} from "prisma/prisma-client/runtime/library";

describe('reservation', () => {

    describe('repository', () => {
       test('create and delete entry', async () => {
           const repository = new Repository();
           const taskPromise = await repository.create(new ReservationImpl('2023-01-31 19:00', 'my@email.com', '', 2));
           expect(taskPromise).toHaveProperty("id");
           expect(taskPromise.id).not.toBeNull();
           await expect(repository.delete(taskPromise.id!)).resolves.toMatchObject({id: taskPromise.id});
           expect(validate(taskPromise.id!)).toBe(true);
           await expect(repository.delete(taskPromise.id!)).rejects.toMatchObject({} as PrismaClientKnownRequestError);
       })
    });

});