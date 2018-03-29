import {pickMetadataItemFields} from '../../components/MetadataItemFields'

export default function parseChannelFormValues(channel) {
  const {id, config, metadataItem, ...rest} = channel
  const result = {id: parseInt(id), config: {...config}, ...rest}

  if (typeof result.config.precision !== 'number') delete result.config.precision
  if (typeof result.config.min !== 'number') delete result.config.min
  if (typeof result.config.max !== 'number') delete result.config.max

  result.metadataItem = pickMetadataItemFields(metadataItem)

  switch (config.mode) {
  case 'ANALOG_INPUT': {
    result.metadataItem.dataType = 'number'
    delete result.metadataItem.isDigital
    break
  }
  case 'DIGITAL_INPUT':
  case 'DIGITAL_OUTPUT': {
    result.metadataItem.dataType = 'number'
    result.metadataItem.isDigital = true
    break
  }
  case 'DISABLED': {
    if (metadataItem) result.config.name = metadataItem.name
    break
  }
  }

  return result
}

