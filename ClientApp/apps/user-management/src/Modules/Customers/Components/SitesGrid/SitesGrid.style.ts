import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  mainRoot: {
    height: 'calc(100vh - 485px)',
    maxHeight: 'calc(100vh - 485px)',
    minHeight: '210px',
    '& div.ag-header-cell': {
      '&:last-child': {
        '& div.ag-react-container img': {
          display: 'none',
        },
      },
    },
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
    justifyContent: 'end',
    alignItems: 'center',
    marginBottom: 10,
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
    '& div.ag-body-horizontal-scroll-viewport': {
      overflow: 'hidden',
    },
  },
}));
