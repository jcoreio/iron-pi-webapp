# pasonpower webapp
[![](https://ci.solanolabs.com:443/pasonpower/webapp/badges/branches/master?badge_token=9956bddb29ac85b70a78853717c4769148fcf809)](https://ci.solanolabs.com:443/pasonpower/webapp/suites/572962)

## Quick start

* Install [node.js](https://nodejs.org/en/) version 6.9.x.  You may want to use [nvm](https://github.com/creationix/nvm) or
[nvm-windows](https://github.com/coreybutler/nvm-windows) to easily switch between versions of Node.
* Install [Docker](https://www.docker.com/), which allows you to run development instances of MySQL, Redis, and DynamoDB.
* Log into `npm` via command line (so that you can install our private packages):
```
npm login
```
* Install dependencies with `npm`:
```
npm install
```

* Start development databases:
```
npm run db:start
```

* Start the app:
```
npm start
```

* Open [http://localhost:4000](http://localhost:4000) in your browser.

## Running

### Dev mode

```
npm start
```

Development mode is accessible at [http://localhost:4000](http://localhost:4000). It runs a webpack dev server on port 4000 and proxies to
the main server.

You will want some other dev tools in Chrome:
* [React dev tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en)
* [Redux dev tools](https://github.com/zalmoxisus/redux-devtools-extension) (last I tried Redux dev tools they were too slow for high action throughput, but maybe they've improved)
* [Immutable.js Object Formatter](https://chrome.google.com/webstore/detail/immutablejs-object-format/hgldghadipiblonfkkicmgcbbijnpeog)

Dev mode includes hot reloading, faster builds, [redux-logger](https://github.com/evgenyrodionov/redux-logger), and non-minified React errors.
The webpack dev server runs on port 4000 and proxies to the main app server running on port 3000.

You'll probably also want to have `flow` and `eslint` checking your code in the background as you develop; to do that
pop open two terminals and run `npm run flow:watch` in one and `npm run lint:watch` in the other.
You can run `npm run lint:fix` to have `eslint` auto-fix most pesky formatting errors.

### Dev Debug mode
```
npm run debug
```
or to break at the beginning of the app code:
```
npm run debug-brk
```
And then go to the usual `node-inspector` URL, which will be printed in the console.

### Prod mode
```
npm run prod
```
And open [http://localhost:3000](http://localhost:3000) in your browser.

Prod mode builds everything for production.  It watches your files and rebuilds whenever anything changes, though it
doesn't rebuild as quickly as dev mode.

To disable minification, run with the `--no-uglify` flag.

### Prod Debug mode
```
npm run prod:debug
```
or to break at the beginning of the app code:
```
npm run prod:debug-brk
```
And then go to the usual `node-inspector` URL, which will be printed in the console.

### Build

```
npm run build
```

Everything is output to the `build` directory.
`npm run prod` builds the same things, but in watch mode.

### Docker build

```
npm run build:docker
```

## Testing
To run the integration tests you will need [selenium](http://www.seleniumhq.org/download/) and
[selenium chrome driver](https://sites.google.com/a/chromium.org/chromedriver/getting-started).

Make sure you have the selenium server running before you run the tests via:
```
npm test
```

You can run the different types of tests individually:
```
npm run test:unit
npm run test:integration # selenium integration tests
npm run test:server-integration # non-selenium integration tests
```

To only run testcases containing `UserGroups`, add `-- --grep UserGroups` to one of the above commands.

The selenium integration tests will build and launch the webapp server by default.  To save time while debugging tests,
you can start the webapp in dev mode instead by running:
```
npm run test:integration:devServer
```
When this is running, the integration tests will connect to it instead of launching another webapp server.

## Debug logging

Various modules (and dependencies we've written) use the excellent `debug` package to log debug messages.  These can
be turned on by setting the `DEBUG` environment variable (e.g. `DEBUG=RedisSubscriber npm start`).  To see what logging
is available, search for references to the `debug` package in this project and its dependencies.

## Reactive Updates

Since MySQL doesn't provide any kind of subscription mechanism, we've implemented a system for using Redis to figure
out when data has changed.  We publish changes to Redis (sometimes in CollectionAdapter methods,
sometimes in sequelize hooks, but ultimately they should come from the MySQL binlog, or at least hooks only).
Note: the `individualHooks` flag in sequelize queries is important.
We inspect the result of a query and the relevant sequelize models to determine which Redis channels to subscribe to,
and whenever we receive Redis messages, we re-run the query (and update the subscriptions, which may need to change).
Theoretically, we could avoid re-running the entire query for some kinds of queries and updates, if we needed to
improve performance.

## Continuous Integration

The app is built and sometimes auto-deployed using Solano CI.

The deployment process gets credentials from Solano environment variables. To
set those variables, [Install the Solano CLI](http://docs.solanolabs.com/introduction/#use-solano-ci-from-the-cli)
and run commands patterned after the following example:

```
solano login
solano config:add org AWS_DEFAULT_REGION us-west-2 --org pasonpower
solano config:add repo DB_PASSWORD_STAGING <Password> --org pasonpower

```

CI environment variables with organization-wide scope:

* AWS_DEFAULT_REGION
* AWS_ACCOUNT_ID
* AWS_ACCESS_KEY_ID
* AWS_SECRET_ACCESS_KEY

CI environment variables with single repo scope:

* DB_PASSWORD_STAGING

## Running dev mode in AWS

The `infratester` server can be used to run the app in dev mode in AWS, where it can access real DynamoDB, MySQL, and Redis data.

- Log into the EC2 console, go to the 'infratester' security group, and add 
  inbound access permissions from your IP address to ports 22 and 4000.
- Install the pasonpower SSH access key at `~/.ssh/pasonpower.pem`.
- Add an entry for `infratester` to your /etc/hosts like the following:
```
35.160.115.218 infratester
```
- Add the following to ~/.ssh/config:
```
Host infratester
        User ubuntu
        IdentityFile ~/.ssh/pasonpower.pem
```  
- rsync project sources to the server: `scripts/awsDevModeSync.sh`
- SSH into the server: 
```
ssh infratester
cd webapp
```
- Install a .env file like the following in the project root:
```
AWS_REGION=us-west-2

DB_HOST=battman-db-staging.pasonpowerint.com
DB_USER=pasonpower
DB_PASSWORD=<Staging MySQL Password>
DB_NAME=pasonpower

DYNAMO_TABLE_PREFIX=battmanAppStaging-
DYNAMO_ENDPOINT=
PORT=3000

REDIS_HOST=battman-redis-staging.pasonpowerint.com
REDIS_PORT=6379
```
- Install NPM dependencies and start the app. Note that you may need to `npm login` for this to work.
```
rm -rf node_modules
npm i
npm start
```
- Connect with your browser to the following URL: `http://infratester:4000`


## Language and Tools

The application is written in ES6 Javascript with Flow Type annotations. 

* [ES6](https://github.com/lukehoban/es6features) 
* [Flow Type](https://flowtype.org/docs/getting-started.html#_)
* [React](https://facebook.github.io/react/docs/hello-world.html)
* [Redux](http://redux.js.org/)

## Other handy tools

* [npm-check](https://www.npmjs.com/package/npm-check) - Check for outdated, incorrect, and unused dependencies


