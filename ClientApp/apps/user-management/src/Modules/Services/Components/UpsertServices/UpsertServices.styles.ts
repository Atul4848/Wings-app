import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  flexWrap: {
    flexWrap: 'wrap',
    display: 'flex',
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
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
    '& .MuiFormControlLabel-label':{
      color: theme.palette.grey.A700,
      fontSize: 13,
      fontWeight: 100,
      marginLeft: 5,
    },
    '& .MuiFormControlLabel-root':{
      marginLeft: 0,
    },
  },
  label:{
    color: theme.palette.grey.A700,
    fontSize: 13,
    marginTop: 38,
    position: 'relative',
    right: 107,
  },
  enabled:{
    flexBasis: 'auto',
    paddingRight: 0,
    position: 'relative',
    left: 60,
    top: 6,
    '& .MuiSwitch-track':{
      backgroundColor: theme.palette.basicPalette.additionalColors.lightBlue,
    },
    '& .MuiSwitch-thumb':{
      color: theme.palette.basicPalette.additionalColors.gray,
    },
    '& .MuiSwitch-colorPrimary.Mui-checked + .MuiSwitch-track':{
      backgroundColor: theme.palette.basicPalette.primary,
      opacity: 0.7,
    },
    '& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb':{
      color: theme.palette.basicPalette.primary,
    },
  },
  fullFlex:{
    flexBasis: '75%',
    paddingRight: 0,
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
    '& p': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: 12,
      top: 0,
      marginBottom: 4,
    },
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 15,
    color: theme.palette.grey.A700,
  },
  titleHeading:{
    fontSize: 24,
    fontWeight: 600,
    marginBottom: 0,
    color: theme.palette.grey.A700,
    position: 'relative',
    top: 11,
  },
  flexRowSection: {
    position: 'absolute',
    '& div': {
      top: 30,
      paddingRight: 16,
      position: 'relative',
    },
    '& button': {
      '&:first-child': {
        backgroundColor: 'transparent',
        border: `1px solid ${theme.palette.basicPalette.primary}`,
        color: `${theme.palette.basicPalette.primary} !important`,
        height: 40,
        width: 100,
        '&:hover': {
          backgroundColor: 'rgba(99, 164, 255, 0.1) !important',
        },
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
}));

