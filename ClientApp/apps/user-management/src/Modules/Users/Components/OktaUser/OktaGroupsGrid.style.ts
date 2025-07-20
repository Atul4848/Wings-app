import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  mainroot: {
    height: 'calc(100vh - 485px)',
    maxHeight: 'calc(100vh - 485px)',
    minHeight: '210px',
    '& div.ag-header-cell': {
      '&:first-child': {
        '& div.ag-react-container': {
          display: 'flex',
          justifyContent: 'center',
        },
        '& div.ag-react-container img': {
          display: 'none',
        },
      },
    },
    '& div.ag-cell': {
      '&:last-child': {
        '& div.ag-react-container': {
          display: 'flex',
          justifyContent: 'center',
        },
      },
    },
  },
  searchContainer:{
    display: 'flex',
    alignItems: 'baseline',
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    color: theme.palette.grey.A700,
  },
  manageRoleBtn: {
    '& button': {
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
    },
  },
  containerFlex: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  oktaContainer: {
    padding: 15,
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      '&:last-child': {
        '& div.ag-react-container svg': {
          fill: theme.palette.basicPalette.primary,
        },
      },
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