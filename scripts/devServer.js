// @flow

const express = require('express')
const requireEnv = require('@jcoreio/require-env')

const webpackConfig = require('../webpack/webpack.config.dev')

const BACKEND_PORT = requireEnv('BACKEND_PORT')

const app = express()

const compiler = require('webpack')(webpackConfig)
app.use(require('webpack-dev-middleware')(compiler, webpackConfig.devServer || {}))
app.use(require('webpack-hot-middleware')(compiler))

const proxy = require('http-proxy').createProxyServer()
// istanbul ignore next
proxy.on('error', (err: Error): any => console.error(err.stack))

const target = `http://localhost:${BACKEND_PORT}`

app.all('*', (req: Object, res: Object): any => proxy.web(req, res, { target }))

const server = app.listen(webpackConfig.devServer.port)

server.on('upgrade', (req: Object, socket: any, head: any): any => proxy.ws(req, socket, head, { target }))

console.log(`Dev server is listening on http://0.0.0.0:${webpackConfig.devServer.port}`)

