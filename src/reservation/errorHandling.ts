import {Response} from 'express';

export class UnexpectedError implements Error {
    constructor(message: string, stack: Error) {
        this.message = message;
        this.name = stack.name;
        this.error = stack;
    }

    name: string;
    message: string;
    error: Error;
}

export class BadRequest implements Error {
    constructor(message: string, name: string) {
        this.message = message;
        this.name = name;
    }

    message: string;
    name: string;
}

export class TooManyReservationError implements Error {
    constructor() {
        this.message = "Too many reservations";
        this.name = "409";
    }

    message: string;
    name: string;
}

export class ErrorHandling {
    private readonly _resp: Response;

    constructor(resp: Response) {
        this._resp = resp;
    }

    onRejected = (e: Error) => {
        if (e instanceof BadRequest) {
            console.log("BadRequest was catched: ", e);
            this._resp.status(400);
            this._resp.send('Bad request.');
        } else if (e instanceof TooManyReservationError) {
            console.log("TooManyReservationError was catched: ", e);
            this._resp.status(409);
            this._resp.send('Too many reservations. Conflict.');
        } else {
            this._resp.status(500);
        }
    };
}