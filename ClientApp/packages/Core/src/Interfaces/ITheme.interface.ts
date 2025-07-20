import { Theme } from '@material-ui/core/styles';
import { Palette } from '@material-ui/core/styles/createPalette';
import { TablePaletteOptions } from '@uvgo-shared/themes/dist/Types/TablePaletteOptions.interface';
import { ElementPaletteOptions } from '@uvgo-shared/themes/dist/Types/ElementPaletteOptions.interface';
import { ButtonsPaletteOptions } from '@uvgo-shared/themes/dist/Types/ButtonsPaletteOptions.interface';

export interface ITheme extends Theme {
  palette: IPalette;
}

interface IPalette extends Palette {
  table?: TablePaletteOptions;
  buttons?: ButtonsPaletteOptions;
  form?: IFormOptions;
}

interface IFormOptions extends Palette {
  backgroundColor: ElementPaletteOptions;
}
