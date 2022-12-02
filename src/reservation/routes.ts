import {Request, Response} from 'express';
import {getReservationRepository} from "./service-injection";
import {ReservationController} from "./reservation";
import {ErrorHandling} from "./errorHandling";

export function createReservationRoute(reservationRepository = getReservationRepository) {
    return (req: Request, res: Response) => {
        const onfulfilled = () => {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(201);
            res.send(JSON.stringify({
                "msg": "Reservation accepted."
            }))
        };
        new ReservationController(reservationRepository()).post(req.body)
            .then(onfulfilled).catch(new ErrorHandling(res).onrejected)
    };
}
