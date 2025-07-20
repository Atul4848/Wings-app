export interface IconPaletteOptions {
  default: OptionalColorStates;
  contrast: ColorStates;
}
interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
  focused: string;
  error: string;
  success: string;
  warning: string;
}
interface OptionalColorStates extends ColorStates {
  clickable: string;
}
