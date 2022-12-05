const {Centrifuge} = require('centrifuge');
const express = require('express');
const WebSocket = require('ws');

const centrifugeUrl = 'ws://localhost:8000/connection/websocket';
const centrifugeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2NzA4NTQ5ODIsImlhdCI6MTY3MDI1MDE4Mn0.OCUSxQ6ebIPqQk-RywynvQWEofYDF0TjBVhyBWNEf3Q';

const centrifuge = new Centrifuge(centrifugeUrl, {
  token: centrifugeToken,
  websocket: WebSocket
})

const sub = centrifuge.newSubscription('channel');

sub.on('publication', function(ctx) {
    console.log(ctx.data);
});

sub.subscribe();

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

const app = express();

app.listen(3000, () => {
  console.log('Server ready');
})