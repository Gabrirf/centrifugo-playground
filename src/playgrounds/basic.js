// curl -X POST http://localhost:3001/publish/publisher1 -H 'Content-Type: application/json' -d '{"channel": "channel1", "data": { "hello": "world!" }}'
const express = require('express');
const { createConsumer, createPublisher } = require('../sdk/client');

const PORT = 3001;
const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';
const CONSUMER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2NzIwNDcxNDQsImlhdCI6MTY3MTQ0MjM0NH0.jZk7J4reLu0OaYOzeoc4SNaTVestMinZWrkK_6X3E4A';
const PUBLISHER_URL = 'http://localhost:8000/api';
const PUBLISHER_TOKEN = 'd7627bb6-2292-4911-82e1-615c0ed3eebb';

const consumers = [
  { name: 'Consumer1', channels: ['channel1'] },
  { name: 'Consumer2', channels: ['channel1', 'channel4'] },
  { name: 'Consumer3', channels: ['channel1', 'channel2', 'channel3'] },
  { name: 'Consumer4', channels: ['channel1', 'channel2', 'channel3', 'channel4'] },
  { name: 'Consumer5', channels: ['channel5'] },
  { name: 'Consumer0', channels: [] }
];
const publishers = ['publisher1', 'publisher2', 'publisher3'];

let publisersClients;

function initClients(){
  const consumersClients = consumers.map(c => {
    const consumer = createConsumer(c.name, CONSUMER_URL, CONSUMER_TOKEN)
    c.channels.map (ch => consumer.subscribe(ch));
    return consumer;
  });
  publisersClients = publishers.map(p => createPublisher(p, PUBLISHER_URL, PUBLISHER_TOKEN));
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