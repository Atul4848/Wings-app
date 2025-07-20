import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
    paddingBottom: 15,
    marginTop: 20,
    '& h5': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
    },
  },
  mainContainer: {
    '& div.MuiPaper-root': {
      boxShadow: 'none',
    },
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  scrollable: {
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: 20,
    borderTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 15,
    color: theme.palette.grey.A700,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 15,
    marginTop: 16,
    color: theme.palette.grey.A700,
  },
  oracleSection: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label': {
      fontWeight: '400',
      color: theme.palette.grey.A700,
      fontSize: '12px !important',
    },
    '& div.MuiInputAdornment-positionEnd svg': {
      color: theme.palette.basicPalette.primary,
    },
    '& label.MuiInputLabel-root.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span.MuiFormControlLabel-label.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span': {
      fontWeight: 600,
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
    '& span.MuiChip-label': {
      color: theme.palette.background.paper,
    },
    '& svg.MuiChip-deleteIconColorPrimary': {
      color: theme.palette.background.paper,
    },
    '& div.MuiAutocomplete-tag': {
      borderRadius: 4,
      maxHeight: 30,
      height: 30,
    },
  },
  active: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.green,
      fontWeight: '600',
    },
  },
  staged: {
    '& input': {
      color: theme.palette.basicPalette.primary,
      fontWeight: '600',
    },
  },
  deprovisioned: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.gray,
      fontWeight: '600',
    },
  },
  passwordExpired: {
    '& input': {
      color: theme.palette.basicPalette.accent,
      fontWeight: '600',
    },
  },
  deleted: {
    '& input': {
      color: theme.palette.basicPalette.accent,
      fontWeight: '600',
    },
  },
  recovery: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.orange,
      fontWeight: '600',
    },
  },
  provisioned: {
    '& input': {
      color: theme.palette.basicPalette.primary,
      fontWeight: '600',
    },
  },
  lockedOut: {
    '& input': {
      color: theme.palette.basicPalette.accent,
      fontWeight: '600',
    },
  },
  suspended: {
    '& input': {
      color: theme.palette.basicPalette.additionalColors.gray,
      fontWeight: '600',
    },
  },
  groupContainer: {
    width: '100%',
  },
  groupSection: {
    display: 'flex',
    flexWrap: 'inherit',
    width: '35%',
  },
  flexRowSection: {
    position: 'absolute',
    '& button.Mui-disabled':{
      backgroundColor: `${theme.palette.grey[500]} !important`,
      opacity: 0.7,
    },
    '& div': {
      bottom: 126,
      position: 'relative',
    },
    '& button': {
      '&:first-child': {
        display: 'none',
      },
      '&:last-child': {
        '&:hover': {
          backgroundColor: theme.palette.basicPalette.primaryLight,
        },
        backgroundColor: theme.palette.basicPalette.primary,
        height: 40,
        width: 100,
        '& span.MuiButton-label': {
          fontSize: 14,
        },
      },
    },
  },
  csdBtn: {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'end',
    right: 159,
  },
  btnPosition: {
    position: 'relative',
    bottom: 125,
    display: 'flex',
    '& button': {
      fontSize: 14,
      fontWeight: 600,
      textTransform: 'capitalize',
      color: theme.palette.background.paper,
      marginLeft: 10,
      backgroundColor: theme.palette.basicPalette.primary,
      height: 40,
      padding: '4px 20px',
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.grey[500],
      color: theme.palette.background.paper,
      opacity: 0.7,
    },
  },
  resetBtn: {
    '& button': {
      backgroundColor: 'transparent',
      border: `1px solid ${theme.palette.basicPalette.primary}`,
      color: `${theme.palette.basicPalette.primary} !important`,
      height: 40,
      '&:hover': {
        backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.grey[500]}`,
      color: `${theme.palette.grey[500]} !important`,
      opacity: 0.7,
    },
  },
  rolesField: {
    flexBasis: '50%',
  },
  searchContainer: {
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& .MuiAutocomplete-root':{
      width: '35%',
    },
    '& input': {
      height: 40,
      fontSize: 12,
    },
  },
  titleHeading: {
    color: theme.palette.grey.A700,
    fontSize: 12,
    marginBottom: 5,
    fontWeight: 600,
  },
  inputControlGroup: {
    color: theme.palette.grey.A700,
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    flexBasis: '25%',
    overflow: 'inherit',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    '& input': {
      height: 40,
      fontSize: 12,
    },
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: '12px !important',
    },
    '& label.MuiInputLabel-root.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span.MuiFormControlLabel-label.Mui-disabled': {
      color: theme.palette.grey.A700,
    },
    '& span': {
      fontWeight: 600,
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
    '& span.MuiIconButton-label': {
      color: theme.palette.basicPalette.additionalColors.gray,
    },
  },
  titleBox: {
    marginBottom: 10,
  },
  cardRowBtn: {
    display: 'flex',
    justifyContent: 'end',
    paddingRight: 0,
  },
  btnContainer: {
    display: 'flex',
  },
  btnAlign: {
    backgroundColor: '#1976D2',
    textTransform: 'capitalize',
    height: 40,
    width: 150,
    marginLeft: 50,
  },
  overwriteBox:{
    '& span.MuiFormControlLabel-label':{
      fontSize: 12,
    }
  },
  btnSection: {
    '& button': {
      border: 0,
      paddingLeft: 0,
      color: '#1976d2',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      textTransform: 'capitalize',
      '&:hover': {
        color: '#1976d2',
        backgroundColor: 'transparent !important',
        textDecoration: 'underline',
        boxShadow: 'none',
      },
    },
  },
}));