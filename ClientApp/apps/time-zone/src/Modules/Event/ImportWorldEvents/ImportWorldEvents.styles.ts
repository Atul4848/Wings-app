import { Theme, makeStyles } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  paperSize: {
    width: '500px',
  },
  button: {
    color: 'red',
  },
  rightContent: {
    gap: 0,
  },
}));
