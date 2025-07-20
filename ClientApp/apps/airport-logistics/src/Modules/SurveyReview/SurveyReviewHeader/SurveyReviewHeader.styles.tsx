import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: '15px 20px',
    borderRadius: '4px',
    backgroundColor: palette.primary.main,
    color: palette.primary.contrastText,
  },
}));
