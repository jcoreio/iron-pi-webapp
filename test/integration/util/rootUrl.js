import requireEnv from '../../../src/universal/util/requireEnv'

export default function rootUrl() {
  return requireEnv('ROOT_URL')
}

