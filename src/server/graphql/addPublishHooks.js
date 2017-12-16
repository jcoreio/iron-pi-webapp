// @flow

import sequelize from '../sequelize'
import publishSequelize from './publishSequelize'

const {models} = sequelize

for (let key in models) {
  const model = models[key]
  publishSequelize(model)
}

