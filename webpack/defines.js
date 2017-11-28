const defines = {};
[
  'TARGET',
  'BABEL_ENV',
  'LOG_REDUX_ACTIONS',
  'NODE_ENV',
].forEach(name => defines[`process.env${name}`] = JSON.stringify(process.env[name]))

module.exports = defines

