// @flow

import superagent from 'superagent'

type Options = {
  password: string,
}

export default async function login({password}: Options): Promise<void> {
  const {body: {token, error}} = await superagent.post('/login')
    .type('json')
    .accept('json')
    .send({username: 'root', password})
    .catch(({response}) => response)

  if (error) {
    throw new Error(error)
  } else if (token) {
    localStorage.setItem('token', token)
    if (__CLIENT__) require('../apollo/client').default.resetStore()
  }
}
