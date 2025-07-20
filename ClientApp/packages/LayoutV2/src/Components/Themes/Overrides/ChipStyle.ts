// theme-overrides/chipCommonStyles.ts
import { Theme } from '@mui/material/styles';

export const getChipStyles = (palette: Theme['palette']) => {
  const _palette = palette?.chipPalette;

  return {
    root: {
      color: _palette.textColor.default,
      backgroundColor: _palette.backgroundColor.default,
      borderColor: _palette.borderColor.default,
      padding: '2px !important',
      minWidth: 40,
      marginTop: '2px !important',
      marginBottom: '2px !important',
      maxHeight: 30,
      height: 30,
      borderRadius: 4,

      '&.Mui-disabled': {
        opacity: 1,
        pointerEvents: 'none',
        color: '#ffffff',
        borderColor: '#999ca5',
        backgroundColor: '#999ca5',
      },
      '&:disabled': {
        opacity: 1,
        pointerEvents: 'none',
        color: _palette.textColor.disabled,
        backgroundColor: _palette.backgroundColor.disabled,
        borderColor: _palette.borderColor.disabled,
      },
      '&:hover': {
        cursor: 'auto',
        '& .MuiChip-deleteIcon': {
          display: 'block',
        },
      },
    },
    clickable: {
      '&:hover': {
        color: _palette.textColor.hovered,
        backgroundColor: _palette.backgroundColor.hovered,
        borderColor: _palette.borderColor.hovered,
      },
      '&:focus': {
        color: _palette.textColor.hovered,
        backgroundColor: _palette.backgroundColor.hovered,
        borderColor: _palette.borderColor.hovered,
      },
      '&:active': {
        boxShadow: 'none !important',
      },
    },
    deletable: {
      '&:focus': {
        color: _palette.textColor.default,
        backgroundColor: _palette.backgroundColor.default,
        borderColor: _palette.borderColor.default,
      },
    },
    label: {
      paddingBottom: 2,
      fontSize: '14px',
      paddingTop: 1,
    },
    deleteIcon: {
      width: 18,
      height: 18,
      color: _palette.iconColor.default,
      opacity: '0.8',
      display: 'none',
      '&:hover': {
        color: _palette.iconColor.default,
        opacity: '1',
      },
    },
  };
};
