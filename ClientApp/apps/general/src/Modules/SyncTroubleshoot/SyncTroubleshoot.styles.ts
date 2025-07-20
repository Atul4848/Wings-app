import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  content: {
    backgroundColor: palette.background.paper,
    padding: 15,
    marginTop: 5,
    display: 'flex',
  },
  inputBox: {
    width: 615,
  },
  usernameInput: {
    width: 300,
  },
  btnSubmit: {
    marginLeft: 15,
    marginTop: 19,
  },
  doubleContent: {
    backgroundColor: palette.background.paper,
    padding: 15,
    marginTop: 5,
    '& h6': {
      fontSize: 13,
      color: '#929292',
    },
    '& button': {
      marginLeft: 0,
      marginTop: 0,
    },
    '& .MuiFormControl-root': {
      marginRight: 15,
    },
  },
  singleContent: {
    backgroundColor: palette.background.paper,
    padding: 15,
    marginTop: 5,
    display: 'flex',
    '& h6': {
      fontSize: 13,
      color: '#929292',
    },
    '& button': {
      marginLeft: 0,
      marginTop: 3,
    },
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: palette.background.paper,
    padding: 15,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  heading: {
    fontSize: 22,
  },
  icon: {
    width: 30,
    marginRight: 10,
    fontSize: 30,
  },
  subSection: {
    display: 'flex',
    alignItems: 'center',
  },
  formSection: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '100%',
  },
  formDetail: {
    flexBasis: '33.3%',
    paddingRight: '24px',
    paddingBottom: '24px',
  },
}));
