const express = require('express');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const centrifugoConfig = require('../../config.json');
const { createConsumer, createPublisher } = require('../sdk/client');

const PORT = 3001;
const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';
const CONSUMER_SECRET = centrifugoConfig.token_hmac_secret_key;
const PUBLISHER_URL = 'http://localhost:8000/api';
const PUBLISHER_TOKEN = centrifugoConfig.api_key;

const consumers = [
  { name: 'Allowed', auth: 'ok', color: chalk.blue, channels: ['chat'] },
  { name: 'NotAllowed', auth: 'patata', color: chalk.red, channels: ['chat'] },
];
const publishers = [
  { name: 'chat', url: PUBLISHER_URL, token: PUBLISHER_TOKEN, color: chalk.bgBlue }
];

let publisersClients;

function initClients(){
  consumers.forEach((consumerConfig, i) => {
    consumerConfig.url = CONSUMER_URL;
    //consumerConfig.token = jwt.sign({ sub: `${i+1}` }, CONSUMER_SECRET);
    const consumer = createConsumer(consumerConfig);
    consumerConfig.channels.map (ch => consumer.subscribe(ch));
    return consumer;
  });
  publisersClients = publishers.map(p => createPublisher(p));
}

function initApi(){

  app.post(`/centrifugo/connect`, async (req, res) => {
    try {
      if(req.headers.authorization !== 'ok') throw Error();
      res.status(200).send({result: {user: req.body.client }})
    } catch (error) {
      res.status(200).send({result: {}});
    }
  });

  // curl http://localhost:3001/init
  app.get(`/init`, async (req, res) => {
    try {
      initClients();
      res.status(200).send(`done`);
    } catch (error) {
      res.status(404).send(error.message);
    }
  });

  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

const app = express()
app.use(express.json());

function init(){
  initApi();
  initClients();
}

init();