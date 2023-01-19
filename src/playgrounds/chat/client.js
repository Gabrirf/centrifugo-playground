const chalk = require('chalk');
const jwt = require('jsonwebtoken');
const centrifugoConfig = require('../../../config.json');
const { createConsumer,  } = require('../../sdk/client');
const { read } = require('../../sdk/cli');

const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';
const CONSUMER_SECRET = centrifugoConfig.token_hmac_secret_key;

/** args */
const auth = '1';
const name = `Client${auth}`;
const color = chalk['blue'];
/** */

async function controller(ctx){
  const channel = ctx.channel;
  const { msg } = ctx.data;
  try {
    if(ctx.info?.user !== auth){
      console.log(`${color(channel)} -> ${msg}`);
      const text = await read('> ');
      await consumer.publish(`chat:#0,${auth}`, { msg: text });
    }
  } catch (error) {
    console.log(`Error ${color(name)}`, error);
  }
}

const consumerConfig = {
  name, auth, color,
  channels: ['chat:group1'],
  url: CONSUMER_URL,
  //token: jwt.sign({ sub: `${i+1}` }, CONSUMER_SECRET),
  controller,
};

const consumer = createConsumer(consumerConfig);

async function init(){
  try {
    const text = await read('> ');
    await consumer.publish(`chat:#0,${auth}`, { msg: text });
  } catch (error) {
    console.log(`Error ${color(name)} ${JSON.stringify(error)}`);
  }
}

init();
