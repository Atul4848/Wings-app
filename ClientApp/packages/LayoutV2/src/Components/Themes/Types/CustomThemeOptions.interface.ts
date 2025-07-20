import { ThemeOptions } from '@mui/material';
import { CustomThemeOptionsTypography } from './CustomThemeOptionsTypography.interface';

export interface CustomThemeOptions extends ThemeOptions {
  typography: CustomThemeOptionsTypography;
}
