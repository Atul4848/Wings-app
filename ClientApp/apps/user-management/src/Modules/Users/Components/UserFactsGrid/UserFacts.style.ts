import { createStyles, makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.grey.A700,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.grey.A700,
  },
  flexSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectInput: {
    width: 200,
    marginBottom: 10,
  },
  searchContainer:{
    display: 'flex',
    alignItems: 'baseline',
  },
  mainroot: {
    height: 'calc(100vh - 485px)',
    maxHeight: 'calc(100vh - 485px)',
    minHeight: '210px',
  },
  container: {
    padding: 15,
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
    },
    '& div.ag-header-row': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
    '& div.MuiChip-colorPrimary': {
      background: theme.palette.basicPalette.primary,
    },
  },
}));
