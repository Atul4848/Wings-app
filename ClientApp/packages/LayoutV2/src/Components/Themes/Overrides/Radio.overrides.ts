import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const radioOverrides = (theme: Theme): ComponentsOverrides['MuiRadio'] => {
  const palette = theme.palette.radioPalette;

  return {
    root: {
      width: 20,
      height: 20,
      padding: 0,
      border: '1px solid',
      borderColor: palette.border.default,
      background: palette.background.default,

      '&:hover': {
        borderColor: palette.border.hovered,
        background: palette.background.hovered,
      },

      '& + &': {
        marginLeft: 10,
      },

      label: {
        fontWeight: 400,
      },

      'label > &': {
        margin: 10,
      },

      '& + .MuiFormControlLabel-label': {
        color: 'unset',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '16px',
        padding: '0 0 1px 0',
        userSelect: 'none',
      },

      '& [data-checked-icon]': {
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: palette.icon.checked,
      },

      '&.Mui-checked': {
        borderColor: palette.border.checked,
        backgroundColor: palette.background.checked,

        '&:hover': {
          borderColor: palette.border.checked,
          backgroundColor: `${palette.background.checked}!important`,
        },
      },

      '&.Mui-disabled': {
        backgroundColor: `${palette.background.disabled} !important`,
        borderColor: `${palette.border.disabled} !important`,

        '& [data-checked-icon]': {
          backgroundColor: palette.icon.disabled,
        },
      },
    },
  };
};
