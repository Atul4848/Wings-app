export interface AlertStylesOptions {
  primary?: string;
  borderColor?: string;
  backgroundColor?: string;
  titleColor?: string;
  textColor?: string;
}

export interface AlertsPaletteColorOptions {
  info?: AlertStylesOptions;
  warning?: AlertStylesOptions;
  error?: AlertStylesOptions;
  success?: AlertStylesOptions;
}
