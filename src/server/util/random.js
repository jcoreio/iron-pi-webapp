// @flow

import crypto from 'crypto'

import promisify from 'es6-promisify'

const RANDOM_ID_LENGTH_BYTES = 12 // Use 12 byte random IDs, like MongoDB does
export const TOKEN_LENGTH_BYTES = 32 // 32 bytes binary = 43 characters of base64

const randomBytesPromise: (length: number) => Promise<Buffer> = promisify(crypto.randomBytes)

export async function randomString(length: number): Promise<string> {
  const bytes: Buffer = await randomBytesPromise(length)
  return bytes.toString('base64')
}

export async function randomId(): Promise<string> {
  return await randomString(RANDOM_ID_LENGTH_BYTES)
}

export async function randomToken(): Promise<string> {
  return await randomString(TOKEN_LENGTH_BYTES)
}
