const readline = require("readline");

async function read(msg){
  const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });
  const line = await new Promise(resolve => {
    rl.question(`${msg}: `, resolve);}
  );
  rl.close();
  return line;
}

module.exports = {
  read,
}