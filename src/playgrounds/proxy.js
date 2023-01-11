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
  { name: 'Allowed0', auth: '1', color: chalk.blue, channels: ['notifica', 'chat', 'chat:personal']},
  { name: 'Allowed1', auth: '2', color: chalk.green, channels: ['chat']},
  { name: 'Allowed2', auth: '3', color: chalk.yellow, channels: []},
  { name: 'NotAllowed', auth: 'patata', color: chalk.red, channels: []},
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
    //consumerConfig.channels.map (ch => consumer.subscribe(ch));
    return consumer;
  });
  publisersClients = publishers.map(p => createPublisher(p));
}

function initApi(){
  app.post(`/centrifugo/connect`, async (req, res) => {
    try {
      if(req.headers.authorization === 'patata') throw Error();
      res.status(200).send({
        result: {
          user: req.headers.authorization,
          //channels: req.data.channels
        }
      })
    } catch (error) {
      res.status(200).send({
        disconnect: {
          code: 4500,
          reason: "custon disconnect"
        }
      });
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