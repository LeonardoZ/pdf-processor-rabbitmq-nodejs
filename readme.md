# node-rabbitmq-pdf-processing

This project is as proof-of-concept.

PDF processor that extracts PDF metadata and stores into DB. Made using RabbitMQ as bg job queue, NodeJS + Express for Web API, MongoDB as Database, all running with Docker.

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

## Flow

1. Send pdf to API `/jobs/pdf`
2. PDF is saved to `q-pdf-validate-file` on RabbitMQ
3. Worker process `q-pdf-validate-file`; if everything is ok, than send message to `q-pdf-parse`, otherwise, send to DLQ
4. Worker process `q-pdf-parse` and saves data to MongoDb
5. Read saved data from `/pdf-data` API's endpoint