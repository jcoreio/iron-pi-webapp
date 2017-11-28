// @flow

import type {User} from '../types/User'

export type LoginToken = {
  expireAt: Date,
  token: string
}

export type PasswordLoginRequest = {
  username: string,
  password: string
}

export type LoginResponse = {
  token: LoginToken,
  user: User
}
