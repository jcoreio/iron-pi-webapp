// @flow
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

const {exec} = require('./promake')

async function getCommitHash() /* : Promise<string> */ {
  return (await exec(`git rev-parse HEAD`)).stdout.toString('utf8').trim()
}

module.exports = getCommitHash

