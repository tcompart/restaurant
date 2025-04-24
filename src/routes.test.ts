import {Request, Response} from 'express';
import {createReservationRoute} from "./routes";

describe('routes', () => {
  test('can be created', () => {
    let reservationRoute = createReservationRoute();
    expect(reservationRoute).toBeDefined();
  });


  describe('if used', () => {
    const today = new Date();
    const req = {body: {}} as Request;
    const res = {
      status: (num?) => {},
      send: (body?: any) => {}
    } as Response;

    test('response needs to be defined', () => {
      const route = createReservationRoute();
      route(req, res);
    });

    test('request requires field at', () => {
      const route = createReservationRoute();
      req.body.at = today.toISOString().split('T')[0];
      route(req, res);
    });

    test('request requires field email', () => {
      const route = createReservationRoute();
      req.body.at = today.toISOString().split('T')[0];
      req.body.email = 'my@mail.com';
      route(req, res);
    });


  })
});