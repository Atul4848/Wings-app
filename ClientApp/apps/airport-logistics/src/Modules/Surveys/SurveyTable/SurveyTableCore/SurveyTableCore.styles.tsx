import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  headerCell: {
    background: palette.primary.main,
    color: palette.primary.contrastText,
  },
  container: {
    height: '100%',
    width: '100%',

    '& div.ag-theme-alpine': {
      height: '100%',
    },

    '& div.ag-row': {
      cursor: 'pointer',
      'min-height': 40,
      color: palette.text.primary,
    },

    '& div.ag-row-even': {
      background: palette.grey['A400'],
    },

    '& div.ag-row-hover': {
      background: palette.grey['A100'],
      '& div.ag-cell': {
        color: palette.primary.contrastText,
      },
    },

    '& div.ag-header-cell-label .ag-header-cell-text': {
      'whiteSpace': 'break-spaces',
    },
    
    '& div.ag-body-viewport::-webkit-scrollbar': {
      width: 16,
    },
  },
}));
