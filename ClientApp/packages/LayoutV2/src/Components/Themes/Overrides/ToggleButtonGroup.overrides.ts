import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const toggleButtonGroupOverrides = ({ palette }: Theme): ComponentsOverrides['MuiToggleButtonGroup'] => ({
  root: {
    display: 'inline-flex',
    borderColor: palette?.toggle?.borderColor?.default,
    overflow: 'hidden',
  },
  grouped: {
    '&:not(:first-child)': {
      marginLeft: '-1px !important',
    },
    '&:not(:first-child):not(.Mui-selected)': {
      borderLeft: `1px solid ${palette?.toggle?.borderColor?.default} !important`,
    },
  },
});
