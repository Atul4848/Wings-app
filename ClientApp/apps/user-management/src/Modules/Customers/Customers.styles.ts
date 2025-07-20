import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  userListContainer: {
    background: theme.palette.background.paper,
    padding: 20,
  },
  searchContainer:{
    display: 'flex',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
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
        backgroundColor: theme.palette.basicPalette.primary,
        fill: theme.palette.basicPalette.whiteText,
        width: 40,
        height: 40,
        padding: 8,
        position: 'relative',
        left: 7,
        borderRadius: 3,
      },
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
      backgroundColor: theme.palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar': {
      width: 8,
      backgroundColor: theme.palette.background.paper,
    },
    '& div.ag-body-viewport::-webkit-scrollbar-thumb': {
      borderRadius: 10,
    },
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      '&:nth-child(3) > div > div': {
        padding: '0px',
        marginTop: 9,
      },
      '&:last-child': {
        paddingTop: 9,
        paddingLeft: '21px !important',
      },
    },
    '& div.ag-header-row': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-header-viewport': {
      background: theme.palette.basicPalette.additionalColors.gray,
    },
    '& div.ag-react-container svg': {
      fill: theme.palette.basicPalette.primary,
    },
    '& div.ag-row-odd': {
      background: 'transparent',
    },
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  searchInputControl: {
    '& div.MuiOutlinedInput-adornedEnd': {
      height: 40,
      paddingLeft: 15,
    },
  },
  rootControl: {
    flexDirection: 'column',
  },
  filterBtn: {
    padding: '0px 0px 0px 10px',
    minWidth: 40,
    position: 'relative',
    height: 40,
    boxShadow: 'none',
    bottom: 3,
  },
}));
