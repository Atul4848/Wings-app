import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
    '& h5': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
    },
  },
  mainContainer: {
    marginBottom: 20,
    '& div.MuiPaper-root': {
      boxShadow: 'none',
    },
  },
  preferencesTitle: {
    marginBottom: 15,
    color: theme.palette.grey.A700,
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
  },
  csdContainer: {
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: 20,
    padding: 20,
    borderTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 15,
    color: theme.palette.grey.A700,
  },
  profileSection: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  oracleSection: {
    color: theme.palette.grey.A700,
    flexBasis: '25%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  inputControl: {
    color: theme.palette.grey.A700,
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
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: 12,
      margin: 0,
      lineHeight: 'inherit',
    },
    '& p': {
      color: theme.palette.grey.A700,
      fontSize: 14,
    },
    '& div.MuiInputAdornment-positionEnd svg': {
      color: theme.palette.basicPalette.primary,
    },
    '& div.MuiInputAdornment-positionEnd button.MuiIconButton-root.Mui-disabled': {
      display: 'none',
    },
    '& label.MuiInputLabel-root.Mui-disabled': {
      color: theme.palette.grey.A700,
      fontSize: 12,
      opacity: 'inherit',
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
      margin: '0 3px',
      height: 30,
    },
  },
  flexRowSection: {
    position: 'absolute',
    '& button.Mui-disabled':{
      backgroundColor: `${theme.palette.grey[500]} !important`,
    },
    '& div': {
      bottom: 203,
      left: 22,
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
  uvgoSection:{
    '& div.MuiPaper-root': {
      padding: 0,
    },
  },
  searchContainer: {
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
  },
  titleHeading: {
    fontWeight: 600,
    color: theme.palette.grey.A700,
    fontSize: 12,
  },
  csdBtn:{
    position: 'absolute',
    display: 'flex',
    justifyContent: 'end',
    right: 157,
  },
  btnPosition: {
    position: 'relative',
    bottom: 146,
    display: 'flex',
    '& button': {
      textTransform: 'capitalize',
      marginLeft: 10,
      backgroundColor: theme.palette.basicPalette.primary,
      color: theme.palette.background.paper,
      height: 40,
      fontSize: 14,
      fontWeight: 600,
      padding: '4px 20px',
      boxShadow: 'none',
      '&:hover': {
        backgroundColor: theme.palette.basicPalette.primaryLight,
      },
    },
    '& .Mui-disabled': {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.grey[500]}`,
      color: `${theme.palette.grey[500]} !important`,
      opacity: 0.7,
    },
  },
}));