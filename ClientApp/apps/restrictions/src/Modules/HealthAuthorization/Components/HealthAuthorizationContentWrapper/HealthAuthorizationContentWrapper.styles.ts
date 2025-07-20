import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(() => ({
  root: {
    border: '.5px solid lightgray',
    margin: '24px 24px 12px 12px',
    height: 'calc(100vh - 50px)',
  },
  content: {
    paddingLeft: 16,
    paddingTop: 16,
  },
  title: {
    padding: '16px 0',
    borderBottom: '.5px solid lightgray',
    paddingLeft: 16,
    fontWeight: 600,
    '& h6': {
      fontWeight: 600,
    },
  },
}));
