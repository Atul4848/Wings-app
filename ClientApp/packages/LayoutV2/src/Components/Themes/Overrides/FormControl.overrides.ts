import { Theme, ComponentsOverrides } from '@mui/material/styles';

const largeControlStyles = palette => ({
  '& .MuiInputBase-root': {
    minHeight: 40,
    borderRadius: 6,
    padding: '0 40px 0 3px !important',
  },
  '& .MuiOutlinedInput-input': {
    borderRadius: 6,
    color: palette.form.textColor?.default,
    width: '100%',
    display: 'block',
    padding: '0 10px',
    fontSize: 14,
    boxSizing: 'border-box',
    minHeight: 30,
  },
  '& fieldset': {
    borderRadius: 6,
  },
  '& .MuiSelect-select': {
    minHeight: '40px !important',
    alignItems: 'center',
    display: 'inline-flex',
  },
  '& .MuiChip-root': {
    height: 30,
    marginLeft: -5,
  },
  '& .MuiChip-label': {
    paddingRight: 12,
    paddingLeft: 12,
    fontSize: 14,
  },
  '& .MuiAutocomplete-tag': {
    margin: '0 5px 0 2px',
  },
  '& .MuiInputAdornment-root .MuiIconButton-root': {
    height: 40,
    width: 40,
  },
  '& svg': {
    width: 20,
    height: 20,
    flexShrink: 0,
  },
  '&.MuiInputLabel-root': {
    margin: '0 0 4px 0',
    zIndex: 1,
    position: 'relative',
    transform: 'none !important',
    pointerEvents: 'none',
    color: palette?.basicPalette.text,
  },
});

export const formControlOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiFormControl'] => ({
  root: {
    width: '100%',
    minHeight: '40px',
    '&. MuiSelect-outlined': {
      padding: '11px 6px',
    },
    '& legend': {
      display: 'none',
    },
    '& fieldset': {
      height: '100%',
      top: 0,
      boxSizing: 'border-box',
      borderWidth: '1px',
      borderColor: palette.form.borderColor.default,
      borderRadius: 4,
      padding: 0,
    },
    '&.--large': {
      ...largeControlStyles(palette),
    },
    '& .MuiInput-underline': {
      '&:hover:not(.Mui-disabled):before': {
        border: 'none',
        transition: 'none',
      },
      '&:before': {
        border: 'none',
        transition: 'none',
      },
      '&.Mui-focused:after': {
        border: 'none',
        transform: 'none',
        transition: 'none',
      },
      '&:after': {
        transform: 'none !important',
        border: 'none',
      },
      '&.Mui-disabled:before': {
        border: 'none',
      },
    },
    '& .MuiInput-root': {
      border: '1px solid',
      height: '100%',
      padding: '0 10px',
      fontSize: 14,
      backgroundColor: palette.form.backgroundColor?.default,
      boxSizing: 'border-box',
      borderColor: palette.form.borderColor?.default,
      borderWidth: '1px !important',
      borderRadius: 4,
      marginTop: '0 !important',
      '& svg': {
        height: 16,
        width: 20,
      },
      '&:hover': {
        border: `1px solid ${palette.form.borderColor?.hovered}`,
        color: palette.form.textColor?.default,
      },

      '&:focus': {
        border: `1px solid ${palette.form.borderColor?.focused}`,
      },

      '&:disabled': {
        borderColor: palette.form.borderColor?.disabled,
        color: palette.form.textColor?.disabled,
      },
      '&.Mui-error': {
        borderColor: palette.form.borderColor?.error,
      },
    },
  },
});
