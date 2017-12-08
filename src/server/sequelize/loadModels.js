const glob = require('glob')
const path = require('path')

glob.sync(path.join(__dirname, '..', 'models', '*.js')).forEach(require)

