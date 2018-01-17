export default function parseChannelFormValues(channel) {
  const {config, ...rest} = channel
  const result = {config: {...config}, ...rest}

  if (typeof result.config.precision !== 'number') delete result.config.precision
  if (typeof result.config.min !== 'number') delete result.config.min
  if (typeof result.config.max !== 'number') delete result.config.max

  return result
}

