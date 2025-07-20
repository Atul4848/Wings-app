export interface MenuItemPaletteOptions {
    frameColor: string;
    borderColor: {
        default: string;
    };
    backgroundColor: {
        default: string;
        hovered: string;
        active: string;
    };
    textColor: {
        default: string;
        active: string;
        accent: string;
        success: string;
        warning: string;
        danger: string;
    };
}