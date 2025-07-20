export interface ButtonsPaletteOptions {
  primary: {
    contained: PropertyOptions;
    outlined: PropertyOptions;
    text: PropertyOptions;
  };
  secondary: {
    contained: PropertyOptions;
    outlined: PropertyOptions;
    text: PropertyOptions;
  };
  danger?: {
    contained: PropertyOptions;
    outlined: PropertyOptions;
    text: PropertyOptions;
  };
}

interface PropertyOptions {
  borderColor: ColorStates;
  backgroundColor: ColorStates;
  textColor: ColorStates;
}

interface ColorStates {
  default: string;
  hovered: string;
  active: string;
  disabled: string;
}
