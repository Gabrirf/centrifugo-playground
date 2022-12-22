/**
 * Commands to try:
 * - Broadcast: curl -X POST http://localhost:3001/publish/notifica -H 'Content-Type: application/json' -d '{"channel": "notifica", "data": { "hello": "world!" }}
 * - Message to group: curl -X POST http://localhost:3001/publish/notifica -H 'Content-Type: application/json' -d '{"channel": "notifica:a", "data": { "hello": "world!" }}
 * - Message private: curl -X POST http://localhost:3001/publish/notifica -H 'Content-Type: application/json' -d '{"channel": "notifica:a#1", "data": { "hello": "world!" }}
 * - Message multiple private: curl -X POST http://localhost:3001/publish/notifica -H 'Content-Type: application/json' -d '{"channel": "notifica:a#2,4", "data": { "hello": "world!" }}
 */

const express = require('express');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const centrifugoConfig = require('../config.json');
const { createConsumer, createPublisher } = require('./sdk/client');

const PORT = 3001;
const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';
const CONSUMER_SECRET = centrifugoConfig.token_hmac_secret_key;
const PUBLISHER_URL = 'http://localhost:8000/api';
const PUBLISHER_TOKEN = centrifugoConfig.api_key;

const consumers = [
  { name: 'Consumer1', color: chalk.blue, channels: ['notifica', 'notifica:a', 'notifica#1', 'notifica:a#1'] },
  { name: 'Consumer2', color: chalk.green, channels: ['notifica', 'notifica:a', 'notifica:c', 'notifica:a#2,4'] },
  { name: 'Consumer3', color: chalk.yellow, channels: ['notifica', 'notifica:b', 'notifica#1', 'notifica:a#1,3'] },
  { name: 'Consumer4', color: chalk.cyan, channels: ['notifica', 'notifica:b', 'notifica:a#2,4'] },
];
const publishers = [
  { name: 'notifica', url: PUBLISHER_URL, token: PUBLISHER_TOKEN, color: chalk.bgBlue }
];

let publisersClients;

function initClients(){
  const consumersClients = consumers.map((consumerConfig, i) => {
    consumerConfig.url = CONSUMER_URL;
    consumerConfig.token = jwt.sign({ sub: `${i+1}` }, CONSUMER_SECRET);
    const consumer = createConsumer(consumerConfig);
    consumerConfig.channels.map (ch => consumer.subscribe(ch));
    return consumer;
  });
  publisersClients = publishers.map(p => createPublisher(p));
}

function initApi(){
  app.post(`/publish/:publisher`, async (req, res) => {
    try {
      const { publisher: name } = req.params;
      const { channel, data }  = req.body;

      const publisher = publisersClients.find(p => p.name === name);
      if(!publisher) throw Error(`publisher ${name} doesn't exists`);

      publisher.publish(channel, data);
      res.status(200).send(`${name}(${channel}): ${JSON.stringify(data)}`)
    } catch (error) {
      res.status(404).send(error.message);
    }
  });
  app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}

const app = express()
app.use(express.json());

function init(){
  initClients();
  initApi();
}

init();