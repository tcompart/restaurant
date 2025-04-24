import request from "supertest";
import axios from "axios";
import app from "./app";

describe('Restaurant', () => {
  test('says Hello World', async () => {
    const result = await axios.get('http://127.0.0.1:3000');
    expect(result.headers["content-type"]).toBe("application/json; charset=utf-8");
    expect(result.status).toBe(200);
    expect(result.data).toStrictEqual({
      "_links": [
        {
          "_href": "http://farmnw267.farmnet.intra:3000/reservation",
          "_rel": "urn:addReservation",
        },
        {
          "_href": "http://farmnw267.farmnet.intra:3000/reservations",
          "_rel": "urn:reservations",
        }
      ]});
  });

  test('application is an http app', async () => {
    request(app)
        .get('/')
        .expect('Content-Type', /json/)
        .expect('Content-Length', '187')
        .expect(200)
        .end(function(err, res) {
          if (err) throw err;
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
});
