export interface CheckboxPaletteOptions {
  border: ColorStates;
  background: ColorStates;
  icon: ColorStates;
}

interface ColorStates {
  default: string;
  hovered: string;
  checked: string;
  disabled: string;
}

