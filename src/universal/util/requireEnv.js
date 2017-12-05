// @flow
/* eslint-env node */
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

function requireEnv(varname /* : string*/, env /* : {[name: string]: ?string} */ = process.env)/* : string */ {
  const value = env[varname]
  if (!value) throw new Error(`missing process.env.${varname}`)
  return value
}

module.exports = requireEnv

