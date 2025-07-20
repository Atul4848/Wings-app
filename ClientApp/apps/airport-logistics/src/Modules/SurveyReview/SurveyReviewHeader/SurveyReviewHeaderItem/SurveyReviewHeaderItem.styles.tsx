import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '.85rem',

    '&:after': {
      content: '"|"',
      margin: '0 20px',
    },

    '&:last-child:after': {
      content: '""',
    },
    '@media (max-width: 1360px)': {
      '&:after': {
        content: '""',
      },
    },
  },
  label: {
    marginRight: '10px',
  },
}));
