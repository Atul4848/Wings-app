import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  chipRoot: {
    '& label': {
      lineHeight: 1.58,
    },
  },
}));
