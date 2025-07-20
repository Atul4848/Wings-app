import { AlertStylesOptions } from './AlertPaletteOptions.interface';
 import { IconPaletteOptions } from './IconPaletteOptions.interface';
  import { UtilsPaletteColorOptions } from './UtilsPaletteColorOptions.interface';
  import { ComponentPaletteOptions } from './ComponentPaletteOptions.interface';
  import { ButtonsPaletteOptions } from './ButtonsPaletteOptions.interface';

declare module '@mui/material/styles' {
  interface PaletteOptions {
    alert?: AlertStylesOptions;
    form?: ComponentPaletteOptions;
    icon?: IconPaletteOptions;
    utils?: UtilsPaletteColorOptions;
    // menuItem?: ComponentPaletteOptions;
    tooltip?: ComponentPaletteOptions;
    buttons?: ButtonsPaletteOptions;
    table?: any;
    basicColors: Record<string, string>;
    notification?: any;
    basicPalette?: any;
    switchPalette?: any;
    checkboxPalette?: any;
    radioPalette?: any;
    formPalette?: any;
    iconButtonsPalette?: any;
    [key: string]: any;
  }
}
