import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 15px',
    background: palette.grey['A100'],
    color: palette.primary.contrastText,
  },
  item: {
    marginRight: '20px',
  },
}));