import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    '& > div': {
      height: '25px',
      width: '100px',
    },
  },
}));
