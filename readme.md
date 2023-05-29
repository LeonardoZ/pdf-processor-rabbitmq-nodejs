# node-rabbitmq-pdf-processing

This project is as proof-of-concept.

PDF processor that extracts PDF metadata and stores into DB. Made using RabbitMQ as bg job queue, NodeJS + Express for Web API, MariaDB as Database, all running with Docker.

## Instructions

Setup env variables. Copy `.env.example` and rename to `.env`, than set the values.

> Start App
```
docker-compose up
```

> Stop App
```
docker-compose down
```