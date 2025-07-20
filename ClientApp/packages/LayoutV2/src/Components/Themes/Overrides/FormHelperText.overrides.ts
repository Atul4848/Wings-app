import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const formHelperTextOverrides = ({ palette }: Theme): ComponentsOverrides['MuiFormHelperText'] => ({
  root: {
    marginLeft: '0 !important',

    '&.Mui-error': {
      color: palette?.form?.borderColor?.error,
    },
  },
});
