import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  buttonContainer: {
    display: 'flex',
    justifyContent: 'end',
    marginBottom: theme.spacing(1),
  },
  gridWrapper: {
    height: '100%',
  },
}));
