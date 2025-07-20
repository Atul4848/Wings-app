import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: any) => ({
  btnContainer:{
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
  },
  btnContainerSave: {
    '& button': {
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      width: 100,
      textTransform: 'capitalize',
      '& span.MuiButton-label': {
        fontSize: 14,
      },
    },
    '& .MuiButton-contained.Mui-disabled': {
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.background.paper,
    },
  },
  filledError: {
    color: theme.palette.error.main,
    fontSize: 14,
  },
  searchContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:first-child': {
      flexBasis: '100%',
      paddingRight: 0,
    },
    '& input': {
      height: 40,
      fontSize: 12,
    },
  },
  searchContainerRole: {
    paddingBottom: theme.spacing(3),
    paddingRight: 0,
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label.MuiInputLabel-root': {
      margin: 0,
      fontSize: 12,
    },
  },
  titleHeading: {
    fontWeight: 600,
    color: theme.palette.grey.A700,
    fontSize: 12,
  },
  btnContainerCancel: {
    '& button': {
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      width: 100,
      marginRight: 20,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
  },
  dialogWidth: { width: 700 },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      '& h3':{
        fontSize: 18,
        fontWeight: 600,
        color: theme.palette.grey.A700,
      },
    },
  },
  headerWrapper:{
    '& svg.MuiSvgIcon-root':{
      display: 'none',
    },
  },
  label:{
    color: theme.palette.grey.A700,
    fontSize: 18,
    fontWeight: 600,
    width: '100%',
    marginTop: 0,
    marginBottom: 15,
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:first-child': {
      flexBasis: '100%',
      paddingRight: 0,
    },
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: '12px !important',
    },
    '& div.MuiAutocomplete-tag': {
      borderRadius: 4,
      maxHeight: 30,
      height: 30,
    },
  },
  formatContainer: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  '@global': {
    '.MuiAutocomplete-option': {
      display: 'block',
    }
  },
  roleOptionHeader: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  roleOptionType: {
    opacity: 0.75,
    fontSize: 10,
    fontFamily: 'monospace',
    letterSpacing: -0.3,
  },
  roleOptionDescription: {
    fontSize: 12,
    wordBreak: 'break-word',
    whiteSpace: 'normal',
    marginBottom: 2,
  },
  trialTitle: {
    color: theme.palette.grey.A700,
    fontSize: 18,
    fontWeight: 600,
    width: '100%',
    marginTop: 0,
    marginBottom: 4,
  },
  trialCheckbox: {
    flexBasis: '100%',
    paddingBottom: 0,
    marginLeft: -10,
    overflow: 'hidden',

    '& label': {
      margin: '0 !important',
    },

    '& input': {
      height: 'auto !important',
    },
  },
  dateFromContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '&:first-child': {
      flexBasis: '100%',
      paddingRight: 0,
    },
  },
  dateToContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: 0,
    flexBasis: '50%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  validityTitle: {
    color: theme.palette.grey.A700,
    fontSize: 18,
    fontWeight: 600,
    width: '100%',
    marginTop: 15,
    marginBottom: 8,
  }
}));