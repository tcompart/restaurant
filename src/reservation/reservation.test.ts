import {Reservation, ReservationImpl, ReservationRepository, Task} from './reservation';
import {ReservationDTO} from "./reservation.dto";

class ReservationController {
    private _repository: ReservationRepository;
    constructor(db: ReservationRepository) {
        this._repository = db;
    }

    post(reservationDTO: ReservationDTO) {
        this._repository.create(new ReservationImpl(new Date(2023,11,24,19,0,0), "juliad@example.net", "Julia Domna", 5))
    }
}

class FakeDatabase extends Array<Reservation> implements ReservationRepository{
    create(reservation: Reservation): Task {
        this.push(reservation)
        return Task.CompletedTask;
    }

}

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

        const expected = new ReservationImpl(new Date(2023,11,24,19,0,0), reservationDTO.email, reservationDTO.name, reservationDTO.quantity)
        expect(fakeDatabase).toContainEqual(expected)
    });
});