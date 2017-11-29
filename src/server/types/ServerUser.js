/*
 * @flow
 * User type, as seen by server-side code. When sending user info to the client,
 * we don't send usernameLower, bcryptPassword, or roles.
 */

import type {UserInit, User} from '../../universal/types/User'

export type ServerUserInit = UserInit & {
  usernameLower: string,
  bcryptPassword: string,
  roles: Array<string>,
}

export type ServerUser = User & ServerUserInit & {
  disabled: boolean,
  failedLogins: number,
}

