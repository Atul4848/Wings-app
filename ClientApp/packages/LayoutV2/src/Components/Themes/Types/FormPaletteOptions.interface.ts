export interface FormPaletteOptions {
  borderColor: OptionalColorStates;
  backgroundColor: OptionalColorStates;
  textColor: OptionalColorStates;
  iconColor: IconColorStates;
}

interface IconColorStates extends ColorStates {
  success: string;
}

interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
  focused: string;
  error: string;
}

interface OptionalColorStates extends ColorStates {
  success: string;
  warning: string;
}
