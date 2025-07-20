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
    '& button': {
      backgroundColor: theme.palette.basicPalette.primary,
      width: 74,
    },
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 0,
    marginTop: 16,
    color: theme.palette.grey.A700,
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      width: 280,
      position: 'absolute',
      right: 192,
      top: 110,
      padding: '0 15px 15px',
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
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
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
}));
