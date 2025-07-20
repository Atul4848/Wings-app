import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  addBtn: {
    '& button': {
      backgroundColor: 'transparent',
      marginTop: 20,
      border: '1px solid #1976D2',
      color: '#1976D2 !important',
      height: 40,
      width: '100%',
      boxShadow: 'none',
      textTransform: 'capitalize',
      '&:hover': {
        backgroundColor: '#EFF6FF !important',
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.background.paper,
      border: '1px solid #B5B5B5 ',
      color: '#B5B5B5  !important',
    },
  },
  btnSave: {
    top: 12,
    position: 'relative',
    '& button': {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'capitalize',
      color: theme.palette.background.paper,
      marginLeft: 100,
      marginRight: 15,
      width: 100,
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      padding: '4px 20px',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
        boxShadow: 'none',
      },
    },
    '& .Mui-disabled': {
      backgroundColor: '#B5B5B5',
      color: theme.palette.background.paper,
    },
  },
  autoCompleteContainer:{
    '& div.MuiAutocomplete-inputRoot':{
      marginRight: 20,
      width: 167,
    },  
    '& input': {
      height: 40,
      fontSize: 12,
    },
  },
  modaldetail: {
    padding: '7px 30px 30px',
  },
  modalheading: {
    paddingBottom: '5px',
    color: theme.palette.grey.A700,
    fontWeight: 600,
    fontSize: 12,
  },
  userGroupWidth: { width: 720 },
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
    background: theme.palette.basicPalette.primaryDark,
    color: theme.palette.background.default,
    height: 60,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    '& h3': {
      justifyContent: 'center',
    },
    '& div': {
      marginRight: '20px !important',
      color: theme.palette.background.default,
    },
  },
  boxContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottom: `1px solid ${theme.palette.divider}`,
    alignItems: 'center',
  },
  filledError: {
    color: theme.palette.error.main,
    fontSize: 14,
      
  },
  autoCompleteError: {
    '& fieldset': {
      border: `1px solid ${theme.palette.error.main}`,
    },
  },
  deleteBtn:{
    color: theme.palette.basicPalette.primary,
    position: 'relative',
    top: 11,
    '&:hover': {
      color: theme.palette.basicPalette.primaryLight,
      backgroundColor: 'transparent',
    },
    '& svg': {
      width: 16,
    },
  },
}));
