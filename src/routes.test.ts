import {Request, Response} from 'express';
import {createAvailabilityRoute, createCalendarRoute, createReservationRoute} from "./routes";

function createResponse(): Response {
  return {
    setHeader: jest.fn(),
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  } as unknown as Response;
}

function createQueryRequest(query: Request['query']): Request {
  return {query} as unknown as Request;
}

describe('routes', () => {

  describe('createReservationRoute', () => {
    test('can be created', () => {
      const reservationRoute = createReservationRoute();
      expect(reservationRoute).toBeDefined();
    });

    test('accepts a valid reservation', async () => {
      const reservationAt = new Date();
      reservationAt.setDate(reservationAt.getDate() + 1);
      reservationAt.setHours(12, 0, 0, 0);
      const req = {
        body: {
          at: reservationAt.toISOString(),
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

  describe('createAvailabilityRoute', () => {

    test('reports availability for a valid date and party size', async () => {
      const at = new Date();
      at.setDate(at.getDate() + 1);
      at.setHours(12, 0, 0, 0);
      const req = {body: {at: at.toISOString(), quantity: 4}} as Request;
      const res = createResponse();

      await createAvailabilityRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({available: true}));
    });

    test('reports unavailable when the party exceeds table capacity', async () => {
      const at = new Date();
      at.setDate(at.getDate() + 1);
      at.setHours(12, 0, 0, 0);
      const req = {body: {at: at.toISOString(), quantity: 11}} as Request;
      const res = createResponse();

      await createAvailabilityRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({available: false}));
    });

    test.each([
      ['invalid date', {at: '2026-02-31T12:00:00.000Z', quantity: 2}],
      ['missing party size', {at: new Date().toISOString()}],
      ['zero party size', {at: new Date().toISOString(), quantity: 0}],
      ['fractional party size', {at: new Date().toISOString(), quantity: 1.5}]
    ])('rejects availability request with %s', async (_description, body) => {
      const req = {body} as Request;
      const res = createResponse();

      await createAvailabilityRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Bad request.');
    });

    test('reports a missing availability date explicitly', async () => {
      const req = {body: {quantity: 2}} as Request;
      const res = createResponse();

      await createAvailabilityRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({error: "Missing required field 'at'."}));
    });
  });

  describe('createCalendarRoute', () => {

    const from = new Date();
    from.setDate(from.getDate() + 1);
    from.setHours(12, 0, 0, 0);
    const to = new Date(from);
    to.setHours(14, 0, 0, 0);

    test('reports availability for multiple dates and party size', async () => {
      const req = createQueryRequest({from: from.toISOString(), to: to.toISOString(), quantity: '4'});
      const res = createResponse();

      await createCalendarRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const responseBody = JSON.parse(jest.mocked(res.send).mock.calls[0][0]);

      const expectedSlots = [0, 30, 60, 90].map(minutes =>
          new Date(from.getTime() + minutes * 60_000).toISOString()
      );

      expect(responseBody).toEqual({available: expectedSlots});
    });

    test('reports unavailable when the party exceeds table capacity', async () => {
      const req = createQueryRequest({from: from.toISOString(), to: to.toISOString(), quantity: '11'});
      const res = createResponse();

      await createCalendarRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({available: []}));
    });

    test.each([
      ['invalid date', {from: '2026-02-31T12:00:00.000Z', to: '2026-02-32T12:00:00.000Z', quantity: '2'}],
      ['missing party size', {from: from.toISOString(), to: to.toISOString()}],
      ['zero party size', {from: from.toISOString(), to: to.toISOString(), quantity: '0'}],
      ['fractional party size', {from: from.toISOString(), to: to.toISOString(), quantity: '1.5'}],
      ['empty party size', {from: from.toISOString(), to: to.toISOString(), quantity: ''}],
      ['non-numeric party size', {from: from.toISOString(), to: to.toISOString(), quantity: '4people'}],
      ['repeated from', {from: [from.toISOString(), from.toISOString()], to: to.toISOString(), quantity: '2'}],
      ['repeated to', {from: from.toISOString(), to: [to.toISOString(), to.toISOString()], quantity: '2'}],
      ['repeated party size', {from: from.toISOString(), to: to.toISOString(), quantity: ['2', '4']}]
    ])('rejects availability request with %s', async (_description, query) => {
      const req = createQueryRequest(query);
      const res = createResponse();

      await createCalendarRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith('Bad request.');
    });

    test.each([
      ['both dates', {quantity: '2'}],
      ['from', {to: to.toISOString(), quantity: '2'}],
      ['to', {from: from.toISOString(), quantity: '2'}]
    ])('reports missing %s explicitly', async (_description, query) => {
      const req = createQueryRequest(query);
      const res = createResponse();

      await createCalendarRoute()(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(JSON.stringify({error: "Missing required field 'from' or 'to'."}));
    });
  });
});