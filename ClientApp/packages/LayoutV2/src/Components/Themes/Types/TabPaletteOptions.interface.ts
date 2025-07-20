interface ColorStates {
  default: string;
  hovered: string;
  active: string;
}

interface OptionalColorStates extends ColorStates{
  dark: string;
}

export interface TabPaletteOptions {
  backgroundColor: OptionalColorStates;
  textColor: ColorStates;
  iconColor: ColorStates;
  borderColor: ColorStates;
  navigation: ColorStates;
  navigationIcon: ColorStates;
}
