import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const formFieldOverrides = (
  theme: Theme
): ComponentsOverrides['MuiOutlinedInput'] => {
  const formPalette = theme.palette?.form;
  const iconPalette = theme.palette?.icon;

  const placeholderStyles = {
    color: formPalette?.textColor?.disabled,
    fontSize: 14,
    opacity: '1 !important',
  };

  const adornmentStyles = {
    color: iconPalette?.default?.clickable,

    '& svg': {
      width: 20,
      height: 16,
    },

    '& p': {
      fontSize: 14,
      color: formPalette.textColor?.disabled,
    },
  };

  return {
    root: {
      borderRadius: 4,
      backgroundColor: formPalette.backgroundColor?.default,
      fontSize: 14,

      '&:hover .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${formPalette.borderColor?.hovered}`,
        color: formPalette.textColor?.hovered,
      },
      '&.Mui-disabled': {
        backgroundColor: formPalette.backgroundColor?.disabled,
        pointerEvents: 'none',

        '.MuiOutlinedInput-notchedOutline': {
          border: `1px solid ${formPalette.borderColor?.disabled}`,
          color: formPalette.textColor?.disabled,
        },

        '& svg': {
          color: formPalette.textColor?.disabled,
        },
      },

      '&.Mui-error': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: `${formPalette.borderColor?.error} !important`,
        },
        '& ::placeholder': {
          color: `${formPalette.borderColor?.error}`,
          opacity: '1 !important',
        },
      },
    },
    notchedOutline: {
      borderWidth: 1,
    },
    input: {
      display: 'block',
      width: '100%',
      minHeight: 30,
      borderRadius: 4,
      boxSizing: 'border-box' as any,
      padding: '0 10px',
      color: formPalette.textColor?.default,
      fontSize: 14,

      '&:focus': {
        color: formPalette.textColor?.focused,
      },

      '&::placeholder': {
        ...placeholderStyles,
        opacity: '1 !important',
      },

      '&:hover ~ .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${formPalette.borderColor?.hovered}`,
        color: formPalette.textColor?.default,
      },

      '&:focus ~ .MuiOutlinedInput-notchedOutline': {
        border: `1px solid ${formPalette.borderColor?.focused}`,
      },

      '&:disabled ~ .MuiOutlinedInput-notchedOutline': {
        borderColor: formPalette.borderColor?.disabled,
        color: formPalette.textColor?.disabled,
      },

      '&:-webkit-autofill': {
        boxShadow: '0 0 0 30px #ffffff inset',
      },

      '&::-webkit-input-placeholder': placeholderStyles,

      '#root &, #dialog &': {
        '&::-webkit-input-placeholder': placeholderStyles,
        '&::-moz-placeholder': placeholderStyles,
        '&:-ms-input-placeholder': placeholderStyles,
        '&::-ms-input-placeholder': placeholderStyles,
      },
    },
    multiline: {
      padding: 0,
      lineHeight: '20px',
    },
    inputMultiline: {
      padding: 10,
    },
    adornedStart: {
      ...adornmentStyles,
      paddingLeft: 10,
    },
    adornedEnd: {
      ...adornmentStyles,
      paddingRight: 10,
    },
  };
};
