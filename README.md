# Job Scheduler System

A backend system built with NestJS, TypeScript, and RabbitMQ that allows scheduling jobs/tasks to run at specific times and/or repeatedly at regular intervals.

## Features

- **Multiple Schedule Types**:
  - **Hourly**: Configure which minute of the hour the job should run
  - **Daily**: Configure a specific time of the day for the job to run
  - **Weekly**: Configure a specific day of the week and time for the job to run

- **Event-Driven Architecture**: Uses RabbitMQ for message passing between services
- **RESTful API**: Simple API for creating, listing, and deleting scheduled jobs
- **Persistent Job Output**: Job execution outputs are logged to both console and file

## Prerequisites

- Node.js (v16+)
- npm or yarn
- RabbitMQ server running locally or accessible via network

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Documentation

Swagger documentation is available at `/api` when the application is running.

### Create a Job

```bash
POST /scheduler/jobs
```

Request body:

```json
{
  "name": "My Hourly Job",
  "type": "hourly",
  "config": {
    "minute": 30
  },
  "payload": {
    "data": "example"
  }
}
```

Supported job types:
- `hourly`: Runs every hour at the specified minute
- `daily`: Runs every day at the specified hour and minute
- `weekly`: Runs every week on the specified day, hour, and minute

### List All Jobs

```bash
GET /scheduler/jobs
```

### Get Job Details

```bash
GET /scheduler/jobs/:id
```

### Delete a Job

```bash
DELETE /scheduler/jobs/:id
```

### View Job Execution History

```bash
GET /jobs/executions
```

Optional query parameter: `jobId` to filter by specific job

### View Specific Job Execution

```bash
GET /jobs/executions/:id
```

## Architecture

The system consists of two main modules:

1. **Scheduler Module**: Handles job creation, scheduling, and management
2. **Jobs Module**: Handles job execution and output logging

Communication between modules is done via NestJS Event Emitter.

### Database Schema

## License

MIT