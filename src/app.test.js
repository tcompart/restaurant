const axios = require('axios');

describe('Restaurant', () => {
  process.env.NODE_ENV = 'local';
  test('says Hello World', async () => {
    const result = await axios.get('http://127.0.0.1:3000');
    expect(result.status).toBe(200);
    expect(result.data).toStrictEqual({"msg": "Hello World"});
  });

  test('post reservation with wrong fields is punished with 400 bad request', async () => {
    const reservation = {
      date: "2023-03-10 19:00",
      email: "does_not_matter",
      name: "anyways",
      quantity: 0
    };
    await expect(axios.post('http://127.0.0.1:3000/reservations', reservation, {
      headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json'
      }
    })).rejects.toMatchObject({response: {data: "Bad request.", status: 400}});
  })

  test('post reservation with valid json request', async () => {
    const reservation = {
      at: "2023-08-30 10:00",
      email: "katinka.kuruna@findme.com",
      name: "Katinka Kuruna",
      quantity: 1
    };
    await expect(axios.post('http://127.0.0.1:3000/reservations', reservation, {
      headers: {
        // 'application/json' is the modern content-type for JSON, but some
        // older servers may use 'text/json'.
        // See: http://bit.ly/text-json
        'content-type': 'application/json'
      }
    })).resolves.toMatchObject({
      status: 201,
      data: {
        msg: "Reservation accepted."
      }
    });
  })
});
