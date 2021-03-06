// @flow

import path from 'path'
import chokidar from 'chokidar'
import debounce from 'lodash.debounce'
// $FlowFixMe
import _module from 'module'
import watchMigrations from 'umzug-beobachten'

type Options = {
  srcDir: string,
  main?: string,
  migrationsDir?: string,
}

function runServerWithHotRestarting(options: Options): Promise<void> {
  const {srcDir} = options
  const serverDir = path.join(srcDir, 'server')
  const serverModule = options.main || path.resolve(serverDir, 'Server.js')
  const migrationsDir = options.migrationsDir || path.resolve(serverDir, 'sequelize', 'migrations')

  // Do "hot-reloading" of express stuff on the server
  // Throw away cached modules and re-require next time
  // Ensure there's no important state in there!
  const watcher = chokidar.watch([
    serverDir,
    path.join(srcDir, 'universal'),
  ])

  const serverSideRender = path.join(serverDir, 'ssr/serverSideRender.js')
  const moduleRequiresRestart: {[id: string]: boolean} = {
    [serverModule]: true,
    [serverSideRender]: false,
  }

  const _load_orig = _module._load
  _module._load = function _load(name: string, parent: any, isMain: boolean): Object {
    const file = _module._resolveFilename(name, parent)
    if (file !== serverSideRender) {
      moduleRequiresRestart[file] = moduleRequiresRestart[file] || moduleRequiresRestart[parent.id] || false
    }
    return _load_orig(name, parent, isMain)
  }

  let server
  let umzugWatcher
  async function start(): Promise<void> {
    try {
      // $FlowFixMe
      const Server = require(serverModule).default
      server = new Server()
      await server.start()
      umzugWatcher = watchMigrations(server._umzug)
    } catch (error) {
      console.error(error.stack)
    }
  }

  start()

  function clearCache() {
    Object.keys(require.cache).forEach((id: string) => {
      if (id.startsWith(srcDir)) delete require.cache[id]
    })
  }

  const clearCacheSoon = debounce(clearCache, 1000)

  const restartSoon = debounce(async () => {
    try {
      await umzugWatcher.close()
      await server.stop()
      clearCache()
      await start()
    } catch (error) {
      console.error(error.stack)
    }
  }, 1000)

  return new Promise((resolve: () => void) => {
    watcher.on('ready', () => {
      watcher.on('all', async (type: any, file: string) => {
        if (path.dirname(file) === migrationsDir) {
          return
        }
        if (moduleRequiresRestart[file]) {
          console.log(`${path.relative(srcDir, file)} changed, restarting...`) // eslint-disable-line no-console
          restartSoon()
        } else if (moduleRequiresRestart[file] === false) {
          console.log(`${path.relative(srcDir, file)} changed, clearing module cache...`) // eslint-disable-line no-console
          clearCacheSoon()
        }
      })
      resolve()
    })
  })
}

module.exports = runServerWithHotRestarting
