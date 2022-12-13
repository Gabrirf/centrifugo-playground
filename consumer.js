const express = require('express')
const { Centrifuge } = require('centrifuge')
const WebSocket = require('ws');

const centrifugeUrl = 'ws://localhost:8000/connection/websocket'
const centrifugeSecret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2NzE1Mzc1NjcsImlhdCI6MTY3MDkzMjc2N30.FNcbgsmNeNubPb7Ia7r2ZNRplWBn9V2GsH9MFixXfdo';

const centrifuge = new Centrifuge(centrifugeUrl, {
  token: centrifugeSecret,
  websocket: WebSocket
})

const app = express();
app.use(express.json());

// curl -X POST http://localhost:3000/subscribe -H 'Content-Type: application/json' -d '{"channel": "channel"}'
app.post('/subscribe', (req, res) => {
  const { channel } = req.body;
  const sub = centrifuge.newSubscription(channel);

  sub.on('publication', msg => console.log(`publication ${JSON.stringify(msg)}`));
  sub.on('subscribing', msg => console.log(`subscribing ${JSON.stringify(msg)}`));
  sub.on('subscribed', msg => console.log(`subscribed ${JSON.stringify(msg)}`));
  sub.on('unsubscribed', msg => console.log(`unsubscribed ${JSON.stringify(msg)}`));

  sub.subscribe();
    
  return res.send('Subscribed to channel ' + channel);
})

centrifuge.on('connected', () => {
  console.log('connected');
})

centrifuge.on('connecting', () => {
  console.log('connecting');
})

centrifuge.on('disconnected', () => {
  console.log('disconnected');
})

centrifuge.connect();

const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
