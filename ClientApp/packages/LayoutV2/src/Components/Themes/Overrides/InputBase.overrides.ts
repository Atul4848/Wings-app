import { ComponentsOverrides, Theme } from '@mui/material/styles';

export const inputBaseOverrides = (
  _theme: Theme
): ComponentsOverrides['MuiInputBase'] => {
  return {
    root: {
      '& label[data-shrink="false"] + .MuiInputBase-formControl input::placeholder': {
        opacity: '1 !important',
      },
      '& label[data-shrink=false] + .MuiInputBase-formControl input.MuiInputBase-input::-webkit-input-placeholder': {
        opacity: '1 !important',
      },
      '& label[data-shrink=false] + .MuiInputBase-formControl input.MuiInputBase-input::-moz-placeholder': {
        opacity: '1 !important',
      },
      '& label[data-shrink=false] + .MuiInputBase-formControl input.MuiInputBase-input:-ms-input-placeholder': {
        opacity: '1 !important',
      },
      '& label[data-shrink=false] + .MuiInputBase-formControl input.MuiInputBase-input::-ms-input-placeholder': {
        opacity: '1 !important',
      },
      '&.MuiOutlinedInput-root': {
        '&.MuiSelect-root': {
          '&:hover': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: _theme.palette.form.borderColor?.focused,
              borderWidth: '1px',
            },
          },
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: _theme.palette.form.borderColor?.focused,
              borderWidth: '1px',
            },
          },
        },
        '&.Mui-focused': {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: _theme.palette.form.borderColor?.focused,
            borderWidth: '1px',
          },
        },
        '&.Mui-disabled': {
          '&.MuiButtonBase-root.MuiChip-root': {
            opacity: 1,
            pointerEvents: 'none',
            color: _theme.palette.chipPalette.textColor.disabled,
            backgroundColor:
              _theme.palette.chipPalette.backgroundColor.disabled,
            borderColor: _theme.palette.chipPalette.borderColor.disabled,
          },
        },
      },
    },
    input: {
      outline: 'none',
    },
  };
};
