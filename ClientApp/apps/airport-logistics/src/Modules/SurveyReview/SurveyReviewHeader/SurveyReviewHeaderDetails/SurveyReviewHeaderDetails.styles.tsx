import { makeStyles } from '@material-ui/core';

export const styles = makeStyles(({ palette }) => ({
  container: {
    display: 'flex',
    '@media (max-width: 1360px)': {
      display: 'grid',
      gridAutoFlow: 'row',
      gridTemplateColumns: 'repeat(2, auto)',
    },
  },
}));
