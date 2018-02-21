// @flow

import * as React from 'react'
import type {Feature} from '../Feature'

const calibrationFormFeature: Feature = {
  load: async () => {
    return {
      ...calibrationFormFeature,
      CalibrationFormContainer: (await import('../CalibrationForm/CalibrationFormContainer')).default,
    }
  }
}

export default calibrationFormFeature

