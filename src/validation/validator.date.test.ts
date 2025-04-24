import {isValidDate} from "./validator.date";

it.each([
    '2023-02-28 10:00',
    'Fri Nov 24 2023 19:00:00 GMT+0100'
])('validates dates as input', function(invaliddate, done) {
    isValidDate(invaliddate)
    done();
})