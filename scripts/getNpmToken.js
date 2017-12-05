// @flow
/* eslint-disable flowtype/require-return-type, flowtype/require-parameter-type */

async function getNpmToken(env /* : {[name: string]: ?string} */ = process.env)/* : Promise<string> */ {
  const {NPM_TOKEN} = env
  if (NPM_TOKEN) return NPM_TOKEN
  try {
    const npmrc = await require('fs-extra').readFile(`${require('os').homedir()}/.npmrc`)
    const match = /:_authToken=([a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12})/.exec(npmrc)
    if (match) return match[1]
  } catch (error) {
    // ignore
  }
  throw new Error("Missing process.env.NPM_TOKEN or entry in ~/.npmrc")
}

module.exports = getNpmToken

