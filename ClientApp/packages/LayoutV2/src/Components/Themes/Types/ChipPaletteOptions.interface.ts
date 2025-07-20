export interface ChipPaletteOptions {
  backgroundColor: ColorStates;
  borderColor: ColorStates;
  textColor: ColorStates;
  iconColor: ColorStates;
}

interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
  selected: string;
}
