import Table from "./table";
import {TimeOfDay} from "./timeOfDay";
import {Duration} from "dayjs/plugin/duration";
import dayjs from "dayjs";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";

const MAX_TABLES = 100;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addTables(tables: Table[], type: unknown, index: number, path: string): void {
    if (!isRecord(type) ||
        typeof type.name !== "string" || !type.name.trim() ||
        typeof type.shape !== "string" || !type.shape.trim() ||
        !Number.isSafeInteger(type.minCapacity) || !Number.isSafeInteger(type.maxCapacity) ||
        !Number.isSafeInteger(type.quantity) ||
        typeof type.minCapacity !== "number" || typeof type.maxCapacity !== "number" ||
        typeof type.quantity !== "number" ||
        type.minCapacity < 1 || type.maxCapacity < type.minCapacity ||
        type.quantity < 1 || tables.length + type.quantity > MAX_TABLES ||
        typeof type.communityTable !== "boolean") {
        throw new Error(`Invalid table configuration ${path}: invalid tableTypes[${index}] (maximum ${MAX_TABLES} tables)`);
    }
    for (let i = 0; i < type.quantity; i++) {
        tables.push(new Table(type.maxCapacity, type.communityTable, {
            minCapacity: type.minCapacity, name: type.name, shape: type.shape
        }));
    }
}

export function loadTables(filePath: string = process.env.TABLE_CONFIG_FILE ?? "config/tables.json"): Table[] {
    const path = resolve(filePath);
    let data: unknown;
    try {
        data = JSON.parse(readFileSync(path, "utf8"));
    } catch (error) {
        throw new Error(`Cannot read table configuration ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
    if (!isRecord(data) || !Array.isArray(data.tableTypes) || data.tableTypes.length === 0) {
        throw new Error(`Invalid table configuration ${path}: tableTypes must be a non-empty array`);
    }

    const tables: Table[] = [];
    for (const [index, type] of data.tableTypes.entries()) {
        addTables(tables, type, index, path);
    }
    return tables;
}

export class Default implements Configuration {
    tables: Table[] = loadTables();
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
