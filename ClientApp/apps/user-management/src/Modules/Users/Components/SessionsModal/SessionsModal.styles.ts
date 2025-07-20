import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: 1150,
    height: 550,
    margin: 'auto',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      padding: 0,
    },
    '& div.MuiCard-root': {
      border: 0,
      marginBottom: 8,
      '@media (max-width: 1200px)': {
        flexBasis: '50%',
        '&:nth-child(2n+0)': {
          paddingRight: 0,
        },
      },
      '@media (max-width: 768px)': {
        flexBasis: '100%',
        paddingRight: 0,
      },
    },
    '& div.MuiCard-root.cardContainer': {
      background: theme.palette.basicPalette.background,
    },
  },
  headerWrapper: {
    marginBottom: 20,
    background: theme.palette.basicPalette.primary,
    color: theme.palette.background.default,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '& h3': {
      justifyContent: 'center',
    },
    '& div': {
      display: 'none',
    },
  },
  content: {
    padding: '0 20px',
  },
  sessionContainer: {
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
    '& div.ag-paging-panel': {
      display: 'flex',
      justifyContent: 'left',
    },
    '& span.ag-paging-row-summary-panel': {
      marginTop: 10,
    },
    '& span.ag-paging-page-summary-panel': {
      marginTop: 10,
    },
  },
  mainroot: {
    height: 400,
    '& div.ag-header-cell': {
      '&:last-child': {
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
          height: '100%',
          alignItems: 'center'
        },
      },
    },
  },
  btnAlign: {
    backgroundColor: theme.palette.basicPalette.primary,
    textTransform: 'capitalize',
    height: 40,
    width: 150,
    marginLeft: 50,
    position: 'absolute',
    right: 20,
    boxShadow: 'none',
    bottom: 18,
  },
}));