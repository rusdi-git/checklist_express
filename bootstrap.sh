#!/bin/sh

docker-compose --project-name checklist-express --file docker/docker-compose.yaml up --build -d

cp .env.example .env

npm install

node src/helper/seed

npm start