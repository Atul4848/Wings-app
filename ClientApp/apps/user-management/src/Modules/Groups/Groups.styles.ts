import { Theme, makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  headerContainerTop: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.background.default,
    padding: '15px 0px',
    justifyContent: 'space-between',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: 15,
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
  searchContainer:{
    display: 'flex',
  },
  icon: {
    width: 30,
    marginRight: 10,
    fontSize: 30,
  },
  heading: {
    fontSize: 22,
  },
  mainroot: {
    display: 'flex',
    height: '100%',
    width: '100%',
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
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  flexSection: {
    display: 'flex',
    '& button': {
      width : 'max-content',
      backgroundColor: '#1976D2',
      boxShadow: 'none',
      height: 40,
      '&:hover': {
        backgroundColor: '#63A4FF',
      },
    },
  },
}));
