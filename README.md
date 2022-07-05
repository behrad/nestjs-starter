# Backend

Nestjs backend starter kit with authentication

## Installation

```bash
$ npm install
```

## Running the app

We can run the project with or without docker.

### Local

To run the server without Docker we need this pre-requisite:

- Mongo server running
- Redis server running

Rename `.sample.env` to `.env` and edit it as your needs to configure the app.

Commands

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Docker

```bash
# build image
$ docker build -t backend-api .

# run container from image
$ docker run -p 3000:3000 --volume 'pwd':/usr/src/app --network --env-file .env backend-api

# run using docker compose
$ docker-compose up
```

You can check out [http://localhost:3000/docs](http://localhost:3000/docs) for available APIs

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Contribution Guideline

1.  Clone the Project

        `git clone https://github.com/Fair-Trade-Fares-Ltd/FTF_Backend-API.git`

    - make sure you have `node >= 14` installed
    - run `npm i` to install dependencies
    - use docker compose to run dependencies
    - enable eslint/prettier in your IDE

2.  Create your Feature Branch

        `git checkout -b feature/(task|scope)/AmazingFeature`

3.  Commit your Changes

        `git commit -m 'feat(task|scope): Add some AmazingFeature'`

    Make sure you obey to [commitlint](https://github.com/conventional-changelog/commitlint/#what-is-commitlint) commit message conventions

    ```bash
    type(scope?): subject
    body?
    footer?
    ```

    `type` must be one of `[build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test]`

4.  Push to the Branch
    `git push origin feature/(task|scope)/AmazingFeature`
5.  Open a Pull Request
