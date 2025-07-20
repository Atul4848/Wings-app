import {
  createTheme,
  ThemeOptions as MUI6ThemeOptions,
  Components,
} from '@mui/material/styles';
import { typography, zIndex, props } from '../../Globals';
import { getOverrides } from '../../Overrides/GetOverrides';
import { ThemeOptions as MUI4ThemeOptions } from '@material-ui/core/styles';
import { Overrides } from '@material-ui/core/styles/overrides';
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
  tablePalette,
  tabsPalette,
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

const darkShades = {
  50: '#d9d9d9',
  100: '#32343a',
  200: basicPalette.primary,
  300: '#ffffff',
  400: '#ffffff',
  500: '#595959',
  600: '#404040',
  700: '#24262b',
  800: '#24262b',
  900: '#313540',
  A100: '#b0b1b5',
  A200: '#161819',
  A400: '#333333',
  A700: '#ffffff',
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

export const DarkThemeOptions: MUIThemeOptions = {
  zIndex,
  props,
  typography,
  palette: {
    common: {},
    mode: 'dark',
    type: 'dark',
    primary: {
      main: basicPalette.primary,
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
    grey: darkShades,
    text: {
      primary: basicPalette.text,
      secondary: basicPalette.text,
    },
    divider: 'rgba(255, 255, 255, 0.3)',
    background: {
      default: basicPalette.background,
      paper: basicPalette.surface,
    },
    action: {
      active: '#63666a',
      hover: '#616369',
      selected: '#4a4d69',
    },
    accent: {
      main: '#ff4081', // Example accent color
      contrastText: '#ffffff',
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
export const DarkTheme = createTheme(DarkThemeOptions);

// Get overrides & components
const { overrides, components: styleComponents } = getOverrides(DarkTheme);
const defaultPropsComponents = convertPropsToComponents(props);

// Assign MUI 4 Overrides
DarkThemeOptions.overrides = overrides as Overrides;
// DarkTheme.overrides = overrides;

// Merge MUI 6 Components
DarkThemeOptions.components = Object.keys({
  ...styleComponents,
  ...defaultPropsComponents,
}).reduce((acc, key) => {
  acc[key] = {
    ...(styleComponents[key] || {}),
    ...(defaultPropsComponents[key] || {}),
  };
  return acc;
}, {} as Components);

DarkTheme.components = DarkThemeOptions.components;
DarkTheme.toString = () => 'uvgoDarkTheme';

export default { DarkTheme, DarkThemeOptions };
