import { ComponentsOverrides, Theme } from '@mui/material/styles';
import { lineHeight } from '@mui/system';

export const autocompleteOverrides = ({
  palette,
}: Theme): ComponentsOverrides['MuiAutocomplete'] => ({
  inputRoot: {
    padding: '0 40px 0 3px !important',
  },
  tag: {
    margin: '0 5px 0 0',
  },
  listbox: {
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiAutocomplete-option': {
      fontSize: '14px',
      minHeight: 40,
      borderTop: `0.5px solid ${palette?.menuItem?.borderColor?.default}`,
      '&:first-child': {
        borderTop: 'none',
      },
      '&[aria-selected="true"]': {
        backgroundColor: palette?.menuItem?.backgroundColor?.hovered,
        color: palette?.menuItem?.textColor?.default,
        '&.Mui-focused': {
          backgroundColor: palette?.menuItem?.backgroundColor?.hovered,
          color: palette?.menuItem?.textColor?.default,
        },
      },
      '&.Mui-focused': {
        backgroundColor: palette?.menuItem?.backgroundColor?.hovered,
        color: palette?.menuItem?.textColor?.default,
      },
    },
  },
  option: {
    backgroundColor: palette?.menuItem?.backgroundColor?.default,
    color: palette?.menuItem?.textColor?.default,
    fontSize: 16,
    minHeight: 40,

    '& + &': {
      borderTop: `0.5px solid ${palette?.menuItem?.borderColor?.default}`,
    },

    '&:hover': {
      color: palette?.menuItem?.textColor?.default,
      backgroundColor: palette?.menuItem?.backgroundColor?.hovered,
    },

    '&[aria-selected="true"], &[aria-selected="true"]:hover': {
      color: palette?.menuItem?.textColor?.active,
      backgroundColor: palette?.menuItem?.backgroundColor?.active,
    },
    '&[data-focus="true"], &[aria-selected="true"]:hover': {
      color: palette?.menuItem?.textColor?.default,
      backgroundColor: palette?.menuItem?.backgroundColor?.hovered,
    },
  },
  popupIndicator: {
    width: 24,
    height: 24,
    padding: 0,

    '& svg': {
      width: 24,
      height: 24,
    },
  },

  clearIndicator: {
    width: 24,
    height: 24,
    padding: 0,

    '& svg': {
      width: 24,
      height: 24,
    },
  },
  root: {
    '& .MuiFormLabel-root': {
      lineHeight: 1.58,
    },
    '& .MuiOutlinedInput-root': {
      padding: '0 40px 0 3px !important',
      minHeight: 40,
      borderRadius: 6,
      '& .MuiAutocomplete-input': {
        padding: '7.5px 4px 7.5px 5px',
        minHeight: 30,
        height: 'auto',
        boxSizing: 'border-box',
      },
      '&.Mui-disabled': {
        '&.MuiButtonBase-root.MuiChip-root': {
          opacity: 1,
          pointerEvents: 'none',
          color: palette?.chipPalette.textColor.disabled,
          backgroundColor: palette?.chipPalette.backgroundColor.disabled,
          borderColor: palette?.chipPalette.borderColor.disabled,
        },
      },
    },
    '& .MuiAutocomplete-tag': {
      margin: '2px 4px 0 2px',
    },
  },
});
