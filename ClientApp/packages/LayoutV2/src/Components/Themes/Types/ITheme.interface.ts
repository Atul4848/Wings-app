import { Color, Theme } from '@mui/material';

import {
  CommonColors,
  Palette,
  PaletteColor,
  PaletteMode,
  TypeAction,
  TypeBackground,
  TypeText,
  TypographyStyle,
} from '@mui/material/styles';

import { TablePaletteOptions } from './TablePaletteOptions.interface';
import { ElementPaletteOptions } from './ElementPaletteOptions.interface';
import { ButtonsPaletteOptions } from './ButtonsPaletteOptions.interface';
import { NotificationPaletteOptions } from './NotificationPaletteOptions.interface';
import { AlertStylesOptions } from './AlertPaletteOptions.interface';
import { IconPaletteOptions } from './IconPaletteOptions.interface';
import { UtilsPaletteColorOptions } from './UtilsPaletteColorOptions.interface';
import { ComponentPaletteOptions } from './ComponentPaletteOptions.interface';
import { BasicPaletteOptions } from './BasicPaletteOptions.interface';
import { StatusBadgePaletteOptions } from './StatusBadgePaletteIOptions.interface';
import { ChartPaletteOptions } from './ChartPaletteOptions.interface';
import { PopUpOptions } from './PopUpOptions.interface';
import { RadioPaletteOptions } from './RadioPaletteOptions.interface';
import { SecurityRatingOptions } from './SecurityRatingOptions.interface';
import { CheckboxPaletteOptions } from './CheckboxPaletteOptions.interface';
import { SidebarNavPaletteOptions } from './SidebarNavPaletteOptions.interface';
import { SliderPaletteOptions } from './SliderPaletteOptions.interface';
import { SwitchPaletteOptions } from './SwitchPaletteOptions.interface';
import { Typography, Variant } from '@mui/material/styles/createTypography';
import { TypeDivider } from '@mui/material/styles/createPalette';
import { ChipPaletteOptions } from './ChipPaletteOptions.interface';
import { FormPaletteOptions } from './FormPaletteOptions.interface';
import { IconButtonPaletteOptions } from './IconButtonPaletteOptions.interface';
import { MenuItemPaletteOptions } from './MenuItemPaletteOptions.interface';
import { SelectablePaletteOptions } from './SelectablePaletteOptions.interface';
import { TabPaletteOptions } from './TabPaletteOptions.interface';

export type IVariant = Variant | 'monospace';

export interface ITypography
  extends Typography,
    Record<IVariant, TypographyStyle> {}

export interface ITheme extends Theme {
  palette: IPalette;
  typography: ITypography;
}

export interface IPalette extends Palette {
  alert: AlertStylesOptions;
  utils: UtilsPaletteColorOptions;
  formPalette: ComponentPaletteOptions;
  common: CommonColors;
  mode: PaletteMode;
  primary: PaletteColor;
  secondary: PaletteColor;
  error: PaletteColor;
  warning: PaletteColor;
  info: PaletteColor;
  success: PaletteColor;
  grey: Color;
  text: TypeText;
  divider: TypeDivider;
  action: TypeAction;
  background: TypeBackground;
  autocompletePalette: ComponentPaletteOptions;
  badgePalette: IBadgePalette;
  basicColors: Record<string, string>;
  basicPalette: BasicPaletteOptions;
  buttons: ButtonsPaletteOptions;
  chartPalette: ChartPaletteOptions;
  checkboxPalette: CheckboxPaletteOptions;
  chipPalette: ChipPaletteOptions;
  form: FormPaletteOptions;
  icon: IconPaletteOptions;
  iconButtonsPalette: IconButtonPaletteOptions;
  menuItem: MenuItemPaletteOptions;
  notification: NotificationPaletteOptions;
  popUpPalette: PopUpOptions;
  radioPalette: RadioPaletteOptions;
  securityRatingPalette: SecurityRatingOptions;
  selectable: SelectablePaletteOptions;
  sideNav: SidebarNavPaletteOptions;
  slider: SliderPaletteOptions;
  statusBadge: StatusBadgePaletteOptions;
  switchPalette: SwitchPaletteOptions;
  table: TablePaletteOptions;
  tabs: TabPaletteOptions;
  tooltip: { textColor: { default: string } };
  toggle: TogglePaletteOptions;
}
interface IBadgePalette extends Palette {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
}

interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
}

interface TogglePaletteOptions extends Palette {
  borderColor: ColorStates;
  backgroundColor: ColorStates;
  textColor: ColorStates;
}
