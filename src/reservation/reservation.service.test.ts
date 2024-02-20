import ReservationService from "./reservation.service";
import {ReservationDTO} from "./reservation.dto";

describe('ReservationService', () => {

    const someName = 'This is a name';
    const someEmail = 'me@mail.com';

    it.each([
        '99-2343-2343:32894;:343',
        'hallo',
        '',
        '2023-02-31 10:00',
    ])(' requires to fail on invalid date %p', async (invalidDate) => {
        const reservationDTO = new ReservationDTO(invalidDate, someEmail, someName, 5);
        expect(() => new ReservationService().mapToValidReservation(reservationDTO)).toThrow(invalidDate + " is not a valid date");
    });

    it('not allowed without emails', async () => {
        expect(() => new ReservationService().mapToValidReservation(new ReservationDTO('2023-03-11 19:00', '', someName, 5))).toThrow("email needs to be defined.");
    });
})