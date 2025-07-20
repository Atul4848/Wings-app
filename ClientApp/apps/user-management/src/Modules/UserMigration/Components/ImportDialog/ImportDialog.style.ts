import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  modalDetail: {
    display: 'flex',
    paddingBottom: '20px',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  headerWrapper:{
    color: palette.grey.A700,
    '& svg': {
      display: 'none',
    },
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.paper,
      color: palette.grey.A700,
      width: '481px',
      paddingBottom: 0,
    },
    '& span.MuiFormControlLabel-label': {
      fontSize: 14,
      color: palette.grey.A700,
    },
  },
  textLabel: {
    width: '160px',
  },
  cardRowBtn: {
    display: 'flex',
    justifyContent: 'end',
  },
  btnAlign: {
    backgroundColor: '#1976D2',
    textTransform: 'capitalize',
    height: 40,
    width: 150,
    marginLeft: 50,
  },
  CheckBoxSection: {
    position: 'relative',
    right: 58,
  },
  redioSection: {
    color: palette.grey.A700,
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'initial',
    '&:last-child': {
      marginRight: 0,
    },
    '& .MuiRadio-colorPrimary.Mui-checked': {
      color: '#1976D2',
    },
  },
  btnContainer: { display: 'flex',
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
