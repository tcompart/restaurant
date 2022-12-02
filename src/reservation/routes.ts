import {Request, Response} from 'express';
import {getReservationRepository} from "./service-injection";
import {ErrorHandling} from "./errorHandling";
import {ReservationController} from "./reservation.ctlr";

export function createReservationRoute(repo = getReservationRepository()) {
    return (req: Request, res: Response) => {
        const onfulfilled = () => {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(201);
            res.send(JSON.stringify({
                "msg": "Reservation accepted."
            }))
        };
        new ReservationController(repo).post(req.body)
            .then(onfulfilled).catch(new ErrorHandling(res).onRejected)
    };
}
