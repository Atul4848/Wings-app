import { makeStyles, Theme } from '@material-ui/core';
export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'end',
    gap: '5px',
  },
  buttonRoot: {
    minWidth: 40,
    width: 40,
  },
}));
