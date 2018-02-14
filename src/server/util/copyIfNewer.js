// @flow

import fs from 'fs-extra'

export default async function copyIfNewer(src: string, dest: string): Promise<void> {
  const srcMtime = (await fs.stat(src)).mtime
  let destMtime
  try {
    destMtime = (await fs.stat(dest)).mtime
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
  if (destMtime == null || destMtime < srcMtime) {
    await fs.copy(src, dest)
  }
}

