#!/bin/bash

echo "Data file specified for line-server: $1"
echo "Starting server..."

node index.js $1
