// @flow

import superagent from 'superagent'

export default async function verifyToken(): Promise<void> {
  const token = localStorage.getItem('token')
  if (!token) return
  await superagent.get('/verifyToken').set('authorization', `Bearer ${token}`)
}

