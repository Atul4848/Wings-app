import { makeStyles, lighten } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    color: palette.primary.main,
    marginRight: '20px',
    display: 'flex',
  },
  button: {
    backgroundColor: palette.grey['A400'],
    color: palette.primary.contrastText,
    margin: '0 5px',
    '&:hover': {
      backgroundColor: palette.primary.main,
    },
    '&:hover span': {
      color: palette.primary.contrastText,
    },
  },
  editButton: {
    backgroundColor: palette.success.main,
    color: palette.primary.contrastText,
    '&:hover': {
      backgroundColor: lighten(palette.success.main, .2),
    },
    '&:hover span': {
      color: palette.primary.contrastText,
    },
  },
}));
