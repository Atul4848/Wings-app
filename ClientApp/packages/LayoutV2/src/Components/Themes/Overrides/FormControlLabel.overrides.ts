import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const formControlLabelOverrides = (
  { palette }: Theme
): ComponentsOverrides['MuiFormControlLabel'] => ({
  root: {
    marginLeft: -10,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: palette?.form.textColor.default,
  },
  labelPlacementStart: {
    marginLeft: 0,
    marginRight: -10,
  },
});
