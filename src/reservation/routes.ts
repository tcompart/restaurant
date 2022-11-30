import {Request, Response} from 'express';
import {getReservationRepository} from "./service-injection";
import {BadRequest, ReservationController} from "./reservation";

export function createReservationRoute(reservationRepository = getReservationRepository) {
    return (req: Request, res: Response) => {
        let jsonContent = JSON.stringify({
            "msg": "Reservation accepted."
        });
        new ReservationController(reservationRepository()).post(req.body)
            .then(() => {
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.status(201);
                res.send(jsonContent)
            }).catch(e => {
            if (e instanceof BadRequest) {
                console.log("BadRequest was catched: ", e);
                res.status(400)
                res.send('Bad request.')
            }
        })
    };
}
