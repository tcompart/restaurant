import {BadRequest, ReservationController} from './reservation';
import {ReservationDTO} from "./reservation.dto";
import {FakeDatabase} from "./service-injection";
import {ReservationImpl} from "./reservation.impl";

const someDate = new Date().toISOString();
const someEmail = "my@email.com";
const someName = 'My Name';

describe('reservation', () => {
    test(' can be written to database', () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase);

        const reservationDTO = new ReservationDTO("2023-11-24 19:00", "juliad@example.net", "Julia Domna", 5);
        reservationController.post(reservationDTO)

        const expected = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity)
        expect(fakeDatabase.at(0)).toMatchObject({
            at: new Date("2023-11-24 19:00"),
            email: "juliad@example.net",
            name: "Julia Domna",
            quantity: 5
        })
    });

    it.each([
        '99-2343-2343:32894;:343',
        'hallo',
        '',
        '2023-02-31 10:00',
    ])(' requires to fail on invalid date %p', (invalidDate) => {
        const reservationDTO = new ReservationDTO(invalidDate, someEmail, someName, 5);
        const controller = new ReservationController(new FakeDatabase());
        try {
            controller.post(reservationDTO);
            expect("failure").toBe(true);
        }
        catch (error) {
            expect((error as BadRequest).message).toMatch(/not a valid date/);
            expect((error as BadRequest).name).toBe("400");
        }
    })

    it('not allowed without emails', () => {
        const controller = new ReservationController(new FakeDatabase());
        try {
            controller.post(new ReservationDTO('2023-03-11 19:00', '', someName, 5));
            expect("failure").toBe(true);
        } catch(error) {
            expect((error as BadRequest).message).toMatch(/email needs to be defined./);
            expect((error as BadRequest).name).toBe("400");
        }
    });

    describe('impl', () => {
        it.each([
            '99-2343-2343:32894;:343',
            'hallo',
            '',
            '2023-02-31 10:00',
        ])(' validates date as well %p', (invalidDate) => {
            try {
                new ReservationImpl(invalidDate, someEmail, someName, 2);
                expect("failure").toBe(true);
            } catch (e) {
                expect((e as BadRequest).message).toBe(invalidDate + " is not a valid date");
            }
        });
        it.each([0, -1, -100, 'x'])
        (' validates number %p of guests to be not valid', (input) => {
            expect(() => new ReservationImpl(someDate, someEmail, someName, Number(input)))
               .toThrow("please give at least one person for the reservation");
        });

        it(' validates names to be at least empty', () => {
           const reservation = new ReservationImpl(someDate, someEmail, null!,2);
           expect(reservation.name).toBe("");
        });
    });
});