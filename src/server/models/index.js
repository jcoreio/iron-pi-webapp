// @flow

import path from 'path'
import glob from 'glob'
import Sequelize from 'sequelize'

const files = glob.sync(path.join(__dirname, '*.js'))
const models: {[name: string]: Class<Sequelize.Model<any>>} = {}
for (let file of files) {
  if (file !== __filename) {
    // $FlowFixMe
    const model = require(file).default
    if (model && model.prototype instanceof Sequelize.Model) models[model.name] = model
  }
}

export default models

