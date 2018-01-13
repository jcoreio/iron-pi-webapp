// @flow

import * as React from 'react'

const calibrationFormFeature = {
  load: async () => {
    return {
      ...calibrationFormFeature,
      CalibrationFormContainer: (await import('../CalibrationForm/CalibrationFormContainer')).default,
    }
  }
}

export default calibrationFormFeature

