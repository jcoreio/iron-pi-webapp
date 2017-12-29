import {Collector} from 'istanbul'

// istanbul ignore next
function mergeCoverage(coverage) {
  const collector = new Collector()
  if (global.__coverage__) collector.add(global.__coverage__)
  collector.add(coverage)
  global.__coverage__ = collector.getFinalCoverage()
}

export default mergeCoverage
