// @flow

export const LOGIN = 'login'
export const LOGOUT = 'logout'

export type LoginAction = {
  type: string,
  payload: {password: string},
}

export function login(payload: {password: string}): LoginAction {
  return {
    type: LOGIN,
    payload,
  }
}

export type LogoutAction = {
  type: string,
  error?: true,
  payload?: {error?: string},
}

export function logout(payload?: {error?: string}): LogoutAction {
  const result: LogoutAction = {
    type: LOGOUT,
    payload,
  }
  if (payload && payload.error) result.error = true
  return result
}

