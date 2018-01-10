export default function parseChannelFormValues(channel) {
  const {config: {precision, min, max, controlLogic, ...restConfig}, ...rest} = channel
  const result = {
    ...rest,
    config: {
      ...restConfig,
      precision: parseInt(precision),
      min: Number(min),
      max: Number(max),
    }
  }
  if (controlLogic) result.config.controlLogic = controlLogic.map(({threshold, ...condition}) => ({
    ...condition,
    threshold: Number(threshold),
  }))
  return result
}

