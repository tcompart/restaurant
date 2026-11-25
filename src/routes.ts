import {Request, Response} from 'express';
import {getReservationRepository} from "./reservation/service-injection";
import {BadRequest, ErrorHandling} from "./reservation/errorHandling";
import {ReservationController} from "./reservation/reservation.ctlr";

import Table from "./reservation/table";
import {Configuration} from "./reservation/configuration";
import {TimeOfDay} from "./reservation/timeOfDay";
import dayjs from "dayjs";

export function findAvailableTables(tables: Table[] = []): Configuration {
    return {tables, opens: new TimeOfDay(8), lastSeating: new TimeOfDay(20, 30), seatingDuration: dayjs.duration({minutes: 100})};
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
        return getReservationController().post(req.body)
            .then(onfulfilled)
            .catch(new ErrorHandling(res).onRejected)
    };
}

export function createAvailabilityRoute() {
    return (req: Request, res: Response) => {
        const request = req.body ?? {};
        if (request.at) {
            return getReservationController().checkAvailability(request.at, request.quantity)
                .then(available => {
                    res.setHeader('Content-Type', 'application/json;charset=utf-8');
                    res.status(200);
                    res.send(JSON.stringify({available}));
                })
                .catch(new ErrorHandling(res).onRejected);
        } else if (request.at === undefined) {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(400);
            res.send(JSON.stringify({error: "Missing required field 'at'."}));
        } else {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(400);
            res.send(JSON.stringify({error: "Invalid request body."}));
        }
    };
}

export function createCalendarRoute() {
    return (req: Request, res: Response) => {
        const {from, to, quantity} = req.query;
        if (from === undefined || to === undefined) {
            res.setHeader('Content-Type', 'application/json;charset=utf-8');
            res.status(400);
            return res.send(JSON.stringify({error: "Missing required field 'from' or 'to'."}));
        }
        if (typeof from !== 'string' || typeof to !== 'string' ||
            typeof quantity !== 'string' || !/^\d+$/.test(quantity)) {
            return new ErrorHandling(res).onRejected(new BadRequest("Invalid calendar query", "400"));
        }
        return getReservationController().checkAvailabilityFromTo(from, to, Number(quantity))
            .then(availableDates => {
                res.setHeader('Content-Type', 'application/json;charset=utf-8');
                res.status(200);
                res.send(JSON.stringify({available: availableDates}));
            })
            .catch(new ErrorHandling(res).onRejected);
    };
}


export function getReservationsRoute() {
    return (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json;charset=utf-8');
        res.status(200);
        getReservationController().get()
            .then(reservations => res.send({"reservations": reservations}))
            .catch(err => res.send(err));
    };
}
