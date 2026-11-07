export class TimeOfDay {
    private readonly _hour: number;
    private readonly _minutes: number;
    private today = new Date();

    constructor(hour: number, minutes?: number) {
        this._hour = hour;
        this._minutes = minutes ?? 0;
    }

    atDate(day: Date): this {
        this.today = new Date(day);
        return this;
    }

    toDate(): Date {
        const date = new Date(this.today);
        date.setHours(this._hour, this._minutes, 0, 0);
        return date;
    }
}