export interface IconButtonPaletteOptions {
  backgroundColor: ColorStates;
  borderColor: ColorStates;
  textColor: ColorStates;
}
interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
}
