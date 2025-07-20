import { makeStyles } from '@material-ui/core/styles';

export const styles = makeStyles(({ palette }) => ({
  content: {
    backgroundColor: palette.background.paper,
    padding: 15,
    marginTop: 5,
  },
  usernameInput: {
    width: 200,
  },
  btnSubmit: {
    width: 80,
    marginLeft: 15,
    marginTop: 19,
  },
}));
