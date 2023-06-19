const { Centrifuge } = require('centrifuge')
const WebSocket = require('ws');
const chalk = require('chalk');

const CONSUMER_URL = 'ws://localhost:8000/connection/websocket';

const myWs = function (options) {
  return class wsClass extends WebSocket {
      constructor(...args) {
          super(...[...args, ...[options]])
      }
  }
}

const consumers = [
  { name: 'Allowed0', auth: 'dmsas', color: chalk.blue, data: { building: 'VirgenDelRocio', floor: 'planta1', room: 'Pedagogía'} },
  { name: 'Allowed1', auth: 'rodriguezgabriel70s', color: chalk.green, data: { building: 'VirgenDelRocio', floor: 'planta1', room: 'Pedagogía'}},
  { name: 'Allowed2', auth: 'guerrerogonzalo77w', color: chalk.yellow, data: { building: 'VirgenDelRocio', floor: 'planta3', room: 'Radiologia'} },
  { name: 'NotAllowed', auth: 'patata', color: chalk.red, data: { building: 'VirgenDelRocio', floor: 'planta5', room: 'Pedagogía'} },
];

function createConsumer(options){
  const { name, url, auth, color, data } = options;

  const centrifuge = new Centrifuge(url, 
    {
      websocket: auth ? myWs({ headers: { Authorization: auth } }) : WebSocket,
      data,
    },
  );

  centrifuge.name = name;

  centrifuge.on('connected', () => console.log(`${color(name)} connected`));
  centrifuge.on('connecting', () => console.log(`${color(name)} connecting`));
  centrifuge.on('disconnected', () => console.log(`${color(name)} disconnected`));

  const defaultController = (ctx) => {
    const channel = ctx.channel;
    const payload = JSON.stringify(ctx.data);
    console.log('Publication from server-side channel', color(channel), payload);
  };
  centrifuge.on('publication', defaultController);

  centrifuge.connect();
  return centrifuge;
}

function initClients(){
  consumers.forEach((consumerConfig, i) => {
    consumerConfig.url = CONSUMER_URL;
    const consumer = createConsumer(consumerConfig);
    return consumer;
  });
}

function init(){
  initClients();
}

init();
