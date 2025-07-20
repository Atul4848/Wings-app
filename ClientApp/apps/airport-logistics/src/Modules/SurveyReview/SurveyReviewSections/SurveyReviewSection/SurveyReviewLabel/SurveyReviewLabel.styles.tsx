import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  unApproved: {
    fontSize: '1rem',
    color: palette.warning.main,
    marginBottom: 7,
  },
  approved: {
    fontSize: '1rem',
    color: palette.success.main,
    margin: '7px 0',
  },
}));
