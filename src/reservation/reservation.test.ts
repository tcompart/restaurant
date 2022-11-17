import {BadRequest, ReservationController, ReservationImpl} from './reservation';
import {ReservationDTO} from "./reservation.dto";
import {FakeDatabase} from "./service-injection";

describe('reservation', () => {
    test(' can be written to database', () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase);

        const reservationDTO = new ReservationDTO("2023-11-24 19:00", "juliad@example.net", "Julia Domna", 5);
        reservationController.post(reservationDTO)

        const expected = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity)
        expect(fakeDatabase.at(0)).toMatchObject({
            at: "2023-11-24T18:00:00.000Z",
            email: "juliad@example.net",
            name: "Julia Domna",
            quantity: 5
        })
    });

    it.each([
        new ReservationDTO('99-2343-2343:32894;:343', 'email@me.com', 'My Name', 5),
        new ReservationDTO('hallo', 'email@me.com', 'My Name', 5),
        new ReservationDTO('', 'email@me.com', 'My Name', 5),
        new ReservationDTO('2023-02-31 10:00', 'email@me.com', 'My Name', 5),
    ])('Adding reservation %p will result in %p', (reservationDto) => {
        const controller = new ReservationController(new FakeDatabase());
        try {
            controller.post(reservationDto);
            expect("failure").toBe(true);
        }
        catch (error) {
            expect((error as BadRequest).message).toMatch(/invalid date defined. Outcome is /);
            expect((error as BadRequest).name).toBe("400");
        }
    })
});