import {Repository} from "./reservation/reservation";

const express = require('express')
const bodyParser = require('body-parser')
const {createReservationRoute} = require("./reservation/routes");
import * as dotenv from 'dotenv'

dotenv.config() // Load the environment variables
console.log(`The connection URL is ${process.env.DATABASE_URL}`)


const app = express()
app.disable("x-powered-by");
app.use(bodyParser.json())
const port = `${process.env.PORT}`;

app.get('/', (_req, res) => {
  let jsonContent = JSON.stringify({
    "msg": "Hello World"
  });
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.send(jsonContent)
})

app.post('/reservations', createReservationRoute(new Repository()))

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

function handleExit(signal) {
  console.log(`Received ${signal}. Closing server properly.`);
  server.close(function () {
    console.log('HTTP server closed');
  });
}

process.on('SIGINT', handleExit);
process.on('SIGQUIT', handleExit);
process.on('SIGTERM', handleExit);
