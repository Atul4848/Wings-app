interface ColorStates {
  default: string;
  hovered: string;
  focused: string;
  checked: string;
  disabled: string;
}

export interface SwitchPaletteOptions {
  track: ColorStates;
  thumb: ColorStates;
}

