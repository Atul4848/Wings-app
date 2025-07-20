import { makeStyles, Theme } from '@material-ui/core/styles';

export const styles = makeStyles((theme: Theme) => ({
  modalDetail: {
    padding: 15,
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    '& button': {
      backgroundColor: theme.palette.basicPalette.primary,
      width: 74,
    },
  },
  inputControl: {
    color: theme.palette.grey.A700,
    paddingBottom: 10,
    '& label': {
      fontWeight: '600',
      color: theme.palette.grey.A700,
      fontSize: 12,
    },
    '& p': {
      color: theme.palette.grey.A700,
      fontSize: 14,
      padding: 0,
    },
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      width: 320,
      position: 'absolute',
      right: 192,
      padding: 0,
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
  title: {
    fontSize: 14,
    margin: '89px 0',
    display: 'flex',
    justifyContent: 'center',
  },
  flexRow: {
    display: 'flex',
    flex: 1,
    width: '100%',
    overflowY: 'auto',
    flexDirection: 'column',
  },
  btnSection: {
    '& a': {
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
