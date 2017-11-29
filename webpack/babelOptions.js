module.exports = {
  "babelrc": false,
  "presets": [
    ["env", {
      "targets": {"browsers": "> 5%", "uglify": true}, "loose": true, "modules": false, "forceAllTransforms": true
    }],
    "react", "flow"
  ],
  "plugins": [
    "transform-decorators-legacy",
    ["flow-runtime", {"annotate": false, "assert": false}],
    "transform-class-properties",
    "transform-object-rest-spread",
    "transform-async-generator-functions"
  ],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
