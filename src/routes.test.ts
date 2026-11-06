import {Request, Response} from 'express';
import {createReservationRoute} from "./routes";

function createResponse(): Response {
  return {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as Response;
}

describe('routes', () => {
  test('can be created', () => {
    const reservationRoute = createReservationRoute();
    expect(reservationRoute).toBeDefined();
  });

  test('accepts a valid reservation', async () => {
    const req = {
      body: {
        at: new Date().toISOString(),
        email: 'my@mail.com',
        name: 'Test Guest',
        quantity: 2
      }
    } as Request;
    const res = createResponse();

    await createReservationRoute()(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith(JSON.stringify({msg: 'Reservation accepted.'}));
  });

  test('rejects a reservation without a date', async () => {
    const req = {
      body: {email: 'my@mail.com', name: 'Test Guest', quantity: 2}
    } as Request;
    const res = createResponse();

    await createReservationRoute()(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Bad request.');
  });

  test('rejects a reservation without an email', async () => {
    const req = {
      body: {at: new Date().toISOString(), name: 'Test Guest', quantity: 2}
    } as Request;
    const res = createResponse();

    await createReservationRoute()(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith('Bad request.');
  });
});