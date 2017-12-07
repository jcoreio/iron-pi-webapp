const Promake = require('promake')
const {envRule} = require('promake-env')

const base = new Promake()

module.exports = Object.create(base, {
  spawn: {
    value: (command, args, options) => {
      if (!Array.isArray(args)) {
        options = args
        args = []
      }
      if (!args) args = []
      if (!options) options = {}
      return base.spawn(command, args, {
        stdio: 'inherit',
        ...options,
      })
    },
  },
  envRule: {
    value: envRule(base.rule),
  },
})

