const http = require('http');

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  let jsonContent = JSON.stringify({
    "msg": "Hello World"
  });
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.end(jsonContent);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
