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

