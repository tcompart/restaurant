import {Request, Response} from 'express';
import {getReservationRepository} from "./reservation/service-injection";
import {ErrorHandling} from "./reservation/errorHandling";
import {ReservationController} from "./reservation/reservation.ctlr";

import {Table} from "./reservation/table";

export function findAvailableTables(tables: Table[] = []): Table[] {
    return tables;
}

export function getReservationController(repo = getReservationRepository()) {
    return new ReservationController(repo, findAvailableTables([new Table(10)]));
}

export function createReservationRoute() {
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

export function getReservationsRoute() {
    return (res: Response) => {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.status(200);
        res.send(getReservationController().get());
    };
}
