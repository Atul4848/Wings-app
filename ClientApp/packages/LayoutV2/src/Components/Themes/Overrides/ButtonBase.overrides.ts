import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { getMenuItemStyle } from './MenuItemStyle';
import { getChipStyles } from './ChipStyle';
import { getCheckboxStyles } from './CheckboxStyle';

export const buttonBaseOverrides = (
  theme: Theme
): ComponentsOverrides['MuiButtonBase'] => {
  const { palette } = theme;
  const chipStyles = getChipStyles(palette);
  const checkboxStyles = getCheckboxStyles(palette.checkboxPalette);

  return {
    root: {
      '&.MuiMenuItem-root': getMenuItemStyle(palette),
      '&.MuiChip-root': {
        ...chipStyles.root,
        '&.MuiChip-clickable': chipStyles.clickable,
        '&.MuiChip-deletable': chipStyles.deletable,
        '& .MuiChip-label': chipStyles.label,
        '& .MuiChip-deleteIcon': chipStyles.deleteIcon,
      },
      '&.MuiCheckbox-root': {
        ...checkboxStyles.root,
        '&.Mui-colorPrimary': checkboxStyles.colorPrimary,
      },
    },
  };
};
