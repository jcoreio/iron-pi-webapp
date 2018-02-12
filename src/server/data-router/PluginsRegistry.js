// @flow

import assert from 'assert'
import type {DataPlugin, CreatePluginFunction, CreatePluginArgs} from './PluginTypes'
import type {PluginConfig} from '../../universal/data-router/PluginConfigTypes'

const plugins: Map<string, CreatePluginFunction> = new Map()

export function registerPluginType(pluginType: string, createPluginFunction: CreatePluginFunction) {
  plugins.set(pluginType, createPluginFunction)
}

/**
 * Creates a plugin instance from a JSON config
 * @param args plugin config and plugin resources
 * @throw Error if plugin type is not registered, or the registered CreatePluginFunction for the
 * plugin type throws an Error
 */
export function createPluginInstance(args: CreatePluginArgs): DataPlugin {
  const config: PluginConfig = args.config
  assert(config)
  const pluginType: string = config.pluginType
  if (!pluginType || typeof pluginType !== 'string')
    throw Error(`config.pluginType must be a non-empty string`)

  const createPluginFunction: ?CreatePluginFunction = plugins.get(pluginType)
  if (!createPluginFunction)
    throw Error(`plugin type is not registered: ${pluginType}`)
  const plugin: DataPlugin = createPluginFunction(args)
  // This should not happen because createPluginFunction should throw an Error if there's a problem
  if (!plugin)
    throw Error(`create function for plugin type ${pluginType} returned a null value`)
  return plugin
}
