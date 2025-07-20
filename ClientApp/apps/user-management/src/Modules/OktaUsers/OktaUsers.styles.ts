import { makeStyles, Theme } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette, spacing }: Theme) => ({
  mainContainer: {
    display: 'flex',
  },
  mainroot: {
    display: 'flex',
    height: '100%',
    width: '100%',
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  box: {
    width: '310px',
    minWidth: '310px',
    paddingLeft: '15px',
  },
  advancedIcon: {
    margin: '3px 0 0 10px',
    width: '24px',
    cursor: 'pointer',
  },
  searchInputControl: {
    width: 'calc(100% - 190px)',
    '& ~ div': {
      minWidth: '185px',
      margin: '0 !important',
    },
  },
  rootControl: {
    flexDirection: 'column',
  },
  modalDetail: {
    paddingBottom: '20px',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.default,
      width: '630px',
    },
  },
  fullFlex: {
    paddingBottom: spacing(1),
    paddingRight: spacing(0),
    flexBasis: '100%',
    width: '80%',
  },
  rowContainer: {
    display: 'flex',
    alignContent: 'center',
  },
  exportBtn: {
    marginTop: 4,
  },
  mainroot: {
    display: 'flex',
    height: 'calc(100vh - 195px)',
    width: '100%',
    '& div.ag-theme-alpine': {
      height: 'calc(100vh - 235px)',
      '& div.MuiTablePagination-selectRoot': {
        marginRight: 0,
      },
      '& .MuiTablePagination-caption div div': {
        '&:first-child': {
          position: 'relative',
          left: 35,
        },
        '&:last-child': {
          position: 'relative',
          left: 65,
          width: 130,
          textAlign: 'center',
        },
      },
      '& div.MuiTablePagination-actions': {
        '& button': {
          '&:first-child': {
            position: 'relative',
            right: 130,
          },
        },
      },
    },

    '& div.ag-popup': {
      height: 'auto',
    },

    '& div.ag-body-viewport::-webkit-scrollbar-track': {
      marginTop: 5,
      borderRadius: 10,
      backgroundColor: palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar': {
      width: 8,
      backgroundColor: palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar-thumb': {
      borderRadius: 10,
    },
    '& div.ag-cell': {
      color: palette.grey.A700,
      '&:nth-child(5) > div > div': {
        width: 170,
        padding: '0px',
        marginTop: 9,
      },
    },
    '& div.ag-header-row': {
      background: palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-react-container svg': {
      fill: palette.basicPalette.primary,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
    '& div.MuiChip-root' :{
      width: 170,
      padding: '0px',
      marginTop: 5,
    },
    '& div.customerChip div.MuiChip-root': {
      width: 'auto',
      alignItems: 'center',
    },
  },
}));
