'use strict';

const data = process.argv[2];
const config = require('./config');
const express = require('express');
const redis = require('redis');

const PORT = config.app.port;
const REDIS_HOST = config.redis.host;
const REDIS_PORT = config.redis.port;

const client = redis.createClient({
  socket: {
    port: REDIS_PORT,
    host: REDIS_HOST,
  },
});

client.connect();

const app = express();

const readLines = require('n-readlines');
const lines = new readLines(data);
processFile();

async function getLine(req, res) {
  try {
    const { line } = req.params;
    const value = await client.hGet('lines-file:1', line.toString());

    if (value !== null) {
      res.status(200).send(value);
    } else {
      res.status(413).send('Requested line beyond length of file.');
    }
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}

app.get('/lines/:line', getLine);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

function processFile() {
  console.log('Processing data file...');

  let line;
  let lineNumber = 1;

  while ((line = lines.next())) {
    client.hSet('lines-file:1', lineNumber.toString(), line.toString('ascii'));
    lineNumber++;
  }
}
