import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { getChipStyles } from './ChipStyle';

export const chipOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiChip'] => {
  const styles = getChipStyles(palette);
  return {
    root: styles.root,
    clickable: styles.clickable,
    deletable: styles.deletable,
    label: styles.label,
    deleteIcon: styles.deleteIcon,
  };
};
