import { makeStyles, Theme } from '@material-ui/core';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    flex: 1,
  },
  mainWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  titleWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  tierWrapper: {
    marginLeft: 10,
    fontSize: 19,
  },
  defaultWrapper: {
    fontSize: 22,
    fontWeight: 600,
  },
  icon: {
    display: 'inline-flex',
    fontSize: '1.2rem',
    color: theme.palette.grey['600'],
    verticalAlign: 'middle',
  },
}));
