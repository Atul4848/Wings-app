import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles({
  root: {
    height: '100%',
  },
  masterDetails: {
    '& > div': {
      maxHeight: 'none',
      padding: 0,
    },
  },
  gridContainer: {
    height: '70%',
  },
  customHeight: {
    height: 'calc(100vh - 249px)',
  },
});
