# iron-pi-webapp

Web application for the jcore.io Iron Pi device

* Runtime
    * [Node 8](https://nodejs.org/)
    * [Express](https://expressjs.com/) - server request routing
    * [React](https://reactjs.org/) - view rendering
    * [React Router](https://reacttraining.com/react-router/)
    * [JSS](http://cssinjs.org/) - CSS styling
    * [Redux](https://redux.js.org/) - state management
    * [Immutable.js](https://facebook.github.io/immutable-js/) - state models
    * [`redux-features`](https://github.com/jcoreio/redux-features)
    * [Sequelize](http://docs.sequelizejs.com/) - ORM
    * [flow-runtime](https://codemix.github.io/flow-runtime/) - runtime type validation
    * [GraphQL](http://graphql.org/) - API query language
    * [Apollo](https://www.apollographql.com) - data transport middleware
* Services
    * [Postgres](https://www.postgresql.org/)
* Build tools
    * [Yarn](https://yarnpkg.com/)
    * [Promake](https://github.com/jcoreio/promake)
    * [Babel](https://babeljs.io/)
    * [Webpack](https://webpack.js.org/)
* Code quality tools
    * [Flow](https://flow.org/) - type checking
    * [Eslint](https://eslint.org/) - code style
* Test tools
    * [Mocha](https://mochajs.org/) - test definition
    * [Chai](http://chaijs.com/) - assertions
    * [Istanbul](https://istanbul.js.org/) - code coverage
    * [Enzyme](http://airbnb.io/enzyme/) - React unit testing
    * [Webdriver.io](http://webdriver.io/) - selenium testing

## Cloning this project

Run the following:
```js
git clone https://github.com/jcoreio/iron-pi-webapp yourproject
cd yourproject
yarn
./run bootstrap
```

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

## Flashing the Iron Pi

These instructions mirror the generic [Raspberry Pi Compute Module Flashing Instructions](https://www.raspberrypi.org/documentation/hardware/computemodule/cm-emmc-flashing.md).

#### Put the Iron Pi in flashing mode

- Power down the Iron Pi
- Connect the Iron Pi's `CPU` micro-USB to the USB port on another computer or another Raspberry Pi-based device
- While the other computer is powered on, power on the Iron Pi. When it detects that the micro-usb is connected on 
boot, it enters flashing mode instead of attempting to boot up.

#### Install and run `usbboot`:

The `usbboot` utility sends instructions via USB that make the Iron Pi's flash act
like a USB removable storage device.

These steps require `git`, `gcc` or a similar compiler, and `make`.
On a debian-based Linux system, you can install these tools by typing
`sudo apt install git build-essential`.

```sh
git clone https://github.com/raspberrypi/usbboot.git
cd usbboot
./configure
make
sudo ./rpiboot
``` 

##### Installing `libusb` on Mac OS

To build `usbboot` on Mac OS, you may need to download and install [libusb](https://sourceforge.net/projects/libusb/files/latest/download):

```sh
cd libusb
./configure
make
make install
```

#### Locate the remote storage device

On Mac OS:

```sh
$ diskutil list
/dev/disk0 (internal, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:      GUID_partition_scheme                        *1.0 TB     disk0
   1:                        EFI EFI                     209.7 MB   disk0s1
   2:                 Apple_APFS Container disk1         1.0 TB     disk0s2
/dev/disk1 (external, physical):
   #:                       TYPE NAME                    SIZE       IDENTIFIER
   0:                                                   *3.9 GB     disk1
```

In this case, the Iron Pi is at `/dev/disk1`, and the computer's built-in hard drive is at `/dev/disk0`.

#### Load the flash

On Mac OS:

Ensure that the disk is not mounted:

```sh
$ sudo diskutil umountDisk /dev/disk1
Password:
Unmount of all volumes on disk1 was successful
```

Copy the OS image to the Iron Pi:

```sh
$ sudo dd bs=4m if=os-image.img of=/dev/rdisk1
```

## Loading the Iron Pi software on a stock Raspbian image

You can flash the Iron Pi with a stock Raspbian OS, and then load the Iron Pi software on that OS.

#### Enabling SSH

SSH is disabled by default in Raspbian. To enable it:

- On Mac OS, the Pi's `/boot` partition should now be accessible in Finder. In Linux, the Pi's 
  `/boot` and root partitions may be mounted under `/media`. 
- If the Iron Pi's `boot` partition did not automatically mount to your flashing computer, power cycle the Iron Pi 
  while keeping its `CPU` micro USB connected to the flashing computer, and then re-run `sudo ./rpiboot`
  from the directory where you installed `usbboot`.
- In the `/boot` directory mounted from the Iron Pi, create an empty file titled `ssh` (with no extension on the name).
  On Mac OS, run `cd /Volumes/boot` and then `touch ssh`.
- Disconnect the USB cable from the Iron Pi's `CPU` micro USB connector and power cycle the Iron Pi

#### Finding your Iron Pi on the network

- Connect your Iron Pi's Ethernet to a network with Internet access and DHCP support
- [Use your router's web console, nmap, or another method to find the Iron Pi's IP address](https://www.raspberrypi.org/documentation/remote-access/ip-address.md)
- Connect to the Iron Pi. If your Iron Pi has an address of 192.168.1.66, `ssh -l pi 192.168.1.66` should connect you via SSH
- The default SSH password is `raspberry`
