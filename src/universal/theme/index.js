import {createMuiTheme} from 'material-ui/styles'

type BreakpointKey = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
type Breakpoints = {
  between: (start: BreakpointKey, end: BreakpointKey) => string,
  down: (key: BreakpointKey) => string,
  up: (key: BreakpointKey) => string,
  only: (key: BreakpointKey) => string,
  keys: Array<BreakpointKey>,
  width: (key: BreakpointKey) => number,
  values: {[key: BreakpointKey]: number},
}

type TypographyCategory = {
  color: string,
  fontFamily: string,
  fontSize: number | string,
  fontWeight: number,
  letterSpacing?: number | string,
  lineHeight: number | string,
  marginLeft?: number | string,
}

export type Theme = {
  direction: 'ltr' | 'rtl',
  breakpoints: Breakpoints,
  jcorePrimaryColor: string,
  shadows: Array<string>,
  sidebar: {
    width: number,
    padding: {
      vertical: number,
      horizontal: number,
    },
    transition: {
      timingFunction: string,
      duration: string,
    },
    transitionDuration: string,
    backgroundColor: string,
    foregroundColor: string,
    autoOpenBreakpoint: () => number,
    isAutoOpen: (viewportWidth: number) => boolean,
  },
  spacing: {
    unit: number,
  },
  channelState: {
    on: string,
    off: string,
    warning: string,
  },
  typography: {
    body1: TypographyCategory,
    body2: TypographyCategory,
    button: TypographyCategory,
    caption: TypographyCategory,
    display1: TypographyCategory,
    display2: TypographyCategory,
    display3: TypographyCategory,
    display4: TypographyCategory,
    headline: TypographyCategory,
    subheading: TypographyCategory,
    title: TypographyCategory,
    fontFamily: string,
    fontSize: number | string,
    fontWeightLight: number,
    fontWeightMedium: number,
    fontWeightRegular: number,
    pxToRem: (value: number) => string,
  },
  zIndex: {
    appBar: string,
    dialog: string,
    dialogOverlay: string,
    drawerOverlay: string,
    layer: string,
    menu: string,
    mobileStepper: string,
    navDrawer: string,
    popover: string,
    snackbar: string,
    tooltip: string,
  },
}


const theme: Theme = createMuiTheme({
  jcorePrimaryColor: '#fdb109',
  sidebar: {
    width: 256,
    padding: {
      horizontal: 22,
      vertical: 10,
    },
    transition: {
      duration: '250ms',
      timingFunction: 'ease',
    },
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

