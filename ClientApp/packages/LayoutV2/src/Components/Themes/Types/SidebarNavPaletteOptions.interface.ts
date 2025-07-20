interface ColorStates {
  default: string;
  hovered: string;
  active: string;
}

export interface SidebarNavPaletteOptions {
  container: {
    backgroundColor: string;
  };
  menuItem: {
    textColor: ColorStates;
    backgroundColor: ColorStates;
    iconColor: ColorStates;
  };
}
