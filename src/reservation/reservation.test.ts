import {ReservationController, ReservationImpl} from './reservation';
import {ReservationDTO} from "./reservation.dto";
import {FakeDatabase} from "./service-injection";

describe('reservation', () => {
    test(' can be written to database', () => {
        const fakeDatabase = new FakeDatabase();
        const reservationController = new ReservationController(fakeDatabase);

        const reservationDTO = new ReservationDTO();
        reservationDTO.at = "2023-11-24 19:00"
        reservationDTO.email = "juliad@example.net"
        reservationDTO.name = "Julia Domna"
        reservationDTO.quantity = 5
        reservationController.post(reservationDTO)

        const expected = new ReservationImpl(reservationDTO.at, reservationDTO.email, reservationDTO.name, reservationDTO.quantity)
        expect(fakeDatabase.at(0)).toMatchObject({at: "2023-11-24T07:00:00.000+01:00", email: "juliad@example.net", name: "Julia Domna", quantity: 5})
    });
});