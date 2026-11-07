import {TimeOfDay} from "./timeOfDay";

describe('TimeOfDay', () => {
    it('uses the given local calendar date when setting the time', () => {
        const day = new Date(2026, 10, 7, 0, 15);

        expect(new TimeOfDay(8).atDate(day).toDate())
            .toEqual(new Date(2026, 10, 7, 8));
    });

    it('does not mutate the given date or the stored date when converted', () => {
        const day = new Date(2026, 10, 7, 0, 15);
        const originalTime = day.getTime();
        const timeOfDay = new TimeOfDay(8).atDate(day);

        timeOfDay.toDate();

        expect(day.getTime()).toBe(originalTime);
        expect(timeOfDay.toDate()).toEqual(new Date(2026, 10, 7, 8));
    });
});
