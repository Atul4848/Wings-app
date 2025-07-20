import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: 1,
  },
  button: {
    right: 0,
    top: theme.spacing(4),
  },
}));
