import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  sessionListContainer: {
    background: theme.palette.background.paper,
    padding: 20,
  },
  headerContainer: {
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
  mainroot: {
    display: 'flex',
    height: 'calc(100vh - 195px)',
    width: '100%',
    '& div.ag-theme-alpine': {
      height: 'calc(100vh - 235px)',
    },
    '& div.ag-cell': {
      color: theme.palette.grey.A700,
      '&:last-child': {
        paddingTop: 9,
        paddingLeft: '21px !important',
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
  searchContainer:{
    display: 'flex',
  },
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}));
