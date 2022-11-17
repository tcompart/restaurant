const axios = require('axios');

describe('Restaurant', () => {
  test('says Hello World', async () => {
    await axios.get('http://127.0.0.1:3000')
      .catch(e => {
        console.log('An error was thrown: ', e.code);
      })
      .then(r => {
        expect(r.status).toBe(200);
        expect(r.data).toStrictEqual({"msg": "Hello World"});
      })
    ;
  });

  test('post reservation with wrong fields is punished with 400 bad request', async () => {
    const reservation = {
      date: "2023-03-10 19:00",
      email: "does_not_matter",
      name: "anyways",
      quantity: 0
    };
    await axios.post('http://127.0.0.1:3000/reservations', reservation,{
      headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json'
      }
    })
      .then(r => {
        console("the request has to fail because of wrongly used json 'date' vs. 'at'.")
        expect(true).toBe(false);
      })
      .catch(e => {
        expect(e.response.status).toBe(400);
      })
    ;
  })

  test('post reservation with valid json request', async () => {
    const reservation = {
      at: "2023-09-10 10:00",
      email: "katinka.kuruna@findme.com",
      name: "Katinka Kuruna",
      quantity: 10
    };
    await axios.post('http://127.0.0.1:3000/reservations', reservation,{
      headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json'
      }
    })
      .then(r => {
        expect(r.status).toBe(201);
        expect(r.data).toStrictEqual({"msg": "Reservation accepted."});
      })
      .catch(e => {
        console.log("Oh nooooo. Error " + e.msg);
        expect(true).toBe(false);
      })
    ;
  })
});
