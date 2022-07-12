#!/bin/bash

echo "Executing npm install to setup environment..."
npm install

# echo "Pulling Redis image from Docker Hub..."
# docker pull redis

# echo "Running Redis container on port 6379, container name: line-reader-redis"
# docker run --name line-reader-redis -p 6379:6379 -d redis