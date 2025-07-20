import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { getMenuItemStyle } from './MenuItemStyle';

export const menuItemOverrides = ({ palette }: Theme): ComponentsOverrides['MuiMenuItem'] => ({
  root: getMenuItemStyle(palette),
});
