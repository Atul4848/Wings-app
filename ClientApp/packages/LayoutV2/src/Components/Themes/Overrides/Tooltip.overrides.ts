import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const tooltipOverrides = ({ palette }: Theme): ComponentsOverrides['MuiTooltip'] => ({
  tooltip: {
    color: palette?.text?.primary,
    fontSize: '90%',
  },
});