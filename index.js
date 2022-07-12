'use strict';

const data = process.argv[2];
const config = require('./config');
const express = require('express');

const PORT = config.app.port;

const app = express();

const readLines = require('n-readlines');
const lines = new readLines(data);
const store = processFile();

async function getLine(req, res) {
  try {
    const { line } = req.params;
    const value = await store[line];

    if (value) {
      res.status(200).send(value);
    } else {
      res.status(413).send('Requested line beyond length of file.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}

app.get('/lines/:line', getLine);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

function processFile() {
  console.log('Processing data file...');
  let store = {};
  let line;
  let lineNumber = 1;

  while ((line = lines.next())) {
    store[lineNumber] = line.toString('ascii');
    lineNumber++;
  }

  return store;
}
