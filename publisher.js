const express = require('express')
const app = express()

const { CentClient } = require('cent.js');

const centrifugeUrl = 'http://localhost:8000/api';
const centrifugeToken = 'd7627bb6-2292-4911-82e1-615c0ed3eebb';

const client = new CentClient({
    url: centrifugeUrl,
    token: centrifugeToken,
})

app.post('/publish', (req, res) => {
  const channel = 'channel'
  const data = { text: 'Hello, world!' }  

  client.publish({channel, data})
  .then(() => {
    console.log('ok')
    res.send('Message published')
  })
  .catch(err => {
    console.log(err)
    res.status(500).send(err.message)
  })
})

app.listen(3001, () => {
  console.log('Server listening on port 3001')
})
