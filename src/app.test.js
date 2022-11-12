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

  test('post reservation data', async () => {
    const reservation = {
      date: "2023-03-10 19:00",
      email: "katinka@example.com",
      name: "Katinka Ingabogovinanana",
      quantity: 2
    };
    await axios.post('http://127.0.0.1:3000/reservations', reservation,{
      headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json'
      }
    })
      .catch(e => {
        console.log('An error was thrown: ', e.code);
        expect(false).toBe(true);
      })
      .then(r => {
        expect(r.status).toBe(201);
        expect(r.data).toStrictEqual({"msg": "Reservation accepted."});
      })
    ;
  })
});
