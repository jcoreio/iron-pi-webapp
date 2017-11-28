// @flow
/* eslint-env node */

function requireEnv(varname: string): string {
  const value = process.env[varname]
  if (!value) throw new Error(`missing process.env.${varname}`)
  return value
}

module.exports = requireEnv

