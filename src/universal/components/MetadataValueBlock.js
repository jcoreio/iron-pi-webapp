// @flow

import * as React from 'react'

import ValueBlock from './ValueBlock'

export type Props = {
  value?: any,
  showUnits?: boolean,
  metadataItem?: {
    units?: string,
    dataType: string,
    isDigital?: boolean,
    displayPrecision: number,
  },
}

const MetadataValueBlock = ({value, metadataItem, showUnits, ...props}: Props): React.Node => {
  const isAnalog = metadataItem && metadataItem.dataType === 'number' && !metadataItem.isDigital
  return (
    <ValueBlock
      {...props}
      value={value}
      precision={metadataItem && isAnalog ? metadataItem.displayPrecision : 0}
      units={showUnits !== false && metadataItem && isAnalog ? metadataItem.units : null}
    />
  )
}

export default MetadataValueBlock

