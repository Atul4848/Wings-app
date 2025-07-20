import { Theme } from '@mui/material/styles';

export const getCheckboxStyles = (palette: Theme['palette']['checkboxPalette']) => ({
  root: {
    width: 20,
    height: 20,
    border: '1px solid',
    borderColor: palette.border.default,
    background: palette.background.default,
    borderRadius: 3,
    padding: 0,
    boxSizing: 'border-box' as const,

    '& + &': {
      marginLeft: 10,
    },

    'label > &': {
      margin: 10,
    },

    '&:hover': {
      background: palette.background.hovered,
    },

    '& svg': {
      width: 10,
      height: 10,
      flexShrink: 0,
    },

    '&.Mui-checked, &$checked': {
      backgroundColor: palette.background.checked,
      borderColor: palette.border.checked,

      '&:hover': {
        backgroundColor: palette.background.checked,
        borderColor: palette.border.checked,
      },

      '& svg': {
        color: palette.icon.checked,
      },
    },

    '&.Mui-disabled, &$disabled': {
      backgroundColor: `${palette.background.disabled} !important`,
      borderColor: `${palette.border.disabled} !important`,

      '& svg': {
        color: `${palette.icon.disabled} !important`,
      },
    },

    '& + .MuiFormControlLabel-label': {
      color: 'unset',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: '16px',
      userSelect: 'none',
    },
  },
   colorPrimary: {
      '&$checked': {
        backgroundColor: palette.background.checked,
        borderColor: palette.border.checked,

        '&:hover': {
          backgroundColor: palette.background.checked,
          borderColor: palette.border.checked,
        },

        '& svg': {
          color: palette.icon.checked,
        },
      },
      '&.Mui-checked': {
        backgroundColor: palette.background.checked,
        borderColor: palette.border.checked,

        '&:hover': {
          backgroundColor: palette.background.checked,
          borderColor: palette.border.checked,
        },

        '& svg': {
          color: palette.icon.checked,
        },
      },
    },
});
