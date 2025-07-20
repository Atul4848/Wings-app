import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  container: {
    height: 300,
    maxHeight: 500,
  },
  noPadding: {
    paddingLeft: 0,
    paddingRight: 0,
  },
}));
