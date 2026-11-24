import request from "supertest";
import axios from "axios";
import app from "./app";
import os from "os";
import {FakeDatabase} from "./reservation/fake-database";
import * as services from "./reservation/service-injection";

describe('Restaurant', () => {

  let host = os.hostname().toLowerCase();

  afterAll(done => {
    app.server.close(() => {
      setTimeout(done, 100)
    })
  })

  test('says Hello World', async () => {
    const result = await axios.get('http://127.0.0.1:3000');
    expect(result.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(result.status).toBe(200);
    expect(result.data).toStrictEqual({
      "_links": [
        {
          "_href": `http://${host}:3000/reservation`,
          "_rel": "urn:addReservation",
        },
        {
          "_href": `http://${host}:3000/reservations`,
          "_rel": "urn:reservations",
        },
        {
          "_href": `http://${host}:3000/reservations/availability`,
          "_rel": "urn:reservationAvailability",
        },
        {
          "_href": `http://${host}:3000/reservations/calendar`,
          "_rel": "urn:reservationCalendar",
        }
      ]});
  });

  test('application is an http app', async () => {
    await request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect(200)
        .then(res => {
          expect(res.body._links[0]._rel).toBe("urn:addReservation");
        });
  });

  test('post reservation with wrong fields is punished with 400 bad request', async () => {
    const reservation = {
      date: "2023-03-10 19:00",
      email: "does_not_matter",
      name: "anyways",
      quantity: 0
    };
    await expect(axios.post('http://127.0.0.1:3000/reservations', reservation)).rejects.toMatchObject(
        {
          response: {
            data: "Bad request.",
            status: 400
          }
        });
  })

  test('post reservation with valid json request', async () => {
    const reservation = {
      at: "2023-08-30 10:00",
      email: "katinka.kuruna@findme.com",
      name: "Katinka Kuruna",
      quantity: 1
    };
    await expect(axios.post('http://127.0.0.1:3000/reservations', reservation)).resolves.toMatchObject({
      status: 201,
      data: {
        msg: "Reservation accepted."
      }
    });
  })

  test('checks reservation availability through the HTTP API', async () => {
    const at = new Date();
    at.setDate(at.getDate() + 1);
    at.setHours(12, 0, 0, 0);

    await expect(axios.post('http://127.0.0.1:3000/reservations/availability', {
      at: at.toISOString(),
      quantity: 4
    })).resolves.toMatchObject({
      status: 200,
      data: {available: true}
    });
  });

  test('checks calendar availability using query parameters', async () => {
    const from = new Date();
    from.setDate(from.getDate() + 1);
    from.setHours(12, 0, 0, 0);
    const to = new Date(from);
    to.setHours(14, 0, 0, 0);
    const expectedSlots = [0, 30, 60, 90].map(minutes =>
      new Date(from.getTime() + minutes * 60_000).toISOString()
    );

    await request(app)
      .get('/reservations/calendar')
      .query({from: from.toISOString(), to: to.toISOString(), quantity: '4'})
      .expect(200)
      .expect({available: expectedSlots});
  });

  test('rejects repeated calendar query parameters', async () => {
    const from = new Date();
    from.setDate(from.getDate() + 1);
    from.setHours(12, 0, 0, 0);
    const to = new Date(from);
    to.setHours(14, 0, 0, 0);

    await request(app)
      .get('/reservations/calendar')
      .query({from: [from.toISOString(), from.toISOString()], to: to.toISOString(), quantity: '4'})
      .expect(400)
      .expect('Bad request.');
  });

  test('a reservation is visible to subsequent availability and calendar requests', async () => {
    const database = new FakeDatabase();
    const repository = jest.spyOn(services, 'getReservationRepository').mockReturnValue(database);
    try {
      const at = new Date();
      at.setDate(at.getDate() + 1);
      at.setHours(12, 0, 0, 0);
      const to = new Date(at);
      to.setHours(14, 0, 0, 0);

      await request(app)
        .post('/reservations')
        .send({at: at.toISOString(), email: 'guest@example.com', name: 'Test Guest', quantity: 10})
        .expect(201);

      await request(app)
        .post('/reservations/availability')
        .send({at: at.toISOString(), quantity: 1})
        .expect(200)
        .expect({available: false});

      await request(app)
        .get('/reservations/calendar')
        .query({from: at.toISOString(), to: to.toISOString(), quantity: '1'})
        .expect(200)
        .expect({available: []});
    } finally {
      repository.mockRestore();
    }
  });
});
