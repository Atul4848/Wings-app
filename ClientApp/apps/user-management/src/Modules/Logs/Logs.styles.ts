import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) =>({
  userListContainer: {
    background: palette.background.paper,
    padding: 20,
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
        paddingLeft: '21px !important',
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
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  flexSection: {
    display: 'flex',
  },
  spaceSection:{
    marginRight: 10,
  },
  filterBtn: {
    padding: '0px 0px 0px 10px',
    minWidth: 40,
    marginRight: 7,
    position: 'relative',
    height: 30,
    marginLeft: 0,
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'calc(100% - 0px)',
    '& button': {
      boxShadow: 'none',
      height: 40,
    },
    '& button.MuiButton-containedPrimary':{
      bottom: 4,
    },
    '& > div': {
      display: 'block',
    },
    '& > div > div > div': {
      width: '100%',
    },
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
        backgroundColor: palette.basicPalette.primary,
        fill: palette.basicPalette.whiteText,
        width: 40,
        height: 40,
        padding: 8,
        position: 'relative',
        left: 7,
        borderRadius: 3,
      },
    },
  },
}));
