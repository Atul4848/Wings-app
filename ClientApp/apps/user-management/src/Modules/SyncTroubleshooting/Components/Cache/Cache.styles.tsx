import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  content: {
    backgroundColor: palette.background.paper,
    padding: 15,
  },
  usernameInput: {
    width: 200,
  },
  btnSubmit: {
    width: 80,
    marginLeft: 15,
    marginTop: 23,
  },
  scrollable: {
    border: `1px solid ${palette.divider}`,
    marginBottom: 20,
    borderTop: 0,
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
  titleBox: {
    marginBottom: 10,
  },
  infoIcon: {
    display: 'flex',
    fontSize: 11,
    color: palette.basicPalette.textColors.secondary,
    opacity: 0.7,
    alignItems: 'end',
    marginTop: 5,
    '& > div': {
      width: 12,
      marginRight: 4,
    }
  },
}));
