import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  link: {
    color: theme.palette.primary.main,
  },
  root: {
    flex: 1,
  },
}));
