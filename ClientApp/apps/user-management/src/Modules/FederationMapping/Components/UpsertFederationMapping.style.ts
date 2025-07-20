import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) =>({
  modalDetail: {
    paddingBottom: '20px',
    alignContent: 'center',
    justifyContent: 'space-around',
  },
  btnContainer: {
    display: 'flex',
    width: '100%',
    justifyContent: 'flex-end',
    '& button': {
      '&:hover': {
        backgroundColor: palette.basicPalette.primaryLight,
      },
      backgroundColor: palette.basicPalette.primary,
      height: 40,
      width: 100,
      textTransform: 'capitalize',
    },
  },
  inputControl: {
    paddingRight: 0,
  },
  modalRoot: {
    '& div.MuiPaper-root': {
      background: palette.background.paper,
      width: '630px',
    },
  },
  headerWrapper:{
    '& h3':{
      fontSize: 18,
      fontWeight: 600,
      color: palette.grey.A700,
    },
  },
}));
