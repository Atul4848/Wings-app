export interface BasicPaletteOptions {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  text: string;
  contrastText: string;
  blackText: string;
  whiteText: string;
  background: string;
  surface: string;
  error: string;
  additionalColors: {
    orange: string;
    purple: string;
    cyan: string;
    yellow: string;
    yellowGreen: string;
    lightBlue: string;
    green: string;
    gray: string;
  };
  icon: {
    color: string;
    background: string;
  };
  textColors: {
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    onError: string;
    primary: string;
    secondary: string;
    darkGrey: string;
    url: string;
    urlHovered: string;
    orange: string;
  };
  clockBg: string;
  success: string;
  warning: string;
}
