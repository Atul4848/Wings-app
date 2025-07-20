import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const toggleButtonOverrides = ({ palette }: Theme): ComponentsOverrides['MuiToggleButton'] => ({
  root: {
    flexBasis: 90,
    borderColor: palette?.toggle?.borderColor?.default,
    backgroundColor: palette?.toggle?.backgroundColor?.default,
    borderRadius: 500,
    height: 30,
    minWidth: 90,
    padding: 0,
    transition: '0.1s',

    '&.Mui-selected, &.Mui-selected:hover': {
      backgroundColor: `${palette?.toggle?.backgroundColor?.active} !important`,
      border: `1px solid ${palette?.toggle?.borderColor?.active} !important`,
      zIndex: 1,
    },
  },
});
