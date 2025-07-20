import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(({ palette, spacing }) => ({
  root: {
    display: 'flex',
    flexBasis: '66%',
    alignItems: 'center',
    paddingBottom: spacing(0.5),
  },
  labelRoot: {
    fontStyle: 'italic',
    color: palette.grey['600'],
    fontSize:'12px',
  },
  icon: {
    fontSize: '1.2rem',
    color: palette.grey['600'],
    marginRight: 3,
  },
}));
