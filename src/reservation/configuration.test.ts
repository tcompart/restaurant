import {mkdtempSync, rmSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {loadTables} from "./configuration";

describe("table configuration", () => {
    let directory: string;
    let path: string;

    const tableTypes = [
        {name: "Rundtisch", shape: "round", minCapacity: 1, maxCapacity: 8, quantity: 1, communityTable: false},
        {name: "Zweiertisch", shape: "square", minCapacity: 1, maxCapacity: 2, quantity: 2, communityTable: false},
        {name: "Gemeinschaftstisch", shape: "oval", minCapacity: 1, maxCapacity: 12, quantity: 1, communityTable: true}
    ];

    beforeEach(() => {
        directory = mkdtempSync(join(tmpdir(), "restaurant-tables-"));
        path = join(directory, "tables.json");
    });

    afterEach(() => {
        rmSync(directory, {recursive: true, force: true});
    });

    test("expands configured quotas into tables with their properties", () => {
        writeFileSync(path, JSON.stringify({tableTypes}));

        const tables = loadTables(path);

        expect(tables.map(table => [table.name, table.shape, table.minCapacity, table.numberOfSeats, table.isCommunityTable]))
            .toEqual([
                ["Rundtisch", "round", 1, 8, false],
                ["Zweiertisch", "square", 1, 2, false],
                ["Zweiertisch", "square", 1, 2, false],
                ["Gemeinschaftstisch", "oval", 1, 12, true]
            ]);
    });

    test.each([
        ["missing table types", {}],
        ["empty table types", {tableTypes: []}],
        ["zero minimum", {tableTypes: [{...tableTypes[0], minCapacity: 0}]}],
        ["minimum larger than maximum", {tableTypes: [{...tableTypes[0], minCapacity: 9}]}],
        ["fractional capacity", {tableTypes: [{...tableTypes[0], maxCapacity: 8.5}]}],
        ["zero quantity", {tableTypes: [{...tableTypes[0], quantity: 0}]}],
        ["excessive quantity", {tableTypes: [{...tableTypes[0], quantity: 10001}]}],
        ["invalid shape", {tableTypes: [{...tableTypes[0], shape: ""}]}],
        ["invalid community flag", {tableTypes: [{...tableTypes[0], communityTable: "false"}]}]
    ])("rejects %s", (_description, configuration) => {
        writeFileSync(path, JSON.stringify(configuration));
        expect(() => loadTables(path)).toThrow("Invalid table configuration");
    });

    test("reports unreadable and malformed files", () => {
        expect(() => loadTables(path)).toThrow("Cannot read table configuration");
        writeFileSync(path, "{");
        expect(() => loadTables(path)).toThrow("Cannot read table configuration");
    });
});
