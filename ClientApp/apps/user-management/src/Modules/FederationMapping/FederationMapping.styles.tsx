import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) =>({
  headerContainer: {
    display: 'flex',
    backgroundColor: palette.background.paper,
    marginBottom: 8,
    justifyContent: 'space-between',
    '& div.MuiOutlinedInput-adornedEnd': {
      height: 40,
      paddingLeft: 15,
    },
    '& div.MuiInputAdornment-positionEnd': {
      '& svg': {
        left: 0,
      },
    },
    '& div.MuiInputAdornment-root': {
      position: 'absolute',
      right: 0,
      '& > div': {
        width: 35,
      },
      '& svg': {
        backgroundColor: '#1976D2',
        fill: '#fff',
        width: 40,
        height: 40,
        padding: 8,
        position: 'relative',
        left: 7,
        borderRadius: 3,
      },
    },
  },
  userListContainer: {
    background: palette.background.paper,
    padding: 20,
  },
  searchContainer:{
    display: 'flex',
    '& > div': {
      marginBottom: 0,
    },
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
      '&:last-child': {
        paddingLeft: '13px !important',
        paddingTop: 9,
      },
    },
    '& div.ag-header-row': {
      background: palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: palette.basicPalette.additionalColors.gray,
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
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  btnButton: {
    '& button': {
      height: 40,
    },
  },
}));
