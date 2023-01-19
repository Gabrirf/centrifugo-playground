const express = require('express');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const centrifugoConfig = require('../../../config.json');
const { createConsumer } = require('../../sdk/client');

const PORT = 3001;
const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';
const CONSUMER_SECRET = centrifugoConfig.token_hmac_secret_key;

/** args */
const auth = '0';
const name = 'Server';
const color = chalk['green'];
/** */

async function controller(ctx){
  const channel = ctx.channel;
  const { msg } = ctx.data;
  try {
    if(ctx.info?.user !== auth){
      console.log(`${color(channel)} -> ${JSON.stringify(msg)}`);
      await consumer.publish(`chat:#0,${ctx.info.user}`, { msg: "hello" })
    }else{
      console.log(`${color(name)} -> ${JSON.stringify(msg)}`);
    }
  } catch (error) {
    console.log(`Error ${color(name)}`, error);
  }
}

const consumerConfig = {
  name: 'Server',
  auth: '0',
  color,
  channels: ['chat:group1'],
  url: CONSUMER_URL,
  //token: jwt.sign({ sub: `${i+1}` }, CONSUMER_SECRET),
  controller,
};

const app = express();
app.use(express.json());

app.post(`/centrifugo/connect`, async (req, res) => {
  try {
    const { authorization } = req.headers;
    if(authorization === 'patata') throw Error();
    if(authorization !== consumerConfig.auth){
      consumer.subscribe(`chat:#${consumerConfig.auth},${authorization}`);
    }
    res.status(200).send({
      result: {
        user: authorization,
        channels: [...req.body.data.channels, 'chat:all', `chat:#0,${authorization}`]
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

const consumer = createConsumer(consumerConfig);