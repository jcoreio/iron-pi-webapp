// @flow

import type Sequelize from 'sequelize'

export type Context = {
  userId: ?number,
  scopes: ?Array<string>,
  sequelize: Sequelize,
}

