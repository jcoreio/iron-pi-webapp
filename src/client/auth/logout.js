// @flow

export default function logout() {
  localStorage.removeItem('token')
  if (__CLIENT__) require('../apollo/client').default.resetStore()
}

