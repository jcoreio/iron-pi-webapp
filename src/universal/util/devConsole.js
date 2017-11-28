// @flow

let global: any = new Function("return this;")()

let consoleBase: Object = global.console

while (consoleBase && !consoleBase.hasOwnProperty('log')) {
  consoleBase = Object.getPrototypeOf(consoleBase)
}

let devConsole: Object = global.console

if (consoleBase) {
  devConsole = Object.create(global.console)
  for (var method in consoleBase) {
    if (consoleBase[method] instanceof Function) {
      //if ('production' === process.env.NODE_ENV) {
      //  devConsole[method] = function() {};
      //}
      //else {
      devConsole[method] = global.console[method].bind(console)
      //}
    }
  }
}

devConsole.errorWithStack = function (error: any) {
  if (error instanceof Error) {
    devConsole.error(error.stack)
  }
  devConsole.error(error)
}

export default devConsole
