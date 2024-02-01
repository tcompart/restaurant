export class TimeOfDay {
    private readonly _hour: number;
    private readonly _minutes: number;
    private today = new Date();

    constructor(hour: number, minutes?: number) {
        this._hour = hour;
        this._minutes = minutes ?? 0;
    }

    atDate(day: Date): this {
        this.today = new Date();
        this.today.setUTCFullYear(day.getUTCFullYear(), day.getUTCMonth(), day.getDate());
        return this;
    }

    toDate(): Date {
        const date = this.today;
        date.setHours(this._hour)
        date.setMinutes(this._minutes);
        return date;
    }
}