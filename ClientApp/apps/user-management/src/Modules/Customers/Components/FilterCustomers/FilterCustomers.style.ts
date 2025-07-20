import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles((theme) => ({
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
      backgroundColor: '#1976D2',
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
  textSection: {
    marginBottom: 10,
    '& input': {
      height: 40,
    },
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: theme.palette.background.paper,
      width: 280,
      padding: '0 15px 15px',
      marginTop: '10px'
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
  flexRowSection: {
    display: 'flex',
    overflow: 'hidden',
  },
  redioSection: {
    background: '#F2F2F2',
    padding: '0 15px',
    marginRight: 10,
    width: '100%',
    borderRadius: 5,
    '&:last-child': {
      marginRight: 0,
    },
    '& .MuiRadio-colorPrimary.Mui-checked': {
      color: '#1976D2',
    },
  },
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
  btnSection: {
    '& button': {
      border: 0,
      paddingLeft: 0,
      color: '#1976d2',
      backgroundColor: 'transparent',
      '&:hover': {
        color: '#1976d2',
        backgroundColor: 'transparent !important',
        textDecoration: 'underline',
      },
    },
  },
}));
