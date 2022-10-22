const axios = require('axios');

describe('Restaurant', () => {
  test('says Hello World', async () => {
    await axios.get('http://127.0.0.1:3000')
      .catch(e => {
        console.log('An error was thrown: ', e.code);
      })
      .then(r => {
        console.log("Response: ", r);
        expect(r.status).toBe(200);
        expect(r.data).toStrictEqual({"msg": "Hello World"});
      })
    ;
  });
});
