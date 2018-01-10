// @flow

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

export type Palette = {
  [50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900]: string,
  A100: string,
  A200: string,
  A400: string,
  A700: string,
  constrastDefaultColor: 'light' | 'dark',
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
      valueBlock: {
        ok: string,
      },
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
    grey: Palette,
    primary: Palette,
    secondary: Palette,
    infoIcon: string,
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
    arrow: {
      fill: string,
      shaftWidth: number,
      shaftLength: number,
      longShaftLength: number,
      headWidth: number,
      headLength: number,
    },
    block: {
      height: number,
      spacing: number,
      padding: number,
    },
    polarityIcon: {
      color: string,
      width: string,
      height: string,
    },
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
  overrides?: {
    MuiButton?: {
      root?: Object,
      raised?: Object,
      raisedAccent?: Object,
    },
    MuiInput?: {
      root?: Object,
    },
    MuiFormLabel?: {
      root?: Object,
    },
    MuiInputLabel?: {
      shrink?: Object,
    },
  },
}

const theme: Theme = createMuiTheme({
  spacing: {unit: 8},
  palette: {
    background: {
      appBar: '#fff',
      contentFrame: '#eef1f1',
      sidebar: '#333e47',
      valueBlock: {
        ok: '#f1fcea',
      },
    },
    primary: {
      [50]: '#eaeff3',
      [100]: '#cad7e2',
      [200]: '#a7bdce',
      [300]: '#84a2ba',
      [400]: '#698eac',
      [500]: '#4f7a9d',
      [600]: '#487295',
      [700]: '#3f678b',
      [800]: '#365d81',
      [900]: '#264a6f',
      A100: '#b2d7ff',
      A200: '#7fbcff',
      A400: '#4ca1ff',
      A700: '#3393ff',
      'contrastDefaultColor': 'light',
    },
    secondary: {
      [50]: '#fff7e0',
      [100]: '#ffecb3',
      [200]: '#ffdf80',
      [300]: '#ffd24d',
      [400]: '#ffc826',
      [500]: '#ffbe00',
      [600]: '#ffb800',
      [700]: '#ffaf00',
      [800]: '#ffa700',
      [900]: '#ff9900',
      A100: '#ffecc7',
      A200: '#ffdc99',
      A400: '#ffcf5c',
      A700: '#ffbe00',
      'contrastDefaultColor': 'dark',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.5)',
    },
    input: {
      inputText: 'rgba(0, 0, 0, 0.61)',
      labelText: 'rgba(0, 0, 0, 0.5)',
      helperText: 'rgba(0, 0, 0, 0.5)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    infoIcon: '#eee',
  },
  typography: {
    fontFamily: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
    fontWeightLight: 400,
    fontWeightRegular: 500,
    fontWeightMedium: 600,
    button: {
      fontSize: 18,
      fontWeight: 500,
      textTransform: 'none',
      lineHeight: '23px',
    },
  },
})

theme.sidebar = {
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
}
theme.channelState = {
  on: '#5dba54',
  off: '#d8d8d8',
  warning: '#e2a000',
  arrow: {
    fill: theme.palette.primary.A100,
    shaftWidth: theme.spacing.unit * 1.5,
    shaftLength: theme.spacing.unit * 3,
    longShaftLength: theme.spacing.unit * 6,
    headWidth: theme.spacing.unit * 2.1,
    headLength: theme.spacing.unit * 1.7,
  },
  block: {
    height: theme.spacing.unit * 6,
    spacing: theme.spacing.unit,
    padding: theme.spacing.unit / 2,
  },
  polarityIcon: {
    color: theme.palette.grey[500],
    width: '2.5rem',
    height: '2.5rem',
  },
}

theme.overrides = {
  MuiButton: {
    root: {
      ...theme.typography.button,
      padding: `${theme.spacing.unit / 2}px ${theme.spacing.unit * 2}px`,
      borderRadius: 0,
    },
    raised: {
      color: theme.palette.text.primary,
    },
    raisedAccent: {
      color: 'rgba(0, 0, 0, 0.61)',
    },
  },
  MuiInput: {
    root: {
      fontSize: theme.typography.pxToRem(20),
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  MuiFormLabel: {
    root: {
      fontSize: theme.typography.pxToRem(15),
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  MuiInputLabel: {
    shrink: {
      transform: 'translate(0, 1.5px)',
    },
  },
}

export default theme

