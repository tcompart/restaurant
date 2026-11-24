import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {Duration} from "dayjs/plugin/duration";
import dayjs from "dayjs";

export class Default implements Configuration {
    tables: Table[] = [new Table(10)];
    opens: TimeOfDay = new TimeOfDay(8);
    lastSeating: TimeOfDay = new TimeOfDay(20, 30);
    seatingDuration: Duration = dayjs.duration({minutes: 100});
}

export interface Configuration {
    tables: Table[];
    opens: TimeOfDay;
    lastSeating: TimeOfDay;
    seatingDuration: Duration
}
