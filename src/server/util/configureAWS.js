// @flow

import AWS from 'aws-sdk'
import requireEnv from '../../universal/util/requireEnv'

export default function configureAWS() {
  AWS.config.update({
    region: requireEnv('AWS_REGION')
  })
}
