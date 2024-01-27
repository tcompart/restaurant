import {Response} from 'express';
import {BadRequest} from "./reservation";

export class ErrorHandling {
    private _resp: Response;

    constructor(resp: Response) {
        this._resp = resp;
    }

    onRejected = (e: Error) => {
        if (e instanceof BadRequest) {
            console.log("BadRequest was catched: ", e);
            this._resp.status(400);
            this._resp.send('Bad request.');
        } else {
            this._resp.status(500);
        }
    };
}