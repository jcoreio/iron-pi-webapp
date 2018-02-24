export default function parseChannelFormValues(channel) {
  const {id, config, metadataItem, ...rest} = channel
  const result = {id: parseInt(id), config: {...config}, ...rest}

  if (typeof result.config.precision !== 'number') delete result.config.precision
  if (typeof result.config.min !== 'number') delete result.config.min
  if (typeof result.config.max !== 'number') delete result.config.max

  switch (config.mode) {
  case 'ANALOG_INPUT': {
    const {tag, name, units, min, max, storagePrecision, displayPrecision} = metadataItem
    result.metadataItem = {tag, name, dataType: 'number', units, min, max, storagePrecision, displayPrecision}
    break
  }
  case 'DIGITAL_INPUT':
  case 'DIGITAL_OUTPUT': {
    const {tag, name} = metadataItem
    result.metadataItem = {tag, name, dataType: 'number', isDigital: true}
    break
  }
  case 'DISABLED': {
    result.tag = null
    if (metadataItem) result.config.name = metadataItem.name
    break
  }
  }

  return result
}

