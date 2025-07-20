import {
  createTheme,
  ThemeOptions as MUI6ThemeOptions,
  Components,
} from '@mui/material/styles';
import { ThemeOptions as MUI4ThemeOptions } from '@material-ui/core/styles';
import { Overrides } from '@material-ui/core/styles/overrides';
import { typography, zIndex, props } from '../../Globals';
import { getOverrides } from '../../Overrides/GetOverrides';
import {
  autocompletePalette,
  badgePalette,
  basicPalette,
  buttonsPalette,
  chartPalette,
  checkboxPalette,
  chipPalette,
  formPalette,
  iconButtonsPalette,
  iconPalette,
  menuItemPalette,
  notificationPalette,
  popUpPalette,
  radioPalette,
  securityRatingPalette,
  selectablePalette,
  sidebarNavPalette,
  sliderPalette,
  statusBadgePalette,
  switchPalette,
  tabsPalette,
  tablePalette,
  tooltipPalette,
  toggleButtonPalette,
} from './Palette';

const basicColors: Record<string, string> = {
  background: basicPalette.background,
  additionalBackground: basicPalette.background,
  text: basicPalette.text,
  primary: basicPalette.primary,
  success: basicPalette.success,
  warning: basicPalette.warning,
  error: basicPalette.error,
};

const lightShades = {
  50: '#303030',
  100: '#e4e6e9',
  200: '#ffffff',
  300: '#005295',
  400: '#C2C2C2',
  500: '#B3B3B3',
  600: '#A3A3A3',
  700: '#fdfdfd',
  800: '#ffffff',
  900: '#fff0c8',
  A100: '#474b50',
  A200: '#222424',
  A400: '#dbdddf',
  A700: '#303030',
  caretIcon: '#979797',
  important: '#ff5722',
};
declare module '@mui/material/styles' {
  interface Palette {
    autocompletePalette: typeof autocompletePalette;
    badgePalette: typeof badgePalette;
    basicColors: typeof basicColors;
    basicPalette: typeof basicPalette;
    buttons: typeof buttonsPalette;
    chartPalette: typeof chartPalette;
    checkboxPalette: typeof checkboxPalette;
    chipPalette: typeof chipPalette;
    form: typeof formPalette;
    icon: typeof iconPalette;
    iconButtonsPalette: typeof iconButtonsPalette;
    menuItem: typeof menuItemPalette;
    notification: typeof notificationPalette;
    popUpPalette: typeof popUpPalette;
    radioPalette: typeof radioPalette;
    securityRatingPalette: typeof securityRatingPalette;
    selectable: typeof selectablePalette;
    sideNav: typeof sidebarNavPalette;
    slider: typeof sliderPalette;
    statusBadge: typeof statusBadgePalette;
    switchPalette: typeof switchPalette;
    table: typeof tablePalette;
    tabs: typeof tabsPalette;
    tooltip: typeof tooltipPalette;
    toggle: typeof toggleButtonPalette;
  }

  interface PaletteOptions extends Partial<Palette> {}
}

type CustomThemeOptions = Omit<MUI6ThemeOptions, 'breakpoints'> &
  Omit<MUI4ThemeOptions, 'breakpoints'> & {
    breakpoints?:
      | MUI6ThemeOptions['breakpoints']
      | MUI4ThemeOptions['breakpoints'];
  };

export interface MUIThemeOptions extends CustomThemeOptions {
  overrides?: Overrides;
  components?: Components;
  props?: any;
}

// Add this helper to convert props into MUI v6 format
const convertPropsToComponents = (props: Record<string, any>) => {
  return Object.keys(props).reduce((acc, key) => {
    acc[key] = { defaultProps: props[key] };
    return acc;
  }, {} as Components);
};

export const LightThemeOptions: MUIThemeOptions = {
  zIndex,
  typography,
  props,
  palette: {
    common: {},
    mode: 'light',
    type: 'light',
    primary: {
      main: buttonsPalette.primary.contained.backgroundColor.default,
      dark: basicPalette.primaryDark,
      contrastText: basicPalette.contrastText,
    },
    secondary: {
      main: basicPalette.accent,
      dark: basicPalette.accentDark,
      contrastText: basicPalette.contrastText,
    },
    error: {
      main: basicPalette.error,
      dark: basicPalette.error,
      contrastText: basicPalette.contrastText,
    },
    grey: lightShades,
    text: {
      primary: basicPalette.text,
      secondary: basicPalette.text,
    },
    divider: '#dbdddf',
    background: {
      default: basicPalette.background,
      paper: basicPalette.surface,
    },
    action: {
      active: '#63666a',
      hover: '#616369',
      selected: '#4a4d69',
    },
    autocompletePalette,
    badgePalette,
    basicColors,
    basicPalette,
    buttons: buttonsPalette,
    chartPalette,
    checkboxPalette,
    chipPalette,
    form: formPalette,
    icon: iconPalette,
    iconButtonsPalette,
    menuItem: menuItemPalette,
    notification: notificationPalette,
    popUpPalette,
    radioPalette,
    securityRatingPalette,
    selectable: selectablePalette,
    sideNav: sidebarNavPalette,
    slider: sliderPalette,
    statusBadge: statusBadgePalette,
    switchPalette,
    table: tablePalette,
    tabs: tabsPalette,
    tooltip: tooltipPalette,
    toggle: toggleButtonPalette,
  },
};

// Create Theme
export const LightTheme = createTheme(LightThemeOptions);

// Get overrides & components
const { overrides, components: styleComponents } = getOverrides(LightTheme);
const defaultPropsComponents = convertPropsToComponents(props);

// Assign MUI 4 Overrides
LightThemeOptions.overrides = {
  ...overrides,
  MuiPickersToolbar: {
    toolbar: {
      backgroundColor: basicPalette.primary,
    },
  },
  MuiPickersToolbarText: {
    toolbarTxt: {
      color: basicPalette.textColors.onPrimary,
      opacity: 0.54,
    },
    toolbarBtnSelected: {
      color: basicPalette.textColors.onPrimary,
      opacity: 1,
    },
  },
} as Overrides;

// Merge MUI 6 Components
LightThemeOptions.components = Object.keys({
  ...styleComponents,
  ...defaultPropsComponents,
}).reduce((acc, key) => {
  acc[key] = {
    ...(styleComponents[key] || {}),
    ...(defaultPropsComponents[key] || {}),
  };
  return acc;
}, {} as Components);

LightTheme.components = LightThemeOptions.components;
LightTheme.toString = () => 'uvgoLightTheme';

export default { LightTheme, LightThemeOptions };
