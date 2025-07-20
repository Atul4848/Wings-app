import { ComponentsOverrides } from '@mui/material/styles';

export const inputAdornmentOverrides = (): ComponentsOverrides['MuiInputAdornment'] => ({
  positionStart: {
    '& > button': {
      marginLeft: -10,
      borderRadius: '4px 0 0 4px',
    },
  },
  positionEnd: {
    '& > button': {
      marginRight: -10,
      borderRadius: '0 6px 6px 0',
    },
  },
});
