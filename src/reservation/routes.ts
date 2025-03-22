import {Request, Response} from 'express';
import {getReservationRepository} from "./service-injection";
import {ErrorHandling} from "./errorHandling";
import {ReservationController} from "./reservation.ctlr";

import {Table} from "./table";

export function findAvailableTables(tables: Table[] = []): Table[] {
    return tables;
}

export function getReservationController(repo = getReservationRepository()) {
    return new ReservationController(repo, findAvailableTables([new Table(10)]));
}

export function createReservationRoute(repo = getReservationRepository()) {
    return (req: Request, res: Response) => {
        const onfulfilled = () => {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(201);
            res.send(JSON.stringify({
                "msg": "Reservation accepted."
            }))
        };
        getReservationController().post(req.body)
            .then(onfulfilled)
            .catch(new ErrorHandling(res).onRejected)
    };
}

export function getReservationsRoute(repo = getReservationRepository()) {
    return (req: Request, res: Response) => {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.status(200);
        res.send(getReservationController().get(req.body));
    };
}
