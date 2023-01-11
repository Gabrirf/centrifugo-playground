const { Centrifuge } = require('centrifuge')
const WebSocket = require('ws');
const { CentClient } = require('cent.js');

const myWs = function (options) {
  return class wsClass extends WebSocket {
      constructor(...args) {
          super(...[...args, ...[options]])
      }
  }
}

function createConsumer(options){
  const { name, url, auth, token, color, channels} = options;

  const centrifuge = new Centrifuge(url, 
    {
      token,
      websocket: myWs({ headers: { Authorization: auth } }),
      data: {channels}
    },
  );

  centrifuge.name = name;

  centrifuge.on('connected', () => {
    console.log(`${color(name)} connected`);
  });

  centrifuge.on('connecting', () => {
    console.log(`${color(name)} connecting`);
  });

  centrifuge.on('disconnected', () => {
    console.log(`${color(name)} disconnected`);
  });

  centrifuge.on('publication', (ctx) => {
    const channel = ctx.channel;
    const payload = JSON.stringify(ctx.data);
    console.log('Publication from server-side channel', color(channel), payload);
  });

  centrifuge.subscribe = channel => {
    const sub = centrifuge.newSubscription(channel);

    const printEvent = event => msg => {
      console.log(`${color(`${name}(${channel})`)}: ${event} ${JSON.stringify(msg)}`);
    };

    sub.on('publication', printEvent('publication'));
    sub.on('subscribing', printEvent('subscribing'));
    sub.on('subscribed', printEvent('subscribed'));
    sub.on('unsubscribed', printEvent('unsubscribed'));
  
    sub.subscribe();
  };

  centrifuge.connect();
  return centrifuge;
}

function createPublisher(options){  
  const { name, url, token, color } = options;

  const client = new CentClient({ url, token });

  client.name = name;

  const { publish } = client;

  client.publish = async (channel, data) => {
    try {    
      await publish({channel, data});
      console.log(`${color(`${name}(${channel})`)}: Message published`);
    } catch (error) {
      console.log(`${name}(${channel}): ${JSON.stringify(error)}`);
    }
  }

  return client;
}

module.exports = {
  createConsumer,
  createPublisher,
}