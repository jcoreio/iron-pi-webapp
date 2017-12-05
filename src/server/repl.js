/* eslint-disable no-console */

import repl from 'repl'
import vm from 'vm'
import replify from 'replify'
import requireEnv from "../universal/util/requireEnv"
import sequelize from './sequelize'

const DB_NAME = requireEnv('DB_NAME')

const replServer = replify({
  name: DB_NAME,
  contexts: {
    sequelize,
  },
  start: options => repl.start({
    ...options,
    async eval(code: string, context: any, filename: string, callback: (error: ?Error, result?: any) => void): Promise<void> {
      code = code.trim()
      if (!code) return undefined
      const _context = vm.createContext(context)

      let result, err
      try {
        result = vm.runInContext(code, _context)
        if (result && result.then instanceof Function) result = await result
      } catch (e) {
        err = e
      }

      callback(err, result)
    }
  })
})

module.exports = replServer


/* eslint-disable no-console */

console.log("*** to connect to REPL, run:")
console.log("***   ./run repl")
console.log("*** OR:")
console.log("*** make sure you have repl-client installed (npm i -g repl-client)")
console.log("*** then run:")
console.log(`***   rc /tmp/repl/${DB_NAME}.sock`)

