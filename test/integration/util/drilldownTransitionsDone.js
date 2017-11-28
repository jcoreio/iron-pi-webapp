// wait for react-router-drilldown transitions to finish.  Otherwise we may not get an "element not clickable at point"
// since it's in motion
export default function drilldownTransitionsDone(wait: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, wait))
}

