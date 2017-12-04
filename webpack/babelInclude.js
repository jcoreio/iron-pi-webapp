const path = require('path')

function moduleDir(name) {
  return path.dirname(require.resolve(`${name}/package.json`))
}

const root = path.resolve(__dirname, '..')
const srcDir = path.resolve(root, 'src')
module.exports = [
  srcDir,
  moduleDir('p-timeout'),
  moduleDir('p-finally'),
]

