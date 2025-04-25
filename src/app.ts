import {Link, ResponseBody} from "./reservation/responsebody";

import * as dotenv from 'dotenv'

import os from "os";

import {createReservationRoute} from "./routes";
import bodyParser from "body-parser";
import express from "express";

dotenv.config() // Load the environment variables

const app = express()
app.disable("x-powered-by");
app.use(bodyParser.json())
const port = `${process.env.PORT}`;

let host = os.hostname();

app.get('/', (_req: any, res: any) => {
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.send(new ResponseBody([
      new Link("urn:addReservation", new URL(host + "/reservation")),
      new Link("urn:reservations", new URL(host + "/reservations"))
  ]));
})

app.post('/reservations', createReservationRoute())
app.post('/reservations', createReservationRoute())

const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  if (port === '443') {
    host = 'https://' + host;
  } else {
    host = 'http://' + host;
    if (port !== '80') {
      host = host + ':' + port;
    }
  }
});

function handleExit() {
  server.close(function () {
    console.log('HTTP server closed');
  });
}

process.on('SIGINT', handleExit);
process.on('SIGQUIT', handleExit);
process.on('SIGTERM', handleExit);

export default app;