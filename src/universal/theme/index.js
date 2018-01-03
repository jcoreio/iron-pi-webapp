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
  palette: {
    background: {
      appBar: string,
      chip: string,
      contentFrame: string,
      default: string,
      paper: string,
      sidebar: string,
    },
    text: {
      disabled: string,
      divider: string,
      hint: string,
      icon: string,
      lightDivider: string,
      primary: string,
      secondary: string,
    },

  },
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
  palette: {
    background: {
      appBar: '#fff',
      contentFrame: '#eef1f1',
      sidebar: '#333e47',
    },
    primary: {
      50: '#eaeff3',
      100: '#cad7e2',
      200: '#a7bdce',
      300: '#84a2ba',
      400: '#698eac',
      500: '#4f7a9d',
      600: '#487295',
      700: '#3f678b',
      800: '#365d81',
      900: '#264a6f',
      A100: '#b2d7ff',
      A200: '#7fbcff',
      A400: '#4ca1ff',
      A700: '#3393ff',
      'contrastDefaultColor': 'light',
    },
    secondary: {
      50: '#fff7e0',
      100: '#ffecb3',
      200: '#ffdf80',
      300: '#ffd24d',
      400: '#ffc826',
      500: '#ffbe00',
      600: '#ffb800',
      700: '#ffaf00',
      800: '#ffa700',
      900: '#ff9900',
      A100: '#ffecc7',
      A200: '#ffdc99',
      A400: '#ffcf5c',
      A700: '#ffbe00',
      'contrastDefaultColor': 'dark',
    },
  },
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

