import { makeStyles, Theme } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme: Theme) => ({
  modalDetail: {
    paddingBottom: 0,
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: 25,
    position: 'relative',
    right: 15,
    '& button': {
      backgroundColor: theme.palette.basicPalette.primary,
      width: 74,
    },
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      width: 700,
      position: 'absolute',
      left: 700,
      top: 345,
      padding: 15,
    },
    '& div.MuiBackdrop-root': {
      backgroundColor: 'transparent',
    },
    '& span.MuiFormControlLabel-label': {
      fontSize: 14,
      color: theme.palette.grey.A700,
    },
    '& label.MuiFormControlLabel-root': {
      marginTop: 0,
    },
  },
  headerWrapper: {
    display: 'none',
  },
  flexRow: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  btnSection: {
    '& button': {
      border: 0,
      paddingLeft: 0,
      color: theme.palette.basicPalette.primary,
      backgroundColor: 'transparent',
      '&:hover': {
        color: theme.palette.basicPalette.primary,
        backgroundColor: 'transparent !important',
        textDecoration: 'underline',
      },
    },
  },
  autoContainer:{
    flexBasis: '32%',
    marginRight: 5,
  },
}));