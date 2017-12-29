import {createMuiTheme} from 'material-ui/styles'

const theme = createMuiTheme({
  jcorePrimaryColor: '#fdb109',
  sidebar: {
    width: 256,
    padding: {
      horizontal: 22,
      vertical: 10,
    },
    transition: 'left ease 250ms',
    backgroundColor: '#333e47',
    foregroundColor: '#d3d3d3',
    autoOpenBreakpoint: (): number => theme.breakpoints.values.md,
    isAutoOpen: (viewportWidth: number): boolean => viewportWidth >= theme.sidebar.autoOpenBreakpoint(),
  },
  channelState: {
    on: '#5dba54',
    off: '#d8d8d8',
    warning: '#e2a000'
  },
  typography: {
    fontFamily: '"Helvetica", "Arial", sans-serif',
  },
})
export default theme

