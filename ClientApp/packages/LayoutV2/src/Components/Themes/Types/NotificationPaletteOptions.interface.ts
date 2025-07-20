interface ColorStates {
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  iconColor: string;
  closeIconColor: string;
}
export interface NotificationPaletteOptions {
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
  info: ColorStates;
  success: ColorStates;
  warning: ColorStates;
  error: ColorStates;
}
