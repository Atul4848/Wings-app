import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { color } from '@mui/system';

export const formLabelOverrides = ({ palette }: Theme): ComponentsOverrides['MuiFormLabel'] => ({
  root: {
    fontSize: 12,
    lineHeight: 1.58,
    fontWeight: 600,
    color: palette?.form.textColor?.default,

    '&.--bold': {
      fontWeight: 600,
    },

    '&.Mui-disabled': {
      color: palette?.form.textColor?.default,
    },

    '&.Mui-error': {
      color: palette?.form.textColor?.error,
    },

    '&.Mui-focused, &.Mui-error.Mui-focused': {
      color: palette?.form.textColor?.focused,
    },
    '&.MuiInputLabel-root': {
      margin: '0 0 4px 0',
      zIndex: 1,
      position: 'relative',
      transform: 'none !important',
      pointerEvents: 'none',
      color: palette?.basicPalette.text,
      '&.Mui-focused':{
        color: palette?.basicPalette.text,
      },
    }
  },
  asterisk: {
    color: palette?.form.borderColor?.error,
  },
});
