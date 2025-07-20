import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  customHeight: {
    height: '80%',
  },
  root: {
    height: '100%',
  },
  masterDetails: {
    '& div': {
      maxHeight: 'none',
      padding: 0,
    },
  },
}));
