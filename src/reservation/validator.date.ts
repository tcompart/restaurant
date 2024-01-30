import dayjs from "dayjs";

export function isValidDate(date: Date|string) {
    function findDateByPattern(myString: string) {
        const yyyyMMdd = /\d{4}-\d{2}-\d{2}/;
        return yyyyMMdd.test(myString);
    }
    let extractedDate;
    if (date instanceof Date) {
        extractedDate = new Date(date).toISOString();
    } else if (findDateByPattern(date)) {
        extractedDate = date;
    } else if (/[12][0129]\d\d/.test(date)) {
        extractedDate = new Date(date).toISOString();
    } else {
        return false;
    }
    const localDate = extractedDate.substring(0, "YYYY-MM-DD".length);
    const dayjs1 = dayjs(localDate, "YYYY-MM-DD");
    const s = dayjs1.format("YYYY-MM-DD");
    return s === localDate;
}
