import {Link, ResponseBody} from "./reservation/responsebody";

const express = require('express')
const bodyParser = require('body-parser')
const {createReservationRoute} = require("./routes");
import * as dotenv from 'dotenv'
import {DatabaseReservationRepository} from "./reservation/databaseReservationRepository";

import os from "os";

dotenv.config() // Load the environment variables
console.log(`The connection URL is ${process.env.DATABASE_URL}`)


const app = express()
app.disable("x-powered-by");
app.use(bodyParser.json())
const port = `${process.env.PORT}`;

function buildHost(s: string): string {
  s = s.toLowerCase();
  return `${process.env.NODE_ENV === 'prod' ? 'https' : 'http' }://${s}:${port}`;
}

const host = buildHost(os.hostname());

app.get('/', (_req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.send(new ResponseBody([
      new Link("urn:addReservation", new URL(host + "/reservation")),
      new Link("urn:reservations", new URL(host + "/reservations"))
  ]));
})

app.post('/reservations', createReservationRoute(new DatabaseReservationRepository()))
app.post('/reservations', createReservationRoute(new DatabaseReservationRepository()))

app.server = app.listen(port, () => {
  console.log(`Server is running on ${host}`)
});

function handleExit(signal: any) {
  console.log(`Received ${signal}. Closing server properly.`);
  app.server.close(function () {
    console.log('HTTP server closed');
  });
}

process.on('SIGINT', handleExit);
process.on('SIGQUIT', handleExit);
process.on('SIGTERM', handleExit);

export default app;