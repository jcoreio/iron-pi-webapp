import {createMuiTheme} from 'material-ui/styles'

const theme = createMuiTheme({
  jcorePrimaryColor: '#FDB109',
  sidebar: {
    width: 240,
    padding: {
      horizontal: 22,
      vertical: 10,
    },
    transition: 'left ease 250ms',
    backgroundColor: '#333E47',
    foregroundColor: '#D3D3D3',
    autoOpenBreakpoint: (): number => theme.breakpoints.values.md,
    isAutoOpen: (viewportWidth: number): boolean => viewportWidth >= theme.sidebar.autoOpenBreakpoint(),
  },
  typography: {
    fontFamily: '"Helvetica", "Arial", sans-serif',
  },
})
export default theme

