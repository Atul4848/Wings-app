import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const buttonIconOverrides = ({ palette }: Theme): ComponentsOverrides['MuiIconButton'] => ({
  root: {
    padding: 7,

    '&.Mui-disabled': {
      color: palette?.icon?.default?.disabled,
    },
  },
  edgeStart: {},
  edgeEnd: {
    marginRight: 0,
  },
});
