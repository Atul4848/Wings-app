interface StateColors {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
}

export interface SelectablePaletteOptions {
  backgroundColor: StateColors;
  textColor: StateColors;
}
