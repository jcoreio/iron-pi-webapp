module.exports = {
  "babelrc": false,
  "presets": [
    ["env", {
      "targets": {"browsers": require('../package.json').browserslist, "uglify": true}, "loose": true, "modules": false,
    }],
    "react", "flow"
  ],
  "plugins": [
    "transform-class-properties",
    "transform-object-rest-spread",
    "transform-async-generator-functions",
    "syntax-dynamic-import",
    'transform-decorators-legacy',
    ['flow-runtime', {assert: false, annotate: true, optInOnly: true}],
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
