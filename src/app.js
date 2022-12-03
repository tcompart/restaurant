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
const port = 3000;

app.get('/', (_req, res) => {
  let jsonContent = JSON.stringify({
    "msg": "Hello World"
  });
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  res.send(jsonContent)
})

app.post('/reservations', createReservationRoute(new Repository()))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
