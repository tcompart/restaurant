import {DatabaseReservationRepository} from "./databaseReservationRepository";
import {BadRequest} from "./errorHandling";

const findMany = jest.fn();

jest.mock('.prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        reservation: {findMany: (...args: unknown[]) => findMany(...args)}
    }))
}));

describe('DatabaseReservationRepository.read', () => {
    beforeEach(() => {
        findMany.mockReset().mockResolvedValue([]);
    });

    test('queries exact inclusive bounds across days', async () => {
        const from = new Date(2025, 2, 30, 11, 0);
        const to = new Date(2025, 3, 1, 13, 30);
        const reservations = [{name: 'later reservation'}];
        findMany.mockResolvedValue(reservations);

        await expect(new DatabaseReservationRepository().read(from, to)).resolves.toBe(reservations);
        expect(findMany).toHaveBeenCalledWith({where: {at: {gte: from, lte: to}}});
    });

    test('queries the entire local day when only one date is supplied', async () => {
        const at = new Date(2025, 2, 30, 12, 0);
        const start = new Date(2025, 2, 30, 0, 0, 0, 0);
        const end = new Date(2025, 2, 30, 23, 59, 59, 999);

        await new DatabaseReservationRepository().read(at);

        expect(findMany).toHaveBeenCalledWith({where: {at: {gte: start, lte: end}}});
    });

    test('uses an exact instant when both bounds are equal', async () => {
        const at = new Date(2025, 2, 30, 12, 0);

        await new DatabaseReservationRepository().read(at, at);

        expect(findMany).toHaveBeenCalledWith({where: {at: {gte: at, lte: at}}});
    });

    test('rejects reversed bounds without querying', async () => {
        const from = new Date(2025, 2, 31, 12, 0);
        const to = new Date(2025, 2, 30, 12, 0);

        const result = new DatabaseReservationRepository().read(from, to);
        await expect(result).rejects.toBeInstanceOf(BadRequest);
        await expect(result).rejects.toThrow("Start date is after end date.");
        expect(findMany).not.toHaveBeenCalled();
    });

    test('queries the entire local day for a future date', async () => {
        jest.useFakeTimers().setSystemTime(new Date(2025, 2, 30, 12, 0));
        try {
            const at = new Date(2025, 2, 31, 21, 0);
            const start = new Date(2025, 2, 31, 0, 0, 0, 0);
            const end = new Date(2025, 2, 31, 23, 59, 59, 999);

            await expect(new DatabaseReservationRepository().read(at)).resolves.toEqual([]);
            expect(findMany).toHaveBeenCalledWith({where: {at: {gte: start, lte: end}}});
        } finally {
            jest.useRealTimers();
        }
    });
});
