// @flow

import type Sequelize from 'sequelize'
import models from '../models'

export default function createModels(sequelize: Sequelize) {
  for (let name in models) {
    const model = models[name]
    if (typeof model.initAttributes === 'function') model.initAttributes({sequelize})
  }
  for (let name in models) {
    const model = models[name]
    if (typeof model.initAssociations === 'function') model.initAssociations()
  }
}

