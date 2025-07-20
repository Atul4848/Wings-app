import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  userListContainer: {
    background: theme.palette.background.paper,
    padding: 20,

    '& .ag-row-selected': {
      backgroundColor: 'var(--ag-selected-row-background-color, rgba(25, 118, 210, .05)) !important',
    },
  },
  searchContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
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
  mainRoot: {
    display: 'flex',
    height: 'calc(100vh - 480px)',
    width: '100%',
    '& div.ag-theme-alpine': {
      height: 'calc(100vh - 520px)',
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
      backgroundColor: theme.palette.divider,
    },
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      '&:last-child': {
        paddingLeft: '10px !important',
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
  filterBtn: {
    padding: '0px 0px 0px 10px',
    minWidth: 40,
    position: 'relative',
    height: 40,
    marginBottom: 8,
    boxShadow: 'none',
  },
  rolesCell: {
    whiteSpace: 'normal',
    lineHeight: '24px!important',
  },
  statusCell: {
    '& .ag-react-container': {
      display: 'flex',
      alignItems: 'center',
    }
  },
  actionCell: {
    paddingLeft: 0,
    lineHeight: 0,
    border: 'none',

    '& .ag-react-container': {
      display: 'flex',
      alignItems: 'center',
    }
  },
}));
