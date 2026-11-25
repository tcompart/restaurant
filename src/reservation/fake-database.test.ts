import {FakeDatabase} from "./fake-database";
import {ReservationImpl} from "./reservation.impl";
import {BadRequest} from "./errorHandling";

describe('FakeDatabase.read', () => {
    test('includes both exact range bounds across days and excludes outside reservations', async () => {
        const database = new FakeDatabase();
        const from = new Date(2025, 2, 30, 12, 0);
        const to = new Date(2025, 3, 1, 12, 0);
        for (const [at, name] of [
            [new Date(from.getTime() - 60_000), 'before'],
            [from, 'start'],
            [new Date(2025, 2, 31, 12, 0), 'middle'],
            [to, 'end'],
            [new Date(to.getTime() + 60_000), 'after']
        ] as [Date, string][]) {
            await database.create(new ReservationImpl(at, 'guest@example.com', name, 1));
        }

        const result = await database.read(from, to);
        expect(Array.from(result, reservation => reservation.name)).toEqual(['start', 'middle', 'end']);
        expect(Array.from(await database.read(from, from), reservation => reservation.name)).toEqual(['start']);
    });

    test('rejects reversed bounds', async () => {
        const database = new FakeDatabase();
        const result = database.read(new Date(2025, 2, 31), new Date(2025, 2, 30));
        await expect(result).rejects.toBeInstanceOf(BadRequest);
        await expect(result).rejects.toThrow("Start date is after end date.");
    });
});
