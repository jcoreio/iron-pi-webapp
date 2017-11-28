'use strict'

module.exports = {
  'process.env.NODE_ENV': process.env.NODE_ENV || '',
  'process.env.BABEL_ENV': process.env.BABEL_ENV || '',
  'process.env.TARGET': process.env.TARGET || '',
  '__CLIENT__': false,
  '__SERVER__': true,
}

