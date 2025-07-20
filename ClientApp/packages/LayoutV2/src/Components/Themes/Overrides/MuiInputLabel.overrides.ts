import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const inputLabelOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiInputLabel'] => ({
  outlined: {
    transform: 'none!important',
    pointerEvents: 'none',
    position: 'relative',
    margin: '0 0 4px 0',
    '&.Mui-focused': {
      color: palette.basicPalette.blackText,
    },
  },
  root: {
    transform: 'none!important',
    pointerEvents: 'none',
    position: 'relative',
    margin: '0 0 4px 0',
    fontSize: '12px!important',
    overflow: 'hidden',
    fontWeight: 600,
    textOverflow: 'ellipsis',
    lineHeight: 1.58,
    whiteSpace: 'nowrap',
    '&.Mui-focused': {
      color: palette.basicPalette.blackText,
    },
  },
  formControl:{
    position: 'relative',
  },
  shrink: {
    transform: 'translate(14px, -6px) scale(0.85)',
  },
});
