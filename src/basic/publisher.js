const express = require('express')
const app = express()

const { CentClient } = require('cent.js');

const centrifugeUrl = 'http://localhost:8000/api';
const centrifugeToken = 'd7627bb6-2292-4911-82e1-615c0ed3eebb';

const client = new CentClient({
    url: centrifugeUrl,
    token: centrifugeToken,
})

app.use(express.json());

// curl -X POST http://localhost:3001/publish -H 'Content-Type: application/json' -d '{"channel": "channel", "data": { "hello": "world!" }}'
app.post('/publish', async (req, res) => {
  const { channel, data }  = req.body;

  try {    
    await client.publish({channel, data})
    return res.send('Message published');
  } catch (error) {
    console.log(err)
    res.status(500).send(err.message)
  }
})

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
