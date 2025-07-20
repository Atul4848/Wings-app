import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: '300px',
    padding: theme.spacing(3),
  },
  root: {
    margin: theme.spacing(0.6),
  },
}));
