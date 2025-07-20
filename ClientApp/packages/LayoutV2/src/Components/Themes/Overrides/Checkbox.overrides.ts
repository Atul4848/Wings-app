import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { getCheckboxStyles } from './CheckboxStyle';

export const checkboxOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiCheckbox'] => {
   const styles = getCheckboxStyles(palette.checkboxPalette);
  return {
    root: styles.root,
    colorPrimary: styles.colorPrimary,
  };
};
