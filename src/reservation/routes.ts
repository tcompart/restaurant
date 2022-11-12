import {Request, Response} from 'express';
import {getReservationRepository} from "./service-injection";
import {ReservationController} from "./reservation";

export function createReservationRoute(reservationRepository = getReservationRepository) {
    return (req: Request, res: Response) => {
        let jsonContent = JSON.stringify({
            "msg": "Reservation accepted."
        });
        new ReservationController(reservationRepository()).post(req.body);
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.status(201);
        res.send(jsonContent)
    }
}
