// @flow

import type Sequelize from 'sequelize'

import glob from 'glob'
import path from 'path'

export default function createModels(sequelize: Sequelize) {
  const files = glob.sync(path.join(__dirname, '..', 'models', '*.js'))
  files.forEach((file: string) => {
    // $FlowFixMe
    const model = require(file).default
    if (model && model.initAttributes) model.initAttributes({sequelize})
  })
  files.forEach((file: string) => {
    // $FlowFixMe
    const model = require(file).default
    if (model && model.initAssociations) model.initAssociations()
  })
}

