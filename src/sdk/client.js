const { Centrifuge } = require('centrifuge')
const WebSocket = require('ws');
const { CentClient } = require('cent.js');

function createConsumer(options){
  const { name, url, token, color} = options;

  const centrifuge = new Centrifuge(url, { token, websocket: WebSocket });

  centrifuge.name = name;

  centrifuge.on('connected', () => {
    console.log(`${name} connected`);
  });

  centrifuge.on('connecting', () => {
    console.log(`${name} connecting`);
  });

  centrifuge.on('disconnected', () => {
    console.log(`${name} disconnected`);
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