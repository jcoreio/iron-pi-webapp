# iron-pi-webapp

## Setup

* Install [node.js](https://nodejs.org/en/) version 8.  You may want to use [nvm](https://github.com/creationix/nvm) or
[nvm-windows](https://github.com/coreybutler/nvm-windows) to easily switch between versions of Node.
* Install [Docker](https://www.docker.com/), which allows you to run development instances of MySQL, Redis, and DynamoDB.
* Log into `npm` via command line (so that you can install our private packages):
```
npm login
```
* Install `yarn` if you haven't already:
```
npm i -g yarn
```
* Install dependencies with `yarn`:
```
yarn
```

## Build script

All build and launch scripts in this project are implemented with
[Promake](https://github.com/jcoreio/promake) in the `run` file.  To see
a list of available tasks, run it without arguments:
```
./run
```

## Running Dev mode

Run the backend in one console:
```
./run dev:server
```

Run webpack in another:
```
./run dev:client
```

Open the webapp at [http://localhost:4000](http://localhost:4000).

You may want some other dev tools in Chrome:
* [React dev tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
* [Redux dev tools](https://github.com/zalmoxisus/redux-devtools-extension) (last I tried Redux dev tools they were too slow for high action throughput, but maybe they've improved)
* [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)

Dev mode includes hot reloading, faster builds, [redux-logger](https://github.com/evgenyrodionov/redux-logger), and non-minified React errors.
The webpack dev server runs on port 4000 and proxies to the main app server running on port 3000.

You'll probably also want to have `flow` and `eslint` checking your code in the background as you develop; to do that
pop open two terminals and run `./run flow:watch` in one and `./run lint:watch` in the other.
You can run `./run lint:fix` to have `eslint` auto-fix most pesky formatting errors.

## Running Prod mode

Run the backend in one console:
```
./run prod:server
```

Run webpack in another:
```
./run prod:client
```

Open the webapp at [http://localhost:4000](http://localhost:4000).

## Running Docker build

```
./run build:docker docker
```

Open the webapp at [http://localhost:4000](http://localhost:4000).

## Debugging the backend

Run the backend with `node --inspect`:
```
node --inspect ./run dev:server
```
or
```
node --inspect ./run prod:server
```
etc.

Open `chrome://inspect` in Google Chrome, and click the link for your node VM to open the console.

## Testing

To run all tests, run:
```
./run test
```

Or you may run individual categories of tests:

#### Unit tests
```
./run test:unit
```

These are standalone and are located in either:
* `src/**/__tests__/*.js`
* `test/unit/**/*.js`

#### Selenium tests
```
./run test:selenium
```

These test against a running webapp.  The `ROOT_URL` environment
variable controls the server to test against.  The default is in
`env/test.js`.

#### Running webapp in test mode
To get full code coverage, the client and server must be running in test
mode.   You can launch the webapp in test mode by running the `env:test`
task before the task(s) that launch the webapp:
```
./run env:test dev:server
./run env:test dev:client
./run env:test prod:server
./run env:test prod:client
```

`env:test` also defaults to different databases.

#### Watch mode
Add `:watch` at the end of a task to run in watch mode:
```
./run test:watch
./run test:unit:watch
./run test:selenium:watch
```

#### Code coverage mode
You can run the test with `nyc` code coverage by replacing `test` with
`coverage` (`:watch` isn't available in this mode):
```
./run coverage
./run coverage:unit
./run coverage:selenium
```

To get full coverage, the client and server must be running in [test
mode](#running-webapp-in-test-mode).

